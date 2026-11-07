import { NextRequest, NextResponse } from 'next/server';
import { bookingRequestSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/validation/rate-limit';
import { sendBookingRequestEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`booking:${ip}`, 5, 10 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: 'RATE_LIMITED',
        message: `Too many booking requests. Please wait ${limit.retryAfterSeconds}s or message Dev on WhatsApp.`,
      },
      { status: 429 }
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

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message || 'Please check your booking details.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      honeypotBlocked: true,
      message: 'Booking request processed.',
    });
  }

  try {
    const outcome = await sendBookingRequestEmail(parsed.data);
    if (!outcome.delivered) {
      const recipient = process.env.CONTACT_EMAIL || 'kumawatrishi096@gmail.com';
      const subject = encodeURIComponent(
        `Discovery Call Request (${parsed.data.preferredDate} ${parsed.data.preferredTime} IST) — ${parsed.data.fullName}`
      );
      const bodyText = encodeURIComponent(
        `Hi Dev,\n\nI'd love to schedule a call.\nName: ${parsed.data.fullName}\nEmail: ${parsed.data.email}\nPhone/WhatsApp: ${parsed.data.phoneWhatsapp}\nTopic: ${parsed.data.topic}\nPreferred Slot: ${parsed.data.preferredDate} at ${parsed.data.preferredTime} (${parsed.data.timezone})\nNotes: ${parsed.data.notes || 'None'}`
      );

      return NextResponse.json(
        {
          ok: false,
          delivered: false,
          code: outcome.provider === 'unconfigured' ? 'EMAIL_PROVIDER_NOT_CONFIGURED' : 'EMAIL_DELIVERY_FAILED',
          message:
            outcome.provider === 'unconfigured'
              ? 'Server email transport (RESEND_API_KEY or SMTP_HOST) is not configured yet. Confirm your call slot instantly via direct email or WhatsApp below.'
              : outcome.error || 'Booking email failed to send.',
          missingEnv: outcome.missingEnv,
          mailtoFallbackUrl: `mailto:${recipient}?subject=${subject}&body=${bodyText}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      delivered: true,
      provider: outcome.provider,
      messageId: outcome.messageId,
      message: `Your call request for ${parsed.data.preferredDate} (${parsed.data.preferredTime} IST) has been sent to Dev Kumawat.`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        code: 'SERVER_ERROR',
        message: `Unexpected booking error: ${(err as Error).message}`,
      },
      { status: 500 }
    );
  }
}

