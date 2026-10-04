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

  const scroll = (dir) => {
    const track = trackRef.current;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' });
  };

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
