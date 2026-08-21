import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '../../../ThemeContext';
import apiClient from '../../../services/apiClient';
import { enviarMensajeZoe } from '../../../services/zoeService';

// Colores institucionales — los mismos tonos que ya usa el resto del
// panel (sidebar del Coordinador): verdes forestales profundos y naranja
// quemado como acento, en vez de un verde saturado tipo "marca genérica".
const GREEN_DARK = '#14532d';
const GREEN = '#166534';
const GREEN_MID = '#15803d';
const GREEN_SOFT = '#16a34a';
const ORANGE = '#c2410c';
const ORANGE_MID = '#ea580c';
const ORANGE_SOFT = '#f97316';

// Extensiones aceptadas para evidencia GC
const ACCEPTED_EXT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
const MAX_SIZE_MB = 20;

// Sugerencias rápidas para el estado vacío del chat
const QUICK_PROMPTS = [
  { label: 'Subir una evidencia', action: 'upload' },
  { label: '¿Qué formatos acepta?', action: 'text', value: '¿Qué formatos de archivo acepta el sistema y cuál es el tamaño máximo?' },
  { label: '¿Cómo va mi cumplimiento?', action: 'text', value: '¿Cómo va mi cumplimiento de evidencias GC este mes?' },
];

// Paleta clara/oscura, alineada con los tonos activos del sidebar
// (rgba(21,128,61,..) / #F0FDF4 en claro, #4ADE80 en oscuro) para que todo
// el panel se sienta como un mismo sistema, no como piezas sueltas.
const PALETTES = {
  light: {
    headerBg: '#F0FDF4',
    headerBorder: '#BBF7D0',
    headerText: GREEN_DARK,
    headerSubText: 'rgba(20,83,45,0.72)',
    headerShadow: '0 6px 18px -14px rgba(20,83,45,0.3)',
    topBar: `linear-gradient(90deg, ${GREEN_MID}, ${ORANGE_MID})`,
    eyebrowBg: 'rgba(21,128,61,0.1)',
    eyebrowBorder: 'rgba(21,128,61,0.22)',
    eyebrowIcon: GREEN_MID,
    liveDot: GREEN_SOFT,
    userBubbleBg: `linear-gradient(135deg, ${GREEN_MID} 0%, ${GREEN_DARK} 100%)`,
    userBubbleText: '#FFFFFF',
    assistantAvatarBg: '#F0FDF4',
    assistantAvatarIcon: GREEN_MID,
    assistantAvatarBorder: '#BBF7D0',
    sendBg: `linear-gradient(135deg, ${GREEN_MID} 0%, ${GREEN_DARK} 100%)`,
    sendIcon: '#FFFFFF',
    quickHoverBg: '#F0FDF4',
    quickHoverBorder: GREEN_MID,
    quickHoverText: GREEN_DARK,
    dragOverlayBg: 'rgba(240,253,244,0.94)',
    dragBorder: GREEN_MID,
    dragIconBg: `linear-gradient(135deg, ${GREEN_MID}, ${GREEN_DARK})`,
    dragIconColor: '#FFFFFF',
    composerShadow: '0 8px 20px -16px rgba(20,83,45,0.25)',
    watermark: 'rgba(21,128,61,0.06)',
    stampRing: GREEN_MID,
  },
  dark: {
    headerBg: 'rgba(21,128,61,0.16)',
    headerBorder: 'rgba(74,222,128,0.25)',
    headerText: '#4ADE80',
    headerSubText: 'rgba(226,255,234,0.72)',
    headerShadow: '0 10px 26px -16px rgba(0,0,0,0.5)',
    topBar: `linear-gradient(90deg, ${GREEN_SOFT}, ${ORANGE_SOFT})`,
    eyebrowBg: 'rgba(74,222,128,0.12)',
    eyebrowBorder: 'rgba(74,222,128,0.3)',
    eyebrowIcon: '#4ADE80',
    liveDot: '#4ADE80',
    userBubbleBg: `linear-gradient(135deg, ${GREEN_SOFT} 0%, ${GREEN_MID} 100%)`,
    userBubbleText: '#FFFFFF',
    assistantAvatarBg: 'rgba(21,128,61,0.22)',
    assistantAvatarIcon: '#4ADE80',
    assistantAvatarBorder: 'rgba(74,222,128,0.35)',
    sendBg: `linear-gradient(135deg, ${GREEN_SOFT} 0%, ${GREEN_MID} 100%)`,
    sendIcon: '#FFFFFF',
    quickHoverBg: 'rgba(21,128,61,0.18)',
    quickHoverBorder: '#4ADE80',
    quickHoverText: '#4ADE80',
    dragOverlayBg: 'rgba(6,20,13,0.75)',
    dragBorder: '#4ADE80',
    dragIconBg: `linear-gradient(135deg, ${GREEN_SOFT}, ${GREEN_MID})`,
    dragIconColor: '#FFFFFF',
    composerShadow: '0 10px 26px -16px rgba(0,0,0,0.5)',
    watermark: 'rgba(74,222,128,0.07)',
    stampRing: '#4ADE80',
  },
};

