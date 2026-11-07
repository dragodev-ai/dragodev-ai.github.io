'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsappDeepLink } from '@/lib/content';

export function FloatingWhatsAppButton() {
  const whatsappHref = getWhatsappDeepLink();

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Dev Kumawat on WhatsApp (+91 9309425465)"
      data-testid="floating-whatsapp-btn"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-600 px-4 py-3 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_36px_rgba(16,185,129,0.42)] transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
    >
      <MessageCircle className="h-4 w-4 fill-current" />
      <span className="hidden sm:inline">WHATSAPP DEV</span>
    </a>
  );
}
