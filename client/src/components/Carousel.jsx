'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Carousel.module.css';

// Scroll-snap track with the reference's yellow round arrows. Native scrolling
// does the work, so touch swipes and keyboard scrolling behave normally.
export default function Carousel({ children, label, className = '', trackClassName = '' }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setAtStart(track.scrollLeft <= 4);
      setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const animRef = useRef(0);
  const finishRef = useRef(0);

  // Glide to the next card boundary instead of scrollBy: with snap on, a
  // native smooth scroll gets re-snapped mid-flight and lurches. Snap is
  // paused while the eased animation runs and restored at the end.
  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    cancelAnimationFrame(animRef.current);
    clearTimeout(finishRef.current);

    const start = track.scrollLeft;
    const max = track.scrollWidth - track.clientWidth;
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const trackLeft = track.getBoundingClientRect().left;
    const stops = [...track.children].map((el) => el.getBoundingClientRect().left - trackLeft + start - pad);
    const aim = start + dir * track.clientWidth * 0.8;
    const ahead = stops.filter((x) => (dir > 0 ? x > start + 4 : x < start - 4));
    if (!ahead.length) return;
    const nearest = ahead.reduce((a, b) => (Math.abs(b - aim) < Math.abs(a - aim) ? b : a));
    const target = Math.max(0, Math.min(max, nearest));
    const distance = target - start;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.scrollLeft = target;
      return;
    }

    const duration = Math.min(750, Math.max(420, Math.abs(distance) * 0.9));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const t0 = performance.now();
    track.style.scrollSnapType = 'none';

    const finish = () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(finishRef.current);
      animRef.current = 0;
      track.scrollLeft = target;
      track.style.scrollSnapType = '';
    };
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      if (t >= 1) return finish();
      track.scrollLeft = start + distance * ease(t);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    // Browsers pause animation frames in background tabs; land the move anyway
    // so the track never stays half-scrolled with snapping switched off.
    finishRef.current = setTimeout(finish, duration + 150);
  };

  // A swipe or wheel mid-glide hands control back to the user.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const stop = () => {
      if (!animRef.current) return;
      cancelAnimationFrame(animRef.current);
      clearTimeout(finishRef.current);
      animRef.current = 0;
      track.style.scrollSnapType = '';
    };
    track.addEventListener('pointerdown', stop);
    track.addEventListener('wheel', stop, { passive: true });
    track.addEventListener('touchstart', stop, { passive: true });
    return () => {
      stop();
      track.removeEventListener('pointerdown', stop);
      track.removeEventListener('wheel', stop);
      track.removeEventListener('touchstart', stop);
    };
  }, []);

  return (
    <div className={`${styles.carousel} ${className}`}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.prev}`}
        onClick={() => scroll(-1)}
        disabled={atStart}
        aria-label={`Previous ${label}`}
      >
        <Chevron dir="left" />
      </button>
      <ul ref={trackRef} className={`${styles.track} ${trackClassName}`} aria-label={label} tabIndex={0}>
        {children}
      </ul>
      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        onClick={() => scroll(1)}
        disabled={atEnd}
        aria-label={`Next ${label}`}
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
