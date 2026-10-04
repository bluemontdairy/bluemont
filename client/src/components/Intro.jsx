'use client';

import { useEffect, useState } from 'react';
import styles from './Intro.module.css';

const DURATION = 2600;

export default function Intro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Both skip paths -- already played this session, or reduced motion -- are
    // hidden by CSS before first paint, so this only decides when to drop the
    // overlay from the tree and whether to hold the scroll while it plays.
    const seen = document.documentElement.dataset.introSeen === '1';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Record it for later loads only. Deliberately NOT stamping
    // dataset.introSeen here: the global rule keyed on that attribute is
    // `display: none !important`, so setting it now would hide the overlay
    // before a single frame of the zoom rendered. The inline script in the
    // layout stamps it from sessionStorage on the next load instead.
    try {
      sessionStorage.setItem('bm-intro', '1');
    } catch {}

    if (seen || reduced) {
      const skip = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(skip);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => setDone(true), DURATION);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    // The component returns null rather than unmounting, so the effect cleanup
    // above never fires -- release the scroll lock here instead.
    if (done) document.body.style.overflow = '';
  }, [done]);

  if (done) return null;

  return (
    <div className={`bm-intro ${styles.overlay}`} aria-hidden="true">
      <span className={styles.word}>BAELEYS</span>
    </div>
  );
}
