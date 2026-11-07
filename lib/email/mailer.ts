import nodemailer from 'nodemailer';
import type { BookingRequestInput, ContactEnquiryInput } from '@/lib/validation/schemas';

const DEFAULT_RECIPIENT = 'kumawatrishi096@gmail.com';

export interface EmailSendOutcome {
  delivered: boolean;
  provider: 'resend' | 'smtp' | 'unconfigured';
  messageId?: string;
  missingEnv?: string[];
  error?: string;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isEmailTransportConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_PORT));
}

async function dispatchRawEmail(params: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendOutcome> {
  const fromAddress =
    process.env.EMAIL_FROM ||
    (process.env.SMTP_USER ? `"DEV STUDIO" <${process.env.SMTP_USER}>` : 'DEV STUDIO <onboarding@resend.dev>');

  // 1. Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        delivered: false,
        provider: 'resend',
        error: `Resend API responded with HTTP ${res.status}: ${errBody.slice(0, 240)}`,
      };
    }

    const data = (await res.json()) as { id?: string };
    return {
      delivered: true,
      provider: 'resend',
      messageId: data.id,
    };
  }

  // 2. Standard SMTP via Nodemailer
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const auth =
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth,
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: params.to,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    return {
      delivered: true,
      provider: 'smtp',
      messageId: info.messageId,
    };
  }

  return {
    delivered: false,
    provider: 'unconfigured',
    missingEnv: ['RESEND_API_KEY (or SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS)'],
  };
}

