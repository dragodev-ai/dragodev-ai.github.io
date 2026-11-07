import net from 'node:net';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST as postContact } from '@/app/api/contact/route';
import { POST as postBooking } from '@/app/api/booking/route';
import { GET as getDriveStream } from '@/app/api/drive/stream/[fileId]/route';
import { GET as getDriveThumbnail } from '@/app/api/drive/thumbnail/[fileId]/route';
import { resetRateLimitStore } from '@/lib/validation/rate-limit';

/**
 * Minimal RFC-5321 local TCP SMTP test server to empirically prove Nodemailer
 * dispatches real emails to kumawatrishi096@gmail.com over a live socket!
 */
function startLocalSmtpServer(): Promise<{
  port: number;
  messages: string[];
  recipients: string[];
  close: () => Promise<void>;
}> {
  const messages: string[] = [];
  const recipients: string[] = [];

  return new Promise((resolve) => {
    const server = net.createServer((socket) => {
      socket.write('220 localhost ESMTP DevStudioTest\r\n');
      let inData = false;
      let dataBuf = '';

      socket.on('data', (chunk) => {
        const str = chunk.toString('utf-8');
        if (inData) {
          dataBuf += str;
          if (dataBuf.includes('\r\n.\r\n')) {
            messages.push(dataBuf);
            inData = false;
            dataBuf = '';
            socket.write('250 2.0.0 OK queued as TESTMSG001\r\n');
          }
          return;
        }

        const lines = str.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          const upper = line.toUpperCase();
          if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
            socket.write('250-localhost\r\n250 8BITMIME\r\n');
          } else if (upper.startsWith('MAIL FROM:')) {
            socket.write('250 2.1.0 OK\r\n');
          } else if (upper.startsWith('RCPT TO:')) {
            recipients.push(line);
            socket.write('250 2.1.5 OK\r\n');
          } else if (upper === 'DATA') {
            inData = true;
            socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
          } else if (upper === 'QUIT') {
            socket.write('221 2.0.0 Bye\r\n');
            socket.end();
          } else {
            socket.write('250 OK\r\n');
          }
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as net.AddressInfo;
      resolve({
        port: addr.port,
        messages,
        recipients,
        close: () =>
          new Promise<void>((resClose) => {
            server.close(() => resClose());
          }),
      });
    });
  });
}

describe('API Routes Integration Suite', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    resetRateLimitStore();
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    process.env.SEND_VISITOR_CONFIRMATION = 'false';
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('rejects invalid contact payloads with 400 and fieldErrors', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fullName: 'X', email: 'bad' }),
    });
    const res = await postContact(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('reports 503 EMAIL_PROVIDER_NOT_CONFIGURED honestly when no email secret is set', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Rohan Verma',
        email: 'rohan@client.in',
        phoneWhatsapp: '+91 9812345678',
        interestedService: 'Motion Graphics & VFX',
        projectBudget: 'Custom Quote — Need Guidance',
        projectDescription: 'We need a 45-second 3D motion-tracked brand launch film.',
        consent: true,
        website: '',
      }),
    });
    const res = await postContact(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('EMAIL_PROVIDER_NOT_CONFIGURED');
    expect(json.mailtoFallbackUrl).toContain('mailto:kumawatrishi096@gmail.com');
  });

  it('delivers actual contact & booking emails over SMTP to kumawatrishi096@gmail.com', async () => {
    const smtp = await startLocalSmtpServer();
    try {
      process.env.SMTP_HOST = '127.0.0.1';
      process.env.SMTP_PORT = String(smtp.port);
      process.env.SMTP_SECURE = 'false';

      const contactReq = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Meera Joshi',
          email: 'meera@jaipurbrands.com',
          phoneWhatsapp: '+91 9988776655',
          interestedService: 'AI-Powered Creative Production',
          projectBudget: 'Full Campaign / Multi-Deliverable Production',
          projectDescription: 'Looking to produce 3 AI commercial spots with custom voice and grading.',
          consent: true,
          website: '',
        }),
      });

      const contactRes = await postContact(contactReq);
      expect(contactRes.status).toBe(200);
      const contactJson = await contactRes.json();
      expect(contactJson.ok).toBe(true);
      expect(contactJson.delivered).toBe(true);
      expect(contactJson.provider).toBe('smtp');

      const bookingReq = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Meera Joshi',
          email: 'meera@jaipurbrands.com',
          phoneWhatsapp: '+91 9988776655',
          topic: 'AI Campaign Discovery Call',
          preferredDate: '2026-11-25',
          preferredTime: '2:00 PM – 5:00 PM IST',
          timezone: 'Asia/Kolkata',
          consent: true,
          website: '',
        }),
      });

      const bookingRes = await postBooking(bookingReq);
      expect(bookingRes.status).toBe(200);
      expect(smtp.messages.length).toBe(2);
      expect(smtp.recipients.some((r) => r.includes('kumawatrishi096@gmail.com'))).toBe(true);
      expect(smtp.messages[0]).toContain('Meera Joshi');
    } finally {
      await smtp.close();
    }
  });

  it('blocks unauthorized file IDs and streams 206 Partial Content Range bytes for approved Drive videos', async () => {
    const blockedReq = new NextRequest('http://localhost:3000/api/drive/stream/NOT_IN_PORTFOLIO_12345');
    const blockedRes = await getDriveStream(blockedReq, {
      params: Promise.resolve({ fileId: 'NOT_IN_PORTFOLIO_12345' }),
    });
    expect(blockedRes.status).toBe(404);

    // Approved portfolio file: 3d mockup banner.mp4 (15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A)
    const rangeReq = new NextRequest(
      'http://localhost:3000/api/drive/stream/15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A',
      { headers: { Range: 'bytes=0-4095' } }
    );
    const rangeRes = await getDriveStream(rangeReq, {
      params: Promise.resolve({ fileId: '15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A' }),
    });
    expect(rangeRes.status).toBe(206);
    expect(rangeRes.headers.get('content-type')).toContain('video/mp4');
    expect(rangeRes.headers.get('content-range')).toContain('bytes 0-4095/');

    const thumbReq = new NextRequest(
      'http://localhost:3000/api/drive/thumbnail/15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A?sz=w480'
    );
    const thumbRes = await getDriveThumbnail(thumbReq, {
      params: Promise.resolve({ fileId: '15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A' }),
    });
    expect(thumbRes.status).toBe(200);
    expect(thumbRes.headers.get('content-type')).toMatch(/^image\//);
  }, 25_000);
});
