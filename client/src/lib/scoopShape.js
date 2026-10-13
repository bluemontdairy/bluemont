// The drawn flavour scoop (a scoop with a drippy rim), shared by the Scoop
// component and the monster seed, which renders it to a picture.

export const SCOOP_VIEWBOX = '0 0 64 58';
export const SCOOP_SHAPE =
  'M8 32a24 24 0 0 1 48 0c0 1-.1 2-.2 3 1.4 4-1.8 7-4.4 4.6-1.6 5.4-6.6 5-7.4.4-2.2 6.6-8.4 6.6-9.6 0-2 5.2-7.6 5-8.6-.2-1.6 4.2-6.6 3.6-6.8-1.4-3 1.4-5.6-1.6-4.2-4.4C8.1 33.4 8 32.7 8 32z';
export const SCOOP_TEXTURE = 'M14 28c2-1 3 1 5 0M26 22c2-1 3 1 5 0M38 27c2-1 3 1 5 0M20 36c2-1 3 1 5 0M34 35c2-1 3 1 5 0';

/** The drawn scoop as a standalone SVG file, `width` px wide. */
export const scoopSvg = (color, width = 640) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SCOOP_VIEWBOX}" width="${width}" height="${Math.round((width * 58) / 64)}">
<defs><radialGradient id="shade" cx="0.36" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></radialGradient></defs>
<path d="${SCOOP_SHAPE}" fill="${color}"/><path d="${SCOOP_SHAPE}" fill="url(#shade)"/>
<path d="${SCOOP_TEXTURE}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.6" stroke-linecap="round"/>
<ellipse cx="22" cy="18" rx="6" ry="3.2" fill="#fff" opacity="0.6" transform="rotate(-28 22 18)"/>
</svg>`;
