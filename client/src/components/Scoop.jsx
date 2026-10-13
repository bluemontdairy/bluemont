import Image from 'next/image';

// The flavour scoop beside each monster: an uploaded scoop picture, or a
// drawn scoop with a drippy rim tinted per flavour. The shade
// gradient's id comes from the colour, so monsters sharing a colour share it.
const SCOOP_SHAPE =
  'M8 32a24 24 0 0 1 48 0c0 1-.1 2-.2 3 1.4 4-1.8 7-4.4 4.6-1.6 5.4-6.6 5-7.4.4-2.2 6.6-8.4 6.6-9.6 0-2 5.2-7.6 5-8.6-.2-1.6 4.2-6.6 3.6-6.8-1.4-3 1.4-5.6-1.6-4.2-4.4C8.1 33.4 8 32.7 8 32z';

export default function Scoop({ color, image, className }) {
  if (image) return <Image src={image} alt="" width={160} height={145} sizes="80px" className={className} />;
  const shade = `scoop-shade-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 64 58" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={shade} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <path d={SCOOP_SHAPE} fill={color} />
      <path d={SCOOP_SHAPE} fill={`url(#${shade})`} />
      <path
        d="M14 28c2-1 3 1 5 0M26 22c2-1 3 1 5 0M38 27c2-1 3 1 5 0M20 36c2-1 3 1 5 0M34 35c2-1 3 1 5 0"
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="18" rx="6" ry="3.2" fill="#fff" opacity="0.6" transform="rotate(-28 22 18)" />
    </svg>
  );
}
