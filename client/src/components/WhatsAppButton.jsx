import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9770000000000';
  const defaultMessage = encodeURIComponent("Hi Blue Mont, I'd like to inquire about your products.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.fab}
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className={styles.icon}>
        <path d="M16 2a13.9 13.9 0 0 0-11.85 21.2l-2 5.95 6.1-2A13.88 13.88 0 1 0 16 2zm0 25.5a11.75 11.75 0 0 1-6-1.63l-.43-.25-4.47 1.45 1.48-4.36-.28-.45A11.88 11.88 0 1 1 16 27.5zm6.75-9.13c-.37-.19-2.2-.1-2.54-.15s-.6-.08-.85.3c-.25.37-.96 1.18-1.18 1.43s-.43.27-.8.08a9.8 9.8 0 0 1-2.9-1.8 10.8 10.8 0 0 1-2-2.5c-.21-.37-.02-.57.17-.75.17-.16.37-.43.56-.65.18-.21.25-.37.37-.6a.7.7 0 0 0-.03-.7c-.1-.19-.85-2.05-1.17-2.8-.3-.74-.62-.64-.85-.65h-.73c-.25 0-.66.1-.1 1.05s2.55 3.32 2.9 3.8 2.59 4.14 6.27 5.62a21 21 0 0 0 2.1.75c.9.29 1.7.25 2.34.15.7-.11 2.2-.9 2.5-1.77.3-.87.3-1.6.2-1.76-.08-.15-.3-.23-.67-.42z"></path>
      </svg>
    </a>
  );
}
