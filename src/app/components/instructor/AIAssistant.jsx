import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import apiClient from '../../../services/apiClient';

// Colores institucionales
const GREEN = '#39A900';
const GREEN_DARK = '#1F6B0A';
const ORANGE = '#FF7A00';
const WHATSAPP_GREEN = '#25D366';

// Enlace de WhatsApp: reemplaza el número (código de país + número, sin espacios ni "+")
// y opcionalmente agrega un mensaje predefinido en "text".
const WHATSAPP_LINK = 'https://wa.me/57XXXXXXXXXX?text=Hola%2C%20necesito%20ayuda%20con%20SITMI';

const suggestions = [
  '¿Qué documentos necesito para el informe GC?',
  '¿Cuándo es la fecha límite de entrega?',
  '¿Cómo subo mis evidencias?',
  '¿Qué pasa si no entrego a tiempo?',
];

const IconSparkle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 5.6L19.4 9.4 13.8 11.2 12 17l-1.8-5.8L4.6 9.4l5.6-1.8L12 2Z" />
    <path d="M19 15l.8 2.4L22.2 18.2 19.8 19l-.8 2.4-.8-2.4L15.8 18.2 18.2 17.4 19 15Z" />
  </svg>
);

const IconSend = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 3 18 9-18 9 4-9-4-9Z" />
  </svg>
);

const IconFAQ = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17h.01" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.2 2-2 2.6-.6.45-1 .9-1 1.9" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

// Ícono oficial de WhatsApp (glifo de teléfono dentro del globo de chat)
const IconWhatsApp = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      fill="currentColor"
      d="M12.01 2C6.48 2 2 6.45 2 11.95c0 1.88.52 3.64 1.43 5.15L2 22l5.05-1.32a10.05 10.05 0 0 0 4.96 1.31h.01c5.53 0 10.01-4.45 10.01-9.95C22.03 6.45 17.55 2 12.01 2Zm0 18.19h-.01a8.3 8.3 0 0 1-4.24-1.16l-.3-.18-3.15.82.84-3.06-.2-.32a8.2 8.2 0 0 1-1.27-4.4c0-4.55 3.72-8.24 8.31-8.24 2.22 0 4.31.86 5.88 2.42a8.14 8.14 0 0 1 2.43 5.83c0 4.55-3.72 8.29-8.29 8.29Z"
    />
    <path
      fill="currentColor"
      d="M17.02 14.32c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.6.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.13-.42-2.16-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.46-.82-2-.22-.53-.44-.46-.6-.47-.15-.01-.33-.01-.51-.01a.98.98 0 0 0-.71.33c-.24.27-.93.91-.93 2.22 0 1.3.96 2.57 1.1 2.75.13.18 1.9 2.9 4.6 4.07.64.28 1.14.44 1.53.56.64.2 1.23.17 1.7.1.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31Z"
    />
  </svg>
);

