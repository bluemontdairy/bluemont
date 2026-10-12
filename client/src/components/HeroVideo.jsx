'use client';

import { useEffect, useRef, useState } from 'react';
import { cldTransform } from '../lib/media';
import styles from './HeroVideo.module.css';

// Cloudinary renditions by viewport width. A phone gets a 720p VP9 file of
// about 0.7 MB instead of the 4 MB 1080p master. MP4 is the fallback for
// browsers without VP9 (older Safari).
const RENDITIONS = [
  { maxWidth: 640, t: 'q_auto:eco,w_720,c_limit' },
  { maxWidth: 1280, t: 'q_auto:eco,w_1280,c_limit' },
  { maxWidth: Infinity, t: 'q_auto,w_1920,c_limit' },
];

function sourcesFor(src) {
  const width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5);
  const { t } = RENDITIONS.find((r) => width <= r.maxWidth);
  const base = cldTransform(src, t);
  if (base === src) return [{ src }];
  return [
    { src: cldTransform(src, `vc_vp9,${t}`).replace(/\.[a-z0-9]+$/i, '.webm'), type: 'video/webm' },
    { src: base.replace(/\.[a-z0-9]+$/i, '.mp4'), type: 'video/mp4' },
  ];
}

// Muted looping background video with the reference's pause control. The
// poster paints first. The video is fetched only after the page has loaded,
// so it never competes with the headline and images. Visitors who ask for
// reduced motion or reduced data get the poster until they press play.
export default function HeroVideo({ src, poster }) {
  const videoRef = useRef(null);
  const [sources, setSources] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // The button mirrors the element's own state, so it stays right however
    // playback changes (autoplay blocked, the toggle below).
    const sync = () => setPlaying(!video.paused);
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    let idle = 0;
    const start = () => {
      idle = (window.requestIdleCallback || setTimeout)(() => setSources(sourcesFor(src)));
    };
    if (!reduced && !saveData) {
      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start, { once: true });
    }
    return () => {
      video.removeEventListener('play', sync);
      video.removeEventListener('pause', sync);
      window.removeEventListener('load', start);
      (window.cancelIdleCallback || clearTimeout)(idle);
    };
  }, [src]);

  const toggle = () => {
    const video = videoRef.current;
    if (!sources) setSources(sourcesFor(src));
    else if (video.paused) video.play();
    else video.pause();
  };

  return (
    <>
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        // With no sources yet, autoplay waits; adding the <source> children
        // starts the browser's own source selection, and playback with it.
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      >
        {sources?.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
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