/* ---------------------------- Íconos ---------------------------- */

const IconSparkle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 5.6L19.4 9.4 13.8 11.2 12 17l-1.8-5.8L4.6 9.4l5.6-1.8L12 2Z" />
    <path d="M19 15l.8 2.4L22.2 18.2 19.8 19l-.8 2.4-.8-2.4L15.8 18.2 18.2 17.4 19 15Z" />
  </svg>
);

const IconUpload = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFile = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconAlert = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconX = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPaperclip = ({ size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.67 3.67 0 0 1 5.19 5.19l-9.2 9.19a1.83 1.83 0 0 1-2.59-2.59l8.49-8.48" />
  </svg>
);

const IconSend = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none" />
  </svg>
);

const IconPlus = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconHistory = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 2.64-6.36" />
    <polyline points="3 4 3 10 9 10" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);

const IconTrash = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);


/* ---------------------------- Utilidades ---------------------------- */

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `m-${Date.now()}-${idCounter}`;
}

// Historial de conversaciones — se guarda en localStorage del navegador,
// así que persiste entre sesiones sin necesitar backend adicional.
const HISTORY_KEY = 'sena-ai-assistant-history';

function loadConversations() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // Si el navegador bloquea localStorage (modo incógnito estricto, etc.)
    // simplemente no persistimos; el chat sigue funcionando en memoria.
  }
}

function deriveTitle(msgs) {
  const firstUser = msgs.find((m) => m.role === 'user');
  if (!firstUser) return 'Nueva conversación';
  if (firstUser.text) return firstUser.text.length > 46 ? `${firstUser.text.slice(0, 46)}…` : firstUser.text;
  if (firstUser.file) return `Evidencia: ${firstUser.file.name}`;
  return 'Nueva conversación';
}

function formatRelativeDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (sameDay) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  if (isYesterday) return 'Ayer';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

/* ---------------------- Firma visual: emblema y sello ---------------------- */
// El encabezado lleva un emblema abstracto (una hoja/llama estilizada, en
// alusión a la formación SENA) como marca de agua discreta detrás del
// título — profundidad sin ruido. El momento de mayor personalidad se
// reserva para el sello circular que confirma una evidencia revisada,
// como un sello oficial de trámite, coherente con el propósito del panel.

function EmblemWatermark({ color }) {
  return (
    <svg viewBox="0 0 200 200" width="168" height="168" style={{ position: 'absolute', top: -30, right: -24, pointerEvents: 'none' }} aria-hidden="true">
      <path
        d="M100 12c34 26 54 56 54 92 0 32-24 58-54 58s-54-26-54-58c0-14 5-27 13-39 3 20 14 34 27 34 14 0 22-13 20-29-2-16-12-30-6-58Z"
        fill={color}
      />
    </svg>
  );
}

function ApprovalStamp({ palette }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <span style={{ position: 'relative', width: 34, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'stampIn .45s cubic-bezier(.2,1.4,.4,1)' }}>
        <svg viewBox="0 0 40 40" width="34" height="34">
          <circle cx="20" cy="20" r="17" fill="none" stroke={palette.stampRing} strokeWidth="1.6" strokeDasharray="3.2 3" />
          <circle cx="20" cy="20" r="12" fill="none" stroke={palette.stampRing} strokeWidth="1.2" opacity="0.5" />
        </svg>
        <span style={{ position: 'absolute', color: palette.stampRing, display: 'flex' }}>
          <IconCheck size={15} />
        </span>
      </span>
      <div style={{ fontWeight: 800, color: palette.eyebrowIcon, letterSpacing: '0.01em' }}>Evidencia revisada</div>
    </div>
  );
}

/* ---------------------------- Componente ---------------------------- */