export async function sendContactEnquiryEmail(
  enquiry: ContactEnquiryInput
): Promise<EmailSendOutcome> {
  const recipient = process.env.CONTACT_EMAIL || DEFAULT_RECIPIENT;
  const subject = `[DEV STUDIO Enquiry] ${enquiry.interestedService} — ${enquiry.fullName}`;

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #070709; color: #f4f4f6; padding: 32px; border-radius: 16px;">
    <p style="letter-spacing: 0.2em; font-size: 11px; color: #a855f7; text-transform: uppercase; margin: 0 0 8px;">DEV STUDIO — NEW CLIENT ENQUIRY</p>
    <h1 style="font-size: 22px; margin: 0 0 24px; color: #ffffff;">${escapeHtml(enquiry.fullName)} — ${escapeHtml(enquiry.interestedService)}</h1>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 8px 0; color: #9ca3af; width: 180px;">Full Name</td><td style="padding: 8px 0; color: #ffffff;">${escapeHtml(enquiry.fullName)}</td></tr>
      <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #ffffff;">${escapeHtml(enquiry.email)}</td></tr>
      <tr><td style="padding: 8px 0; color: #9ca3af;">Phone / WhatsApp</td><td style="padding: 8px 0; color: #ffffff;">${escapeHtml(enquiry.phoneWhatsapp)}</td></tr>
      <tr><td style="padding: 8px 0; color: #9ca3af;">Interested Service</td><td style="padding: 8px 0; color: #ffffff;">${escapeHtml(enquiry.interestedService)}</td></tr>
      <tr><td style="padding: 8px 0; color: #9ca3af;">Project Budget</td><td style="padding: 8px 0; color: #ffffff;">${escapeHtml(enquiry.projectBudget)}</td></tr>
      <tr><td style="padding: 8px 0; color: #9ca3af;">Preferred Meeting</td><td style="padding: 8px 0; color: #ffffff;">${escapeHtml(enquiry.preferredMeetingDate || 'Not specified')} ${escapeHtml(enquiry.preferredMeetingTime || '')} (Asia/Kolkata)</td></tr>
      <tr><td style="padding: 8px 0; color: #9ca3af;">Reference Link</td><td style="padding: 8px 0; color: #ffffff;">${enquiry.referenceLink ? escapeHtml(enquiry.referenceLink) : 'None'}</td></tr>
    </table>
    <div style="margin-top: 20px; padding: 16px; background: #111116; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; text-transform: uppercase;">Project Brief</p>
      <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #f4f4f6;">${escapeHtml(enquiry.projectDescription)}</p>
    </div>
  </div>`;

  const text = [
    `DEV STUDIO — NEW CLIENT ENQUIRY`,
    `Full Name: ${enquiry.fullName}`,
    `Email: ${enquiry.email}`,
    `Phone / WhatsApp: ${enquiry.phoneWhatsapp}`,
    `Service: ${enquiry.interestedService}`,
    `Budget: ${enquiry.projectBudget}`,
    `Preferred Meeting (IST): ${enquiry.preferredMeetingDate || 'Not specified'} ${enquiry.preferredMeetingTime || ''}`,
    `Reference Link: ${enquiry.referenceLink || 'None'}`,
    ``,
    `Project Description:`,
    enquiry.projectDescription,
  ].join('\n');

  const outcome = await dispatchRawEmail({
    to: recipient,
    replyTo: enquiry.email,
    subject,
    html,
    text,
  });

  if (outcome.delivered && process.env.SEND_VISITOR_CONFIRMATION === 'true') {
    await dispatchRawEmail({
      to: enquiry.email,
      replyTo: recipient,
      subject: `We received your enquiry — DEV STUDIO (Dev Kumawat)`,
      html: `<div style="font-family: sans-serif; color: #111; line-height: 1.6;">
        <h2>Thanks for reaching out, ${escapeHtml(enquiry.fullName)}!</h2>
        <p>Dev Kumawat has received your project brief regarding <strong>${escapeHtml(enquiry.interestedService)}</strong> and will reply from <strong>${recipient}</strong> or WhatsApp shortly.</p>
        <p>— DEV STUDIO · Jaipur, Rajasthan, India</p>
      </div>`,
      text: `Hi ${enquiry.fullName},\n\nDev Kumawat has received your project enquiry regarding ${enquiry.interestedService} and will get back to you shortly.\n\n— DEV STUDIO (Jaipur, India)`,
    }).catch(() => undefined);
  }

  return outcome;
}

export async function sendBookingRequestEmail(
  booking: BookingRequestInput
): Promise<EmailSendOutcome> {
  const recipient = process.env.CONTACT_EMAIL || DEFAULT_RECIPIENT;
  const subject = `[DEV STUDIO Call Request] ${booking.preferredDate} @ ${booking.preferredTime} IST — ${booking.fullName}`;

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #070709; color: #f4f4f6; padding: 32px; border-radius: 16px;">
    <p style="letter-spacing: 0.2em; font-size: 11px; color: #f59e0b; text-transform: uppercase; margin: 0 0 8px;">DEV STUDIO — CALL BOOKING REQUEST</p>
    <h1 style="font-size: 22px; margin: 0 0 20px; color: #ffffff;">${escapeHtml(booking.fullName)} — ${escapeHtml(booking.topic)}</h1>
    <p style="font-size: 15px; color: #e5e7eb;"><strong>Requested Slot:</strong> ${escapeHtml(booking.preferredDate)} · ${escapeHtml(booking.preferredTime)} (${escapeHtml(booking.timezone || 'Asia/Kolkata')})</p>
    <p style="font-size: 14px; color: #d1d5db;"><strong>Email:</strong> ${escapeHtml(booking.email)}<br/><strong>Phone / WhatsApp:</strong> ${escapeHtml(booking.phoneWhatsapp)}</p>
    ${booking.notes ? `<p style="font-size: 14px; color: #d1d5db; white-space: pre-wrap;"><strong>Notes:</strong> ${escapeHtml(booking.notes)}</p>` : ''}
  </div>`;

  const text = [
    `DEV STUDIO — CALL BOOKING REQUEST`,
    `Name: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Phone / WhatsApp: ${booking.phoneWhatsapp}`,
    `Topic: ${booking.topic}`,
    `Preferred Date: ${booking.preferredDate}`,
    `Preferred Time: ${booking.preferredTime} (${booking.timezone || 'Asia/Kolkata'})`,
    `Notes: ${booking.notes || 'None'}`,
  ].join('\n');

  return dispatchRawEmail({
    to: recipient,
    replyTo: booking.email,
    subject,
    html,
    text,
  });
}
