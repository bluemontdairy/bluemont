'use client';

import { usePathname } from 'next/navigation';

// Renders the public site's header, footer, intro and WhatsApp button
// everywhere except the admin panel, which has its own chrome.
export default function PublicChrome({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return children;
}
