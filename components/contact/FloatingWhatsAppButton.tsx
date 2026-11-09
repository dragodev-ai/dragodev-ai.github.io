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
      data-glow-btn=""
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex min-h-[46px] min-w-[46px] items-center justify-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-600 p-3.5 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_36px_rgba(16,185,129,0.42)] transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF] xl:px-4 xl:py-3"
    >
      <MessageCircle className="h-4 w-4 shrink-0 fill-current" />
      <span className="hidden whitespace-nowrap xl:inline">WHATSAPP DEV</span>
    </a>
  );
}

