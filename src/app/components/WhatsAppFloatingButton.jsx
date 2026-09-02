import React from 'react';

const WHATSAPP_NUMBER = '573102885693';
const WHATSAPP_MESSAGE = 'Hola, necesito ayuda con el sistema SITMI.';

export default function WhatsAppFloatingButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        right: '22px',
        bottom: '22px',
        width: '58px',
        height: '58px',
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 5px 18px rgba(0,0,0,.22)',
        zIndex: 9999,
        textDecoration: 'none',
        transition: 'transform .18s ease, box-shadow .18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 7px 22px rgba(0,0,0,.28)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 5px 18px rgba(0,0,0,.22)';
      }}
    >
      <svg
        width="31"
        height="31"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 3.2C8.93 3.2 3.2 8.82 3.2 15.75c0 2.44.72 4.72 1.96 6.63L3 29l6.84-2.07A12.9 12.9 0 0 0 16 28.3c7.07 0 12.8-5.62 12.8-12.55S23.07 3.2 16 3.2Z"
          fill="white"
        />
        <path
          d="M21.23 18.22c-.29-.14-1.69-.83-1.95-.92-.26-.1-.45-.14-.64.14-.19.29-.73.92-.89 1.11-.16.19-.33.22-.61.07-.29-.14-1.2-.43-2.28-1.37-.84-.73-1.41-1.63-1.57-1.9-.16-.29-.02-.44.12-.58.13-.13.29-.33.43-.49.14-.16.19-.28.29-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49h-.54c-.19 0-.49.07-.75.35-.26.29-.99.96-.99 2.34s1.01 2.71 1.15 2.9c.14.19 1.98 3.01 4.79 4.22.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.69-.69 1.93-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.54-.33Z"
          fill="#25D366"
        />
      </svg>
    </a>
  );
}