export default function AIAssistant() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const p = useMemo(() => (isDark ? PALETTES.dark : PALETTES.light), [isDark]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);

  // Al montar: carga el historial guardado y retoma la conversación más
  // reciente (o abre una nueva si no hay ninguna todavía).
  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    if (loaded.length > 0) {
      const mostRecent = [...loaded].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setActiveId(mostRecent.id);
      setMessages(mostRecent.messages);
    } else {
      setActiveId(nextId());
    }
  }, []);

  // Autoguarda la conversación activa cada vez que cambian sus mensajes.
  useEffect(() => {
    if (!activeId || messages.length === 0) return;
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === activeId);
      const updated = { id: activeId, title: deriveTitle(messages), messages, updatedAt: Date.now() };
      const next = idx >= 0 ? prev.map((c) => (c.id === activeId ? updated : c)) : [updated, ...prev];
      saveConversations(next);
      return next;
    });
  }, [messages, activeId]);

  const startNewConversation = useCallback(() => {
    setActiveId(nextId());
    setMessages([]);
    setPendingFile(null);
    setInputText('');
  }, []);

  const openConversation = useCallback((conv) => {
    setActiveId(conv.id);
    setMessages(conv.messages);
    setPendingFile(null);
    setInputText('');
  }, []);

  const deleteConversation = useCallback((id, e) => {
    e.stopPropagation();
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConversations(next);
      return next;
    });
    if (id === activeId) startNewConversation();
  }, [activeId, startNewConversation]);

  // Autoscroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [inputText, resizeTextarea]);

  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const validateAndSetFile = useCallback((f) => {
    if (!f) return;
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      const id = nextId();
      setMessages((prev) => [
        ...prev,
        { id, role: 'assistant', type: 'text', status: 'error', text: `El archivo supera el tamaño máximo de ${MAX_SIZE_MB} MB.`, timestamp: Date.now() },
      ]);
      return;
    }
    setPendingFile(f);
  }, []);

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    validateAndSetFile(f);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    validateAndSetFile(f);
  };

  const removePendingFile = () => setPendingFile(null);

  const handleSend = useCallback(
    async (overrideText) => {
      const textToSend = (overrideText ?? inputText).trim();
      const fileToSend = pendingFile;
      if (!textToSend && !fileToSend) return;

      const userMsg = {
        id: nextId(),
        role: 'user',
        text: textToSend || null,
        file: fileToSend
          ? { name: fileToSend.name, size: fileToSend.size }
          : null,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setPendingFile(null);
      setBusy(true);

      if (fileToSend) {
        // Flujo de revisión de evidencia
        const assistantId = nextId();
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', type: 'review', status: 'uploading', timestamp: Date.now() },
        ]);
        try {
  const nombreArchivo = fileToSend.name.toUpperCase();

  let webhookUrl;
  if (nombreArchivo.startsWith('GC_') || nombreArchivo.includes('_GC_')) {
    webhookUrl = import.meta.env.VITE_ZOE_REVISAR_GC_URL;
  } else if (nombreArchivo.startsWith('GF_') || nombreArchivo.includes('_GF_')) {
    webhookUrl = import.meta.env.VITE_ZOE_REVISAR_GF_URL;
  } else {
    throw new Error('El archivo debe ser un GC o un GF, con el formato GC_[cédula]_[plantilla]_[mes]_[año].pdf o GF_[cédula]_[plantilla]_[mes]_[año].pdf');
  }

  const formData = new FormData();
  formData.append('identificador', activeId);
  formData.append('file', fileToSend);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!data.valido) {
    updateMessage(assistantId, { status: 'error', error: data.mensaje || 'El documento no pudo ser validado.' });
  } else {
    updateMessage(assistantId, { status: 'success', result: { mensaje: data.mensaje } });
  }
} catch (err) {
  updateMessage(assistantId, { status: 'error', error: err.message || 'Ocurrió un error al enviar la evidencia.' });
} finally {
  setBusy(false);
}
return; }

      // Flujo de conversación con el asistente
      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', type: 'text', status: 'typing', timestamp: Date.now() },
      ]);
      try {
        // Chat Frontend -> n8n -> Zoe
        // IMPORTANTE: durante la prueba n8n debe estar en "Listen for test event".
       const N8N_WEBHOOK_URL = import.meta.env.VITE_ZOE_WEBHOOK_URL;

        let respuestaHttp;

        try {
          respuestaHttp = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              identificador: activeId,
              mensaje: textToSend,
            }),
          });
        } catch (networkError) {
          console.error('No se pudo conectar con n8n:', networkError);

          throw new Error(
            'No se pudo conectar con n8n. Verifica que el Webhook esté activo y que CORS permita http://localhost:5173.'
          );
        }

        if (!respuestaHttp.ok) {
          const errorText = await respuestaHttp.text().catch(() => '');
          throw new Error(
            `n8n respondió con HTTP ${respuestaHttp.status}${errorText ? `: ${errorText}` : ''}`
          );
        }

        const contentType = respuestaHttp.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
          data = await respuestaHttp.json();
        } else {
          const textResponse = await respuestaHttp.text();
          data = { mensaje: textResponse };
        }

        console.log('Respuesta recibida desde n8n:', data);

        const respuesta =
          data?.mensaje ||
          data?.respuesta ||
          data?.message ||
          data?.output ||
          'No recibí una respuesta del asistente.';

        updateMessage(assistantId, {
          status: 'done',
          text: typeof respuesta === 'string'
            ? respuesta
            : JSON.stringify(respuesta),
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'No pude procesar tu mensaje en este momento.';
        updateMessage(assistantId, { status: 'error', text: msg });
      } finally {
        setBusy(false);
      }
    },
    [inputText, pendingFile, activeId, updateMessage]
  );

  const onComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onQuickPrompt = (qp) => {
    if (qp.action === 'upload') {
      fileInputRef.current?.click();
    } else {
      handleSend(qp.value);
    }
  };

  const hasMessages = messages.length > 0;
  const composerDisabled = busy || (!inputText.trim() && !pendingFile);

  return (
    <div
      className="ai-root"
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text, display: 'flex', flexDirection: 'row', height: '100%', position: 'relative' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap');
        .ai-root, .ai-root *, .ai-root *::before, .ai-root *::after { box-sizing: border-box; }
        .ai-banner { padding: 26px 30px 20px; border-radius: 20px; }
        .ai-banner-title { font-size: 24px; font-family: 'Sora','Inter','Segoe UI',sans-serif; }
        .ai-avatar { width: 32px; height: 32px; }
        .ai-bubble { max-width: 78%; }
        .ai-composer { padding: 10px 12px; }
        .ai-quick-btn:hover { border-color: ${p.quickHoverBorder}; background: ${p.quickHoverBg}; color: ${p.quickHoverText}; transform: translateY(-1px); }
        .ai-send-btn:not(:disabled):hover { transform: scale(1.06); filter: brightness(1.08); }
        .ai-attach-btn:hover { background: ${p.quickHoverBg}; }
        .ai-history-rail { transition: width .18s ease; }
        .ai-history-item:hover { background: ${p.quickHoverBg} !important; }
        .ai-history-item:hover .ai-history-delete { opacity: 1; }
        .ai-history-delete { opacity: 0; transition: opacity .12s ease; }
        .ai-history-delete:hover { color: #B91C1C; }
        .ai-scroll { scrollbar-width: thin; scrollbar-color: ${colors.borderStrong} transparent; }
        .ai-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }
        .ai-scroll::-webkit-scrollbar-thumb { background: ${colors.borderStrong}; border-radius: 999px; }
        .ai-scroll::-webkit-scrollbar-thumb:hover { background: ${p.quickHoverBorder}; }
        .ai-scroll::-webkit-scrollbar-button { display: none; width: 0; height: 0; }

        @media (max-width: 640px) {
          .ai-banner { padding: 18px 16px 16px !important; border-radius: 16px !important; }
          .ai-banner-title { font-size: 20px !important; }
          .ai-bubble { max-width: 88% !important; }
        }
      `}</style>

      {/* Columna de chat */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
      >

      {/* Overlay de arrastre de archivo sobre toda la vista */}
      {dragActive && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50, borderRadius: 18,
          background: p.dragOverlayBg,
          border: `2px dashed ${p.dragBorder}`, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10, pointerEvents: 'none',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: p.dragIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.dragIconColor, boxShadow: '0 6px 18px -4px rgba(0,0,0,0.35)' }}>
            <IconUpload size={24} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: p.headerText }}>Suelta tu archivo para adjuntarlo</div>
        </div>
      )}

      {/* Encabezado fijo */}
      <div className="ai-sticky-header" style={{ position: 'sticky', top: 0, zIndex: 20, background: colors.bg || colors.card, flexShrink: 0 }}>
        <div className="ai-banner" style={{
          background: p.headerBg, border: `1px solid ${p.headerBorder}`,
          marginBottom: 4, color: p.headerText, position: 'relative', overflow: 'hidden',
          boxShadow: p.headerShadow, transition: 'background .25s ease, border-color .25s ease, box-shadow .25s ease',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.topBar }} />
          <EmblemWatermark color={p.watermark} />

          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px 5px 8px', borderRadius: 999, background: p.eyebrowBg, border: `1px solid ${p.eyebrowBorder}`, marginBottom: 14 }}>
            <span style={{ color: p.eyebrowIcon, display: 'flex' }}><IconSparkle size={12} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.09em', color: p.headerText }}>EN LÍNEA</span>
            <span style={{ position: 'relative', width: 6, height: 6 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: p.liveDot, animation: 'aiPulseRing 2s infinite' }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: p.liveDot }} />
            </span>
          </div>

          <h2 className="ai-banner-title" style={{ position: 'relative', margin: '0 0 6px', fontWeight: 800, letterSpacing: '-0.3px', maxWidth: 380, color: p.headerText }}>Asistente IA</h2>
          <p style={{ position: 'relative', margin: 0, fontSize: 13.5, color: p.headerSubText, maxWidth: 400, lineHeight: 1.55 }}>
            Pregúntame lo que necesites o adjunta una evidencia y la envío a revisión por ti
          </p>
        </div>
      </div>

      {/* Zona de conversación */}
      <div ref={scrollRef} className="ai-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16, minHeight: 0, padding: '4px 2px' }}>

        {!hasMessages && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: '20px 12px' }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: p.assistantAvatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.assistantAvatarIcon, border: `1px solid ${p.assistantAvatarBorder}` }}>
              <IconSparkle size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: "'Sora','Inter','Segoe UI',sans-serif" }}>¿En qué te puedo ayudar hoy?</div>
              <div style={{ fontSize: 13, color: colors.textFaint, marginTop: 4, maxWidth: 320 }}>
                Escribe tu pregunta o arrastra un archivo aquí para enviarlo a revisión.
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420 }}>
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  className="ai-quick-btn"
                  onClick={() => onQuickPrompt(qp)}
                  style={{
                    padding: '9px 14px', borderRadius: 999, border: `1px solid ${colors.border}`,
                    background: colors.card, color: colors.textSecondary, fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s ease',
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <ChatRow key={m.id} message={m} colors={colors} theme={theme} palette={p} />
        ))}
      </div>

      {/* Compositor fijo abajo */}
      <div style={{ flexShrink: 0, marginTop: 12 }}>
        {pendingFile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 8,
            borderRadius: 12, background: colors.card, border: `1px solid ${colors.border}`,
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: colors.bgAlt, border: `1px solid ${colors.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary, flexShrink: 0 }}>
              <IconFile size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</div>
              <div style={{ fontSize: 11, color: colors.textFaint }}>{formatBytes(pendingFile.size)} · se enviará a revisión</div>
            </div>
            <button
              onClick={removePendingFile}
              title="Quitar archivo"
              style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <IconX size={13} />
            </button>
          </div>
        )}

        <div className="ai-composer" style={{
          display: 'flex', alignItems: 'flex-end', gap: 8, borderRadius: 18,
          background: colors.card, border: `1px solid ${composerFocused ? p.quickHoverBorder : colors.border}`,
          boxShadow: composerFocused ? `${p.composerShadow}, 0 0 0 3px ${p.quickHoverBg}` : p.composerShadow,
          transition: 'border-color .15s ease, box-shadow .15s ease',
        }}>
          <button
            className="ai-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Adjuntar evidencia"
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent',
              color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'background .15s ease',
            }}
          >
            <IconPaperclip />
          </button>
          <input ref={fileInputRef} type="file" accept={ACCEPTED_EXT} onChange={onInputChange} style={{ display: 'none' }} />

          <textarea
            ref={textareaRef}
            className="ai-scroll"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={onComposerKeyDown}
            onFocus={() => setComposerFocused(true)}
            onBlur={() => setComposerFocused(false)}
            placeholder="Escribe tu pregunta o un comentario para tu evidencia..."
            rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent',
              color: colors.text, fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.5,
              padding: '8px 0', maxHeight: 120, overflowY: 'auto',
            }}
          />

          <button
            className="ai-send-btn"
            onClick={() => handleSend()}
            disabled={composerDisabled}
            title="Enviar"
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: composerDisabled ? colors.bgAlt : p.sendBg,
              color: composerDisabled ? colors.textFaint : p.sendIcon,
              cursor: composerDisabled ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'transform .15s ease, background .15s ease, filter .15s ease',
              boxShadow: composerDisabled ? 'none' : '0 4px 12px -4px rgba(31,107,10,0.4)',
            }}
          >
            <IconSend />
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: colors.textFaint, textAlign: 'center', marginTop: 6 }}>
          PDF, Word, Excel o imagen · máx. {MAX_SIZE_MB} MB · Enter para enviar, Shift+Enter para salto de línea
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
        @keyframes aiFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampIn {
          0% { opacity: 0; transform: scale(1.9) rotate(-14deg); }
          60% { opacity: 1; transform: scale(0.94) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
      </div>

      {/* Riel de historial — se abre solo con pasar el mouse */}
      <aside
        className="ai-history-rail"
        onMouseEnter={() => setHistoryOpen(true)}
        onMouseLeave={() => setHistoryOpen(false)}
        style={{
          width: historyOpen ? 232 : 46, flexShrink: 0, overflow: 'hidden',
          borderLeft: `1px solid ${colors.border}`, background: colors.card,
          display: 'flex', flexDirection: 'column', height: '100%',
        }}
      >
        <div style={{ padding: historyOpen ? '14px 10px 8px' : '14px 6px 8px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: historyOpen ? 'flex-start' : 'center' }}>
          <span style={{ color: p.eyebrowIcon, display: 'flex', flexShrink: 0 }}><IconHistory size={17} /></span>
          {historyOpen && <span style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>HISTORIAL</span>}
        </div>

        <button
          onClick={startNewConversation}
          title="Nueva conversación"
          style={{
            margin: historyOpen ? '2px 8px 10px' : '2px 6px 10px', padding: historyOpen ? '8px 10px' : '8px 0',
            borderRadius: 10, border: `1px dashed ${p.quickHoverBorder}`, background: 'transparent',
            color: p.eyebrowIcon, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: historyOpen ? 'flex-start' : 'center',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          <IconPlus size={14} />
          {historyOpen && 'Nueva conversación'}
        </button>

        <div className="ai-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: historyOpen ? '0 8px 10px' : '0 6px 10px' }}>
          {[...conversations].sort((a, b) => b.updatedAt - a.updatedAt).map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                className="ai-history-item"
                onClick={() => openConversation(conv)}
                title={conv.title}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  borderRadius: 10, marginBottom: 3, padding: historyOpen ? '8px 9px' : '8px 0',
                  background: isActive ? p.quickHoverBg : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 8, justifyContent: historyOpen ? 'space-between' : 'center',
                }}
              >
                {historyOpen ? (
                  <>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 600, color: isActive ? p.quickHoverText : colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</div>
                      <div style={{ fontSize: 10, color: colors.textFaint, marginTop: 1 }}>{formatRelativeDate(conv.updatedAt)}</div>
                    </div>
                    <span
                      className="ai-history-delete"
                      onClick={(e) => deleteConversation(conv.id, e)}
                      title="Eliminar conversación"
                      style={{ color: colors.textFaint, flexShrink: 0, display: 'flex', padding: 3 }}
                    >
                      <IconTrash />
                    </span>
                  </>
                ) : (
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? p.assistantAvatarBg : colors.bgAlt,
                    border: `1px solid ${isActive ? p.assistantAvatarBorder : colors.borderStrong}`,
                    color: isActive ? p.assistantAvatarIcon : colors.textFaint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800,
                  }}>
                    {conv.title.trim().charAt(0).toUpperCase() || '·'}
                  </span>
                )}
              </button>
            );
          })}
          {conversations.length === 0 && historyOpen && (
            <div style={{ fontSize: 11.5, color: colors.textFaint, padding: '6px 2px', lineHeight: 1.5 }}>
              Tus conversaciones se guardan aquí automáticamente.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ---------------------------- Fila de chat ---------------------------- */

function ChatRow({ message, colors, theme, palette }) {
  const isUser = message.role === 'user';
  const p = palette;

  const bubbleBase = {
    padding: '11px 15px',
    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    fontSize: 13.5,
    lineHeight: 1.6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    animation: 'aiFadeIn .25s ease',
  };

  const assistantBubbleStyle = {
    ...bubbleBase,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderLeft: `3px solid ${p.eyebrowIcon}`,
    color: colors.text,
  };

  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 14 }}>
      <div className="ai-avatar" style={{
        borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? colors.bgAlt : p.assistantAvatarBg,
        border: isUser ? `1px solid ${colors.borderStrong}` : `1px solid ${p.assistantAvatarBorder}`,
        color: isUser ? colors.textSecondary : p.assistantAvatarIcon,
        fontSize: 12, fontWeight: 800,
      }}>
        {isUser ? 'Tú' : <IconSparkle size={14} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
        {/* Texto del mensaje (no aplica si es un error, que tiene su propia burbuja abajo) */}
        {message.text && !(message.type === 'text' && message.status === 'error') && (
          <div
            className="ai-bubble"
            style={isUser
              ? { ...bubbleBase, background: p.userBubbleBg, color: p.userBubbleText, marginBottom: message.file ? 6 : 0 }
              : { ...assistantBubbleStyle, marginBottom: message.file ? 6 : 0 }}
          >
            {message.text}
          </div>
        )}

        {/* Archivo adjunto por el usuario */}
        {message.file && (
          <div
            className="ai-bubble"
            style={isUser
              ? { ...bubbleBase, background: p.userBubbleBg, color: p.userBubbleText, display: 'flex', alignItems: 'center', gap: 10 }
              : { ...assistantBubbleStyle, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isUser ? 'rgba(255,255,255,0.22)' : colors.bgAlt,
              border: isUser ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${colors.borderStrong}`,
            }}>
              <IconFile size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{message.file.name}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{formatBytes(message.file.size)}</div>
            </div>
          </div>
        )}

        {/* Estado "escribiendo..." */}
        {message.type === 'text' && message.status === 'typing' && (
          <div className="ai-bubble" style={{ ...assistantBubbleStyle, display: 'flex', alignItems: 'center', gap: 5, padding: '13px 16px' }}>
            {[0, 1, 2].map((d) => (
              <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: p.liveDot, animation: `aiDotBounce 1.1s ${d * 0.15}s infinite ease-in-out` }} />
            ))}
          </div>
        )}

        {/* Error en mensaje de texto */}
        {message.type === 'text' && message.status === 'error' && (
          <div className="ai-bubble" style={{
            ...bubbleBase,
            background: theme === 'dark' ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
            border: `1px solid ${theme === 'dark' ? 'rgba(220,38,38,0.3)' : '#FECACA'}`,
            color: theme === 'dark' ? '#FCA5A5' : '#B91C1C',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <IconAlert size={15} />
            {message.text}
          </div>
        )}

        {/* Revisión de evidencia: subiendo */}
        {message.type === 'review' && message.status === 'uploading' && (
          <div className="ai-bubble" style={{ ...assistantBubbleStyle, display: 'flex', alignItems: 'center', gap: 5, padding: '13px 16px' }}>
            {[0, 1, 2].map((d) => (
              <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: p.liveDot, animation: `aiDotBounce 1.1s ${d * 0.15}s infinite ease-in-out` }} />
            ))}
            <span style={{ fontSize: 12, color: colors.textFaint, marginLeft: 4 }}>Enviando a revisión...</span>
          </div>
        )}

        {/* Revisión de evidencia: éxito */}
        {message.type === 'review' && message.status === 'success' && (
          <div className="ai-bubble" style={assistantBubbleStyle}>
            <ApprovalStamp palette={p} />
            {message.result?.mensaje || message.result?.message ? (
              <div>{message.result.mensaje || message.result.message}</div>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 11.5, color: colors.textSecondary }}>
                {JSON.stringify(message.result, null, 2)}
              </div>
            )}
          </div>
        )}

        {/* Revisión de evidencia: error */}
        {message.type === 'review' && message.status === 'error' && (
          <div className="ai-bubble" style={{
            ...bubbleBase,
            background: theme === 'dark' ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
            border: `1px solid ${theme === 'dark' ? 'rgba(220,38,38,0.3)' : '#FECACA'}`,
            color: theme === 'dark' ? '#FCA5A5' : '#B91C1C',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <IconAlert size={15} />
            {message.error}
          </div>
        )}

        {message.timestamp && (
          <div style={{ fontSize: 10, color: colors.textFaint, marginTop: 3, padding: '0 4px' }}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}