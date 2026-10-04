'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Fades [data-reveal] elements up as they enter the viewport. The hidden state
// only applies under html.reveal-ready, which is set here, so the content stays
// visible without JS and for users who prefer reduced motion.
//
// Revealed elements get a data-revealed attribute rather than a class: React
// rewrites className on re-render and would hide them again. Anything at or
// above the bottom of the viewport is revealed, so jumping past a section (an
// anchor link, End key) never leaves it invisible.
export default function ScrollReveal() {
  // Re-run on client navigation so a newly rendered page gets checked too.
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!document.querySelector('[data-reveal]')) return;
    document.documentElement.classList.add('reveal-ready');

    let frame = 0;
    const check = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) el.setAttribute('data-revealed', '');
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);

  return null;
}
