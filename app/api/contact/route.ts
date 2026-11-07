import { NextRequest, NextResponse } from 'next/server';
import { contactEnquirySchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/validation/rate-limit';
import { sendContactEnquiryEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: 'RATE_LIMITED',
        message: `Too many requests. Please wait ${limit.retryAfterSeconds}s or message Dev directly on WhatsApp.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: 'INVALID_JSON', message: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const parsed = contactEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message || 'Please check the highlighted form fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // Honeypot trap: silently neutralize bots without sending spam email
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      honeypotBlocked: true,
      message: 'Request processed.',
    });
  }

  try {
    const outcome = await sendContactEnquiryEmail(parsed.data);

    if (!outcome.delivered) {
      const recipient = process.env.CONTACT_EMAIL || 'kumawatrishi096@gmail.com';
      const mailtoSubject = encodeURIComponent(
        `Project Enquiry: ${parsed.data.interestedService} — ${parsed.data.fullName}`
      );
      const mailtoBody = encodeURIComponent(
        `Hi Dev,\n\nName: ${parsed.data.fullName}\nEmail: ${parsed.data.email}\nPhone/WhatsApp: ${parsed.data.phoneWhatsapp}\nService: ${parsed.data.interestedService}\nBudget: ${parsed.data.projectBudget}\nPreferred Meeting (IST): ${parsed.data.preferredMeetingDate || 'Flexible'} ${parsed.data.preferredMeetingTime || ''}\nReference: ${parsed.data.referenceLink || 'None'}\n\nProject Brief:\n${parsed.data.projectDescription}`
      );

      return NextResponse.json(
        {
          ok: false,
          delivered: false,
          code: outcome.provider === 'unconfigured' ? 'EMAIL_PROVIDER_NOT_CONFIGURED' : 'EMAIL_DELIVERY_FAILED',
          message:
            outcome.provider === 'unconfigured'
              ? 'Server email transport (RESEND_API_KEY or SMTP_HOST) is not configured in this environment yet. Use the instant direct email or WhatsApp button below to reach Dev immediately.'
              : outcome.error || 'Email transport encountered an error.',
          missingEnv: outcome.missingEnv,
          mailtoFallbackUrl: `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      delivered: true,
      provider: outcome.provider,
      messageId: outcome.messageId,
      message:
        'Your project brief has been delivered directly to Dev Kumawat (kumawatrishi096@gmail.com). Expect a personal response within 24 hours.',
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        code: 'SERVER_ERROR',
        message: `Unexpected server error while dispatching email: ${(err as Error).message}`,
      },
      { status: 500 }
    );
  }
}
