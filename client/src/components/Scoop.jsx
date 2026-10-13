import Image from 'next/image';
import { SCOOP_SHAPE, SCOOP_TEXTURE, SCOOP_VIEWBOX } from '../lib/scoopShape';

// The flavour scoop beside each monster: an uploaded scoop picture, or a
// drawn scoop with a drippy rim tinted per flavour. The shade
// gradient's id comes from the colour, so monsters sharing a colour share it.
export default function Scoop({ color, image, className }) {
  if (image) return <Image src={image} alt="" width={160} height={145} sizes="80px" className={className} />;
  const shade = `scoop-shade-${color.replace('#', '')}`;
  return (
    <svg viewBox={SCOOP_VIEWBOX} className={className} aria-hidden="true">
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
        d={SCOOP_TEXTURE}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="18" rx="6" ry="3.2" fill="#fff" opacity="0.6" transform="rotate(-28 22 18)" />
    </svg>
  );
}
