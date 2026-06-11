import { useState, useRef, useEffect } from 'react';

const suggestions = [
  '¿Qué documentos necesito para el informe GC?',
  '¿Cuándo es la fecha límite de entrega?',
  '¿Cómo subo mis evidencias?',
  '¿Qué pasa si no entrego a tiempo?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu asistente virtual del SITMI. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre cómo completar informes, fechas de entrega, documentos requeridos y más.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Eres un asistente virtual del portal SITMI del SENA. Ayudas a instructores con dudas sobre informes GC y GF, fechas límite, documentos requeridos y uso del sistema. Responde siempre en español, de forma clara y concisa.',
          messages: [{ role: 'user', content: msg }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || '').join('') || 'Lo siento, no pude procesar tu consulta.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Ocurrió un error al conectar con el asistente. Por favor intenta de nuevo.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Inteligencia Artificial</span>
          <span style={{ marginLeft: 8, width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Asistente IA</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Pregúntame sobre informes, fechas límite y documentos requeridos</p>
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, flexShrink: 0 }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid #E8ECF0', background: '#fff', fontSize: 12, color: '#6B7280', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.borderColor = '#DDD6FE'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E8ECF0'; }}
          >{s}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✨</div>
            )}
            <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff', color: m.role === 'user' ? '#fff' : '#374151', fontSize: 13.5, lineHeight: 1.6, border: m.role === 'assistant' ? '1px solid #F0F2F5' : 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', whiteSpace: 'pre-wrap' }}>{m.text}</div>
            {m.role === 'user' && (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
            <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: '#fff', border: '1px solid #F0F2F5', fontSize: 13, color: '#9CA3AF' }}>Escribiendo...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Escribe tu pregunta..." style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8ECF0', fontSize: 13, color: '#374151', background: '#F7F9FC', outline: 'none', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#E8ECF0'}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', opacity: input.trim() && !loading ? 1 : 0.5, fontFamily: 'inherit' }}>Enviar</button>
      </div>
    </div>
  );
}