export default function AIAssistant() {
  const { colors, theme } = useTheme();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu asistente virtual del SITMI. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre cómo completar informes, fechas de entrega, documentos requeridos y más.', time: 'Ahora' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [waHover, setWaHover] = useState(false);
  const bottomRef = useRef(null);
  const faqRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (!showFaq) return;
    const onClickOutside = (e) => {
      if (faqRef.current && !faqRef.current.contains(e.target)) setShowFaq(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showFaq]);

  const timeNow = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setShowFaq(false);
    setMessages(prev => [...prev, { role: 'user', text: msg, time: timeNow() }]);
    setLoading(true);
    try {
      const { data } = await apiClient.post('/usuario/chat', { message: msg });
      const reply = data.reply || 'Lo siento, no pude procesar tu consulta.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply, time: timeNow() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Ocurrió un error al conectar con el asistente. Por favor intenta de nuevo.', time: timeNow() }]);
    }
    setLoading(false);
  };

  return (
    <div className="ai-root" style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        .ai-root, .ai-root *, .ai-root *::before, .ai-root *::after { box-sizing: border-box; }
        .ai-banner { padding: 26px 30px; border-radius: 18px; }
        .ai-banner-title { font-size: 23px; }
        .ai-bubble-wrap { max-width: 72%; }
        .ai-avatar { width: 34px; height: 34px; }
        .ai-input-bar { padding: 8px; gap: 10px; }
        .ai-input-field { padding: 10px 14px; font-size: 13px; }
        .ai-send-btn { padding: 10px 20px; font-size: 13px; }
        .ai-send-btn span.ai-send-label { display: inline; }
        .ai-faq-panel { max-height: 260px; overflow-y: auto; }
        .ai-whatsapp-btn { width: 62px; height: 62px; }

        @media (max-width: 640px) {
          .ai-banner { padding: 18px 16px !important; border-radius: 14px !important; }
          .ai-banner-title { font-size: 19px !important; }
          .ai-bubble-wrap { max-width: 88% !important; }
          .ai-avatar { width: 28px !important; height: 28px !important; }
          .ai-input-bar { padding: 6px !important; gap: 6px !important; }
          .ai-send-btn { padding: 10px 14px !important; }
          .ai-send-btn span.ai-send-label { display: none; }
          .ai-faq-btn { width: 34px !important; height: 34px !important; }
          .ai-faq-item { font-size: 12.5px !important; padding: 8px 9px !important; }
          .ai-whatsapp-btn { width: 50px !important; height: 50px !important; }
        }
      `}</style>

      {/* Encabezado fijo: banner + sugerencias quedan estáticos al hacer scroll */}
      <div className="ai-sticky-header" style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: colors.bg || colors.card,
        flexShrink: 0,
      }}>
        {/* Banner */}
        <div className="ai-banner" style={{
          background: `linear-gradient(155deg, ${GREEN_DARK} 0%, ${GREEN} 62%, #4CBB10 100%)`,
          marginBottom: 4, color: '#fff',
          position: 'relative', overflow: 'visible',
          boxShadow: '0 12px 32px -8px rgba(31,107,10,0.45)',
        }}>
          {/* Capa decorativa recortada (textura + acento inferior), separada para que el
              badge de WhatsApp pueda sobresalir del borde sin ser recortado */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}>
            {/* textura de puntos sutil */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.5,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
              backgroundSize: '15px 15px',
              maskImage: 'linear-gradient(115deg, rgba(0,0,0,0.9) 0%, transparent 55%)',
              WebkitMaskImage: 'linear-gradient(115deg, rgba(0,0,0,0.9) 0%, transparent 55%)',
            }} />
            {/* acento institucional inferior */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: `linear-gradient(90deg, ${ORANGE} 0%, rgba(255,122,0,0) 60%)` }} />
          </div>

          {/* Insignia flotante de WhatsApp: ubicada en el lado derecho del banner,
              centrada verticalmente respecto a toda la altura del banner (no pegada
              a una esquina ni a un borde). Cambia WHATSAPP_LINK (arriba del archivo)
              por tu número real. */}
          <div style={{ position: 'absolute', top: '50%', right: 24, transform: 'translateY(-50%)', zIndex: 5 }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              {/* Anillo de brillo pulsante: infinito pero con una pausa larga
                  entre pulsos (ciclo de 7s, animación visible ~2.4s) para que la llamada
                  de atención se mantenga en el tiempo sin resultar molesta. */}
              <span aria-hidden="true" style={{
                position: 'absolute', inset: -3, borderRadius: 999,
                background: WHATSAPP_GREEN, opacity: 0.45,
                animation: 'waGlowPulse 7s ease-out infinite',
                pointerEvents: 'none',
              }} />

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="ai-whatsapp-btn"
                title="Escríbenos por WhatsApp"
                aria-label="Contactar por WhatsApp"
                onMouseEnter={() => setWaHover(true)}
                onMouseLeave={() => setWaHover(false)}
                style={{
                  position: 'relative', zIndex: 1,
                  height: 62, minWidth: 62,
                  width: waHover ? 'auto' : 62,
                  borderRadius: 999,
                  padding: waHover ? '0 22px 0 16px' : 0,
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(255,255,255,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: waHover ? 'flex-start' : 'center', gap: 9,
                  color: WHATSAPP_GREEN,
                  boxShadow: waHover ? '0 10px 24px -4px rgba(0,0,0,0.45)' : '0 6px 16px -4px rgba(0,0,0,0.35)',
                  transition: 'width .28s cubic-bezier(.4,0,.2,1), padding .28s cubic-bezier(.4,0,.2,1), box-shadow .2s ease, transform .2s ease',
                  transform: waHover ? 'scale(1.05)' : 'scale(1)',
                  textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
                }}
              >
                <span style={{ position: 'relative', flexShrink: 0, display: 'flex' }}>
                  <IconWhatsApp size={32} />
                  {/* Indicador "en línea" estilo widget de chat */}
                  <span aria-hidden="true" style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: '#22c55e', border: '2px solid #fff',
                  }} />
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.01em',
                  maxWidth: waHover ? 140 : 0,
                  opacity: waHover ? 1 : 0,
                  transition: 'max-width .28s cubic-bezier(.4,0,.2,1), opacity .18s ease',
                }}>
                  Escríbenos
                </span>
              </a>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginTop: 30, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSparkle size={13} />
            </div>
            <span style={{ fontSize: 12, opacity: 0.92, fontWeight: 700, letterSpacing: '0.08em' }}>INTELIGENCIA ARTIFICIAL</span>
            <span style={{ position: 'relative', width: 6, height: 6, marginLeft: 2 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#bbf7d0', animation: 'aiPulseRing 2s infinite' }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#bbf7d0' }} />
            </span>
          </div>
          <h2 className="ai-banner-title" style={{ position: 'relative', margin: '0 0 6px', fontWeight: 800, letterSpacing: '-0.5px' }}>Asistente IA</h2>
          <p style={{ position: 'relative', margin: 0, fontSize: 13.5, opacity: 0.92, maxWidth: 480, lineHeight: 1.5 }}>Pregúntame sobre informes, fechas límite y documentos requeridos</p>
        </div>
      </div>

      {/* Messages (solo la conversación tiene scroll) */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16, minHeight: 0, padding: '4px 2px' }}>

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
            {m.role === 'assistant' && (
              <div className="ai-avatar" style={{ borderRadius: 10, background: `linear-gradient(155deg, ${GREEN}, ${GREEN_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 3px 10px -2px rgba(57,169,0,0.45)' }}>
                <IconSparkle size={15} />
              </div>
            )}
            <div className="ai-bubble-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? `linear-gradient(155deg, ${GREEN}, ${GREEN_DARK})` : colors.card,
                color: m.role === 'user' ? '#fff' : colors.text,
                fontSize: 13.5, lineHeight: 1.65,
                border: m.role === 'user' ? 'none' : `1px solid ${colors.border}`,
                boxShadow: m.role === 'user' ? '0 4px 14px -4px rgba(31,107,10,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
                whiteSpace: 'pre-wrap',
              }}>{m.text}</div>
              <span style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 5, padding: '0 4px', letterSpacing: '0.02em' }}>{m.time}</span>
            </div>
            {m.role === 'user' && (
              <div className="ai-avatar" style={{ borderRadius: 10, background: colors.bgAlt, border: `1px solid ${colors.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, letterSpacing: '0.02em', color: colors.textSecondary, flexShrink: 0 }}>TÚ</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="ai-avatar" style={{ borderRadius: 10, background: `linear-gradient(155deg, ${GREEN}, ${GREEN_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 3px 10px -2px rgba(57,169,0,0.45)' }}>
              <IconSparkle size={15} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '14px 16px', borderRadius: '16px 16px 16px 4px', background: colors.card, border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {[0, 1, 2].map(d => (
                <span key={d} style={{
                  width: 6, height: 6, borderRadius: '50%', background: GREEN,
                  animation: `aiDotBounce 1.1s ${d * 0.15}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div ref={faqRef} style={{ position: 'relative', flexShrink: 0 }}>

        {/* Panel de preguntas frecuentes */}
        {showFaq && (
          <div className="ai-faq-panel" style={{
            position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, right: 0,
            background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14,
            padding: 8, boxShadow: '0 -8px 28px -6px rgba(0,0,0,0.22)',
            display: 'flex', flexDirection: 'column', gap: 2, zIndex: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px 8px', color: colors.textFaint, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', borderBottom: `1px solid ${colors.border}`, marginBottom: 4 }}>
              <IconFAQ size={13} /> PREGUNTAS FRECUENTES
            </div>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="ai-faq-item"
                onClick={() => send(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  textAlign: 'left', borderRadius: 10, border: 'none',
                  background: 'transparent', color: colors.text,
                  padding: '9px 10px', fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'background .15s, color .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(57,169,0,0.15)' : '#F0FDF4'; e.currentTarget.style.color = GREEN_DARK; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text; }}
              >
                <span style={{ color: GREEN, fontSize: 15, lineHeight: 1, flexShrink: 0 }}>›</span>
                {s}
              </button>
            ))}
          </div>
        )}

        <div
          className="ai-input-bar"
          style={{
            display: 'flex', background: colors.card, borderRadius: 16,
            border: `1px solid ${inputFocused ? GREEN : colors.border}`,
            boxShadow: inputFocused ? `0 0 0 3px ${theme === 'dark' ? 'rgba(57,169,0,0.18)' : 'rgba(57,169,0,0.12)'}` : '0 2px 10px rgba(0,0,0,0.05)',
            transition: 'border-color .15s, box-shadow .15s',
          }}
        >
          <button
            type="button"
            className="ai-faq-btn"
            onClick={() => setShowFaq(v => !v)}
            title="Preguntas frecuentes"
            aria-label="Preguntas frecuentes"
            style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${showFaq ? GREEN : colors.border}`,
              background: showFaq ? (theme === 'dark' ? 'rgba(57,169,0,0.15)' : '#F0FDF4') : 'transparent',
              color: showFaq ? GREEN_DARK : colors.textSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            <IconFAQ />
          </button>
          <input
            className="ai-input-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Escribe tu pregunta..."
            style={{ flex: 1, borderRadius: 10, border: 'none', color: colors.text, background: 'transparent', outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
          />
          <button
            className="ai-send-btn"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              borderRadius: 10, border: 'none',
              background: `linear-gradient(155deg, ${GREEN}, ${GREEN_DARK})`,
              color: '#fff', fontWeight: 700,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !loading ? 1 : 0.45,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: input.trim() && !loading ? '0 3px 10px -3px rgba(31,107,10,0.5)' : 'none',
              transition: 'opacity .15s, box-shadow .15s', flexShrink: 0,
            }}
          >
            <span className="ai-send-label">Enviar</span> <IconSend />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes aiDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes aiPulseRing {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes waGlowPulse {
          0% { transform: scale(1); opacity: 0.45; }
          25% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
}