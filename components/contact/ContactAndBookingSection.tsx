'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  AlertTriangle,
} from 'lucide-react';
import {
  getWhatsappDeepLink,
  isStaticDeployment,
  profileContent,
  siteConfigContent,
  socialLinksContent,
} from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';

interface ApiStatusState {
  type: 'idle' | 'loading' | 'success' | 'unconfigured' | 'error';
  message: string;
  mailtoFallbackUrl?: string;
}

export function ContactAndBookingSection() {
  const { selectedEnquiryService } = useStudioExperience();

  // Contact Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [interestedService, setInterestedService] = useState(selectedEnquiryService);
  const [projectBudget, setProjectBudget] = useState(siteConfigContent.budgetRanges[0]);
  const [projectDescription, setProjectDescription] = useState('');
  const [preferredMeetingDate, setPreferredMeetingDate] = useState('');
  const [preferredMeetingTime, setPreferredMeetingTime] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [consent, setConsent] = useState(false);
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [contactStatus, setContactStatus] = useState<ApiStatusState>({
    type: 'idle',
    message: '',
  });

  // Sync service dropdown whenever user clicks a Service or Pricing package CTA!
  useEffect(() => {
    if (selectedEnquiryService) {
      setInterestedService(selectedEnquiryService);
    }
  }, [selectedEnquiryService]);

  // Booking Form State (Asia/Kolkata IST)
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookTopic, setBookTopic] = useState('Project Discovery & Scope Call');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('11:00 AM – 12:00 PM IST');
  const [bookNotes, setBookNotes] = useState('');
  const [bookConsent, setBookConsent] = useState(false);
  const [bookWebsite, setBookWebsite] = useState('');
  const [bookingStatus, setBookingStatus] = useState<ApiStatusState>({
    type: 'idle',
    message: '',
  });

  const configuredCalendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    siteConfigContent.booking.calendlyUrl ||
    siteConfigContent.booking.externalBookingUrl;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus({ type: 'loading', message: 'Dispatching your project enquiry...' });

    const staticMailto = `mailto:${profileContent.contact.email}?subject=${encodeURIComponent(
      `[DEV STUDIO Enquiry] ${interestedService} — ${fullName}`
    )}&body=${encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nPhone/WhatsApp: ${phoneWhatsapp}\nService: ${interestedService}\nBudget: ${projectBudget}\nPreferred Date/Time: ${preferredMeetingDate} ${preferredMeetingTime}\nReference: ${referenceLink}\n\nProject Brief:\n${projectDescription}`
    )}`;

    if (isStaticDeployment()) {
      setContactStatus({
        type: 'unconfigured',
        message:
          'Brief ready! Click below to send directly via Email (kumawatrishi096@gmail.com) or WhatsApp.',
        mailtoFallbackUrl: staticMailto,
      });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phoneWhatsapp,
          interestedService,
          projectBudget,
          projectDescription,
          preferredMeetingDate,
          preferredMeetingTime,
          referenceLink,
          consent,
          website: websiteHoneypot,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setContactStatus({
          type: 'success',
          message:
            data.message ||
            'Your enquiry has been sent to Dev Kumawat (kumawatrishi096@gmail.com).',
        });
        setFullName('');
        setEmail('');
        setPhoneWhatsapp('');
        setProjectDescription('');
        setReferenceLink('');
        setConsent(false);
        return;
      }

      if (data.code === 'EMAIL_PROVIDER_NOT_CONFIGURED') {
        setContactStatus({
          type: 'unconfigured',
          message: data.message,
          mailtoFallbackUrl: data.mailtoFallbackUrl,
        });
        return;
      }

      setContactStatus({
        type: 'error',
        message: data.message || 'Please check the form fields and try again.',
        mailtoFallbackUrl: data.mailtoFallbackUrl,
      });
    } catch {
      setContactStatus({
        type: 'error',
        message: 'Network error while submitting form. Please try again or reach out via WhatsApp.',
      });
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus({ type: 'loading', message: 'Sending your IST call request...' });

    const staticBookMailto = `mailto:${profileContent.contact.email}?subject=${encodeURIComponent(
      `[DEV STUDIO Call Request] ${bookTopic} — ${bookName}`
    )}&body=${encodeURIComponent(
      `Name: ${bookName}\nEmail: ${bookEmail}\nPhone/WhatsApp: ${bookPhone}\nTopic: ${bookTopic}\nPreferred IST Date/Time: ${bookDate} at ${bookTime} (Asia/Kolkata)\n\nNotes:\n${bookNotes}`
    )}`;

    if (isStaticDeployment()) {
      setBookingStatus({
        type: 'unconfigured',
        message:
          'Ready to schedule! Click below to send your IST call request directly via Email or WhatsApp.',
        mailtoFallbackUrl: staticBookMailto,
      });
      return;
    }

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: bookName,
          email: bookEmail,
          phoneWhatsapp: bookPhone,
          topic: bookTopic,
          preferredDate: bookDate,
          preferredTime: bookTime,
          timezone: 'Asia/Kolkata',
          notes: bookNotes,
          consent: bookConsent,
          website: bookWebsite,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setBookingStatus({
          type: 'success',
          message: data.message || 'Your call request has been sent to Dev Kumawat.',
        });
        setBookName('');
        setBookEmail('');
        setBookPhone('');
        setBookNotes('');
        setBookConsent(false);
        return;
      }

      if (data.code === 'EMAIL_PROVIDER_NOT_CONFIGURED') {
        setBookingStatus({
          type: 'unconfigured',
          message: data.message,
          mailtoFallbackUrl: data.mailtoFallbackUrl,
        });
        return;
      }

      setBookingStatus({
        type: 'error',
        message: data.message || 'Please review your call request fields.',
        mailtoFallbackUrl: data.mailtoFallbackUrl,
      });
    } catch {
      setBookingStatus({
        type: 'error',
        message: 'Network error while submitting call request.',
      });
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-24 border-t border-white/10 bg-[#070709] py-phi-4 sm:py-phi-5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Golden Ratio Section Header */}
        <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/10 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-phi-xs font-semibold uppercase text-purple-400">
              05 · STOP GAMBLING ON SLOW FREELANCERS
            </span>
            <h2
              id="contact-heading"
              className="font-display text-phi-xl font-extrabold uppercase text-white"
            >
              HIRE DEV NOW
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={socialLinksContent.mailtoUrl}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 font-mono text-xs text-zinc-200 transition hover:border-purple-400 hover:text-white active:scale-[0.98]"
            >
              <Mail className="h-3.5 w-3.5 text-purple-400" />
              {profileContent.contact.email}
            </a>
            <a
              href={getWhatsappDeepLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 font-mono text-xs text-emerald-300 transition hover:bg-emerald-600 hover:text-white active:scale-[0.98]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {profileContent.contact.phone}
            </a>
          </div>
        </div>

        {/* Golden Ratio Split: 1.618fr (61.8% Project Brief) : 1fr (38.2% IST Strategy Call) */}
        <div className="grid gap-phi-3 lg:grid-cols-[1.618fr_1fr]">
          {/* LEFT 61.8%: PROJECT ENQUIRY FORM */}
          <div className="rounded-3xl border border-white/12 bg-[#111116] p-6 sm:p-phi-3">
            <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
              SEND YOUR BRIEF
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Direct to <span className="text-zinc-200">{profileContent.contact.email}</span> —
              personal reply within hours.
            </p>

            <form
              onSubmit={handleContactSubmit}
              noValidate
              data-testid="contact-enquiry-form"
              className="mt-7 space-y-5"
            >
              {/* Anti-spam Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website-hp">Website</label>
                <input
                  id="contact-website-hp"
                  suppressHydrationWarning
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={websiteHoneypot}
                  onChange={(e) => setWebsiteHoneypot(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-fullname"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Full Name *
                  </label>
                  <input
                    id="contact-fullname"
                    name="fullName"
                    suppressHydrationWarning
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name or agency"
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    suppressHydrationWarning
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="contact-phone"
                    name="phoneWhatsapp"
                    suppressHydrationWarning
                    type="tel"
                    required
                    value={phoneWhatsapp}
                    onChange={(e) => setPhoneWhatsapp(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-service"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Interested Service *
                  </label>
                  <select
                    id="contact-service"
                    name="interestedService"
                    suppressHydrationWarning
                    data-testid="contact-service-select"
                    value={interestedService}
                    onChange={(e) => setInterestedService(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    {siteConfigContent.enquiryServiceOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#09090e]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="sm:col-span-2 xl:col-span-1">
                  <label
                    htmlFor="contact-budget"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Project Budget *
                  </label>
                  <select
                    id="contact-budget"
                    name="projectBudget"
                    suppressHydrationWarning
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    {siteConfigContent.budgetRanges.map((b) => (
                      <option key={b} value={b} className="bg-[#09090e]">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-date"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Preferred Meeting Date
                  </label>
                  <input
                    id="contact-date"
                    name="preferredMeetingDate"
                    suppressHydrationWarning
                    type="date"
                    value={preferredMeetingDate}
                    onChange={(e) => setPreferredMeetingDate(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-time"
                    className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                  >
                    Preferred Time (IST)
                  </label>
                  <input
                    id="contact-time"
                    name="preferredMeetingTime"
                    suppressHydrationWarning
                    type="text"
                    value={preferredMeetingTime}
                    onChange={(e) => setPreferredMeetingTime(e.target.value)}
                    placeholder="e.g. 4:00 PM IST"
                    className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-ref"
                  className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                >
                  Optional Reference Link (Drive, Instagram, YouTube, Brief)
                </label>
                <input
                  id="contact-ref"
                  name="referenceLink"
                  suppressHydrationWarning
                  type="url"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/15 bg-[#09090e] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-desc"
                  className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                >
                  Project Description *
                </label>
                <textarea
                  id="contact-desc"
                  name="projectDescription"
                  suppressHydrationWarning
                  rows={4}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Tell Dev about your deliverables, style direction, platform, and target timeline..."
                  className="w-full rounded-xl border border-white/15 bg-[#09090e] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-zinc-400">
                <input
                  type="checkbox"
                  name="consent"
                  suppressHydrationWarning
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  data-testid="contact-consent-checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-white/25 bg-[#09090e] accent-purple-600"
                />
                <span>
                  Use my details solely to respond to this project brief. Never shared or sold.
                </span>
              </label>

              {contactStatus.type !== 'idle' && (
                <div
                  role="status"
                  data-testid="contact-form-status"
                  className={`rounded-2xl border p-4 text-sm ${
                    contactStatus.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : contactStatus.type === 'unconfigured'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : contactStatus.type === 'error'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : 'border-white/15 bg-white/5 text-zinc-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {contactStatus.type === 'success' && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    )}
                    {(contactStatus.type === 'unconfigured' || contactStatus.type === 'error') && (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <div className="space-y-2">
                      <p>{contactStatus.message}</p>
                      {contactStatus.mailtoFallbackUrl && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href={contactStatus.mailtoFallbackUrl}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-mono text-xs font-bold text-zinc-950"
                          >
                            OPEN PRE-FILLED EMAIL
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <a
                            href={getWhatsappDeepLink(
                              `Hi Dev! I'm ${fullName || 'reaching out'} regarding ${interestedService}. ${projectDescription}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white"
                          >
                            SEND VIA WHATSAPP
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={contactStatus.type === 'loading'}
                data-testid="contact-submit-btn"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 font-condensed text-sm font-bold uppercase tracking-[0.22em] text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {contactStatus.type === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                CLAIM YOUR PRODUCTION SLOT
              </button>
            </form>
          </div>

          {/* RIGHT 38.2%: BOOK A CALL SECTION (Asia/Kolkata Timezone) */}
          <div
            id="book-call"
            data-testid="book-a-call-section"
            className="flex flex-col justify-between rounded-3xl border border-white/12 bg-[#111116] p-6 sm:p-phi-3"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                {siteConfigContent.booking.timezoneLabel}
              </div>

              <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                15-MIN STRATEGY CALL
              </h3>
              <p className="mt-2 text-sm leading-[1.618] text-zinc-400">
                {siteConfigContent.booking.modeNote}
              </p>

              {configuredCalendlyUrl ? (
                <div className="mt-6 space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#09090e]">
                    <iframe
                      src={configuredCalendlyUrl}
                      title="Schedule a call with Dev Kumawat"
                      className="h-[460px] w-full border-0"
                    />
                  </div>
                  <a
                    href={configuredCalendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-zinc-950"
                  >
                    OPEN SCHEDULER IN NEW TAB
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleBookingSubmit}
                  noValidate
                  data-testid="booking-request-form"
                  className="mt-6 space-y-4"
                >
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      suppressHydrationWarning
                      tabIndex={-1}
                      autoComplete="off"
                      value={bookWebsite}
                      onChange={(e) => setBookWebsite(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="book-name"
                      className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                    >
                      Your Name *
                    </label>
                    <input
                      id="book-name"
                      suppressHydrationWarning
                      type="text"
                      required
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="book-email"
                        className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                      >
                        Email *
                      </label>
                      <input
                        id="book-email"
                        suppressHydrationWarning
                        type="email"
                        required
                        value={bookEmail}
                        onChange={(e) => setBookEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="book-phone"
                        className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                      >
                        WhatsApp / Phone *
                      </label>
                      <input
                        id="book-phone"
                        suppressHydrationWarning
                        type="tel"
                        required
                        value={bookPhone}
                        onChange={(e) => setBookPhone(e.target.value)}
                        placeholder="+91..."
                        className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="book-date"
                        className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                      >
                        Preferred Date *
                      </label>
                      <input
                        id="book-date"
                        suppressHydrationWarning
                        type="date"
                        required
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="book-time"
                        className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                      >
                        Preferred Window (IST) *
                      </label>
                      <select
                        id="book-time"
                        suppressHydrationWarning
                        value={bookTime}
                        onChange={(e) => setBookTime(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="11:00 AM – 1:00 PM IST">11:00 AM – 1:00 PM IST</option>
                        <option value="2:00 PM – 5:00 PM IST">2:00 PM – 5:00 PM IST</option>
                        <option value="6:00 PM – 8:30 PM IST">6:00 PM – 8:30 PM IST</option>
                        <option value="Flexible — Coordinate via WhatsApp">
                          Flexible — Coordinate via WhatsApp
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="book-topic"
                      className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                    >
                      Call Topic *
                    </label>
                    <input
                      id="book-topic"
                      suppressHydrationWarning
                      type="text"
                      required
                      value={bookTopic}
                      onChange={(e) => setBookTopic(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="book-notes"
                      className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                    >
                      Agenda / Notes
                    </label>
                    <textarea
                      id="book-notes"
                      suppressHydrationWarning
                      rows={2}
                      value={bookNotes}
                      onChange={(e) => setBookNotes(e.target.value)}
                      placeholder="Optional context for our 15-minute discovery call..."
                      className="w-full rounded-xl border border-white/15 bg-[#09090e] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      suppressHydrationWarning
                      checked={bookConsent}
                      onChange={(e) => setBookConsent(e.target.checked)}
                      data-testid="booking-consent-checkbox"
                      className="mt-0.5 h-4 w-4 rounded accent-amber-500"
                    />
                    <span>Confirm call request in Asia/Kolkata (IST) timezone.</span>
                  </label>

                  {bookingStatus.type !== 'idle' && (
                    <div
                      role="status"
                      data-testid="booking-form-status"
                      className="rounded-2xl border border-white/15 bg-[#09090e] p-3.5 text-xs text-zinc-200"
                    >
                      <p>{bookingStatus.message}</p>
                      {bookingStatus.mailtoFallbackUrl && (
                        <a
                          href={bookingStatus.mailtoFallbackUrl}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 font-mono text-[11px] font-bold text-zinc-950"
                        >
                          CONFIRM SLOT VIA EMAIL →
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingStatus.type === 'loading'}
                    data-testid="booking-submit-btn"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-zinc-950 transition hover:bg-amber-300 active:scale-[0.98] disabled:opacity-60"
                  >
                    <Calendar className="h-4 w-4" />
                    LOCK IN STRATEGY CALL (IST)
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-zinc-400">
              Need an answer right now? Ping{' '}
              <a
                href={getWhatsappDeepLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
              >
                WhatsApp (+91 9309425465)
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
