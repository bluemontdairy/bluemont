import Image from 'next/image';

// Renders one site media slot (from getSiteMedia()) with its own size, or
// nothing when the slot is empty. Works in server and client components.
export default function SiteImage({ media, alt = '', ...props }) {
  if (!media?.src || media.kind === 'video') return null;
  return <Image src={media.src} alt={alt} width={media.w} height={media.h} {...props} />;
}
