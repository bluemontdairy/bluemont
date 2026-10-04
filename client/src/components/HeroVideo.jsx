'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroVideo.module.css';

// Muted looping background video with the reference's pause control. Autoplay
// is skipped for visitors who ask for reduced motion.
export default function HeroVideo({ src, poster }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // The button mirrors the element's own state, so it stays right however
    // playback changes (autoplay blocked, reduced motion, the toggle below).
    const sync = () => setPlaying(!video.paused);
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
    return () => {
      video.removeEventListener('play', sync);
      video.removeEventListener('pause', sync);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (video.paused) video.play();
    else video.pause();
  };

  return (
    <>
      <video
        ref={videoRef}
        className={styles.video}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}
