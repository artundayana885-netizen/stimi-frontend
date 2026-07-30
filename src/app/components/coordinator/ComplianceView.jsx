import { useState } from 'react';
import { useTheme } from '../../../ThemeContext';

/* ============================================================
   Token de marca — colores OFICIALES del SENA (verificados).
   Verde institucional vigente: #39A900 (Pantone 361 C, Resolución 1-1910 / 2022-2026).
   Naranja institucional: #FC7323 (Pantone 021 U, Manual de Identidad SENA 2012,
   "los colores principales para diseño son Naranja y Verde").

   Rediseño: se rebalancea el uso de color para que el naranja tenga
   presencia real (no solo un acento minúsculo), tal como establece el
   manual de marca — verde y naranja como colores principales a la par.
   ============================================================ */
const BRAND = {
  greenDark: '#1F5D00',
  green: '#2C7A00',
  greenMid: '#39A900',   // ← Verde oficial SENA
  greenSoft: '#4CBF14',
  greenBright: '#63D62E',
  greenPale: '#8FE86B',
  orangeDeep: '#C25A12',
  orangeMid: '#FC7323',  // ← Naranja institucional SENA
  orangeSoft: '#FF8F4D',
  orangeBright: '#FFAE7A',
};

/* ============================================================
   Iconos — línea 2px, sin emojis del sistema.
   ============================================================ */
const Icon = ({ children, size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);
const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.2" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></Icon>;
const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon>;
const IconChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>;
const IconArrowRight = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
const IconLayers = (p) => <Icon {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></Icon>;
const IconX = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;

// ── Áreas de ejemplo eliminadas. Agrega tus áreas reales aquí, o
// conéctalas a tu fuente de datos. Formato esperado:
// { name: 'TIC', instructors: 18, value: 90, color: BRAND.greenMid,
//   people: [{ name: 'Ana Jiménez', value: 100 }, ...] }
const areas = [];

// ── Histórico mensual eliminado. Agrega tus meses reales aquí.
// Formato esperado: { month: 'Julio 2026', value: 89, current: true }
const monthly = [];

const MONTHS_COLLAPSED = 4;
// Puestos del ranking: naranja para el 1er lugar (medalla de oro institucional),
// verde para 2º y 3º — el naranja deja de ser un acento tímido y pasa a marcar
// el logro principal, como corresponde a un color de marca de igual peso.
const RANK_COLORS = [BRAND.orangeMid, BRAND.greenBright, BRAND.greenMid];

function initials(fullName) {
  return fullName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function AreaDetailsModal({ onClose, colors, theme }) {
  const rankedAreas = [...areas].sort((a, b) => b.value - a.value);
  const rankFallbackBg = theme === 'dark' ? 'rgba(255,255,255,0.08)' : colors.border;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div style={{
        background: colors.card, borderRadius: 20, width: 'min(580px, 100%)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: theme === 'dark' ? 'rgba(22,163,74,0.18)' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.greenMid, flexShrink: 0 }}>
              <IconLayers size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>Detalle de cumplimiento por área</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>Desglose por instructor</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: colors.inputBg, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconX size={16} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {rankedAreas.length === 0 ? (
            <div style={{ padding: '24px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint }}>
              No hay áreas registradas todavía.
            </div>
          ) : rankedAreas.map((a, i) => (
            <div key={a.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: i < 3 ? RANK_COLORS[i] : rankFallbackBg, color: i < 3 ? '#fff' : colors.textMuted,
                  fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{a.name}</span>
                <span style={{ fontSize: 11, color: colors.textFaint }}>{a.instructors} instructores</span>
                <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: a.color }}>{a.value}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingLeft: 32 }}>
                {a.people.map((p) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, fontSize: 9.5, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${a.color}26`, color: a.color,
                    }}>{initials(p.name)}</div>
                    <span style={{ fontSize: 12.5, color: colors.textSecondary, width: 118, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <div style={{ flex: 1, height: 6, background: colors.inputBg, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.value}%`, background: a.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, width: 34, textAlign: 'right' }}>{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComplianceView() {
  const { colors, theme } = useTheme();
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const visibleMonths = showFullHistory ? monthly : monthly.slice(0, MONTHS_COLLAPSED);
  const currentMonth = monthly.find(m => m.current) || monthly[0] || { month: '—', value: 0, current: false };
  const rankedAreas = [...areas].sort((a, b) => b.value - a.value);
  const bestArea = rankedAreas[0] || null;
  const rankFallbackBg = theme === 'dark' ? 'rgba(255,255,255,0.08)' : colors.border;

  // Fondo suave para la fila del "mes actual" en el histórico
  const currentRowBg = theme === 'dark' ? 'rgba(22,163,74,0.14)' : '#F0FDF4';
  const currentRowBorder = theme === 'dark' ? 'rgba(22,163,74,0.35)' : '#BBF7D0';
  const currentTrackBg = theme === 'dark' ? 'rgba(22,163,74,0.25)' : '#BBF7D0';

  // Geometría de la mini-tendencia anual (cronológica), curva suavizada.
  // Solo se calcula si hay al menos 2 meses con datos.
  const chronological = [...monthly].reverse();
  const hasTrend = chronological.length > 1;
  const chartW = 320, chartH = 110, padX = 14, padY = 14;
  let linePath = '', areaPath = '', pts = [];
  if (hasTrend) {
    const cMin = Math.max(0, Math.min(...chronological.map(m => m.value)) - 6);
    const cMax = Math.min(100, Math.max(...chronological.map(m => m.value)) + 6);
    pts = chronological.map((m, i) => ({
      x: padX + (i / (chronological.length - 1)) * (chartW - padX * 2),
      y: chartH - padY - ((m.value - cMin) / (cMax - cMin || 1)) * (chartH - padY * 2),
      ...m,
    }));
    const smoothPath = (p) => {
      let d = `M ${p[0].x} ${p[0].y}`;
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i], b = p[i + 1], mid = a.x + (b.x - a.x) / 2;
        d += ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
      }
      return d;
    };
    linePath = smoothPath(pts);
    areaPath = `${linePath} L ${pts[pts.length - 1].x} ${chartH} L ${pts[0].x} ${chartH} Z`;
  }

  const ringR = 42, ringCirc = 2 * Math.PI * ringR;

  // ── Totales calculados a partir de las áreas reales (0 si aún no hay datos).
  const totalInstructors = areas.reduce((sum, a) => sum + (a.instructors || 0), 0);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: colors.text }}>
      <style>{`
        @keyframes senaDrawLine2 { from { stroke-dashoffset: 620; } to { stroke-dashoffset: 0; } }
        @keyframes senaFadeUp2 { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes senaGrow2 { from { width: 0%; } }
        @keyframes senaPulse2 { 0% { r: 5; stroke-opacity: .6; } 100% { r: 15; stroke-opacity: 0; } }
        .sena-line2 { stroke-dasharray: 620; stroke-dashoffset: 620; animation: senaDrawLine2 1.2s cubic-bezier(.4,0,.2,1) forwards; }
        .sena-fade2 { opacity: 0; animation: senaFadeUp2 .5s ease forwards; }
        .sena-bar2 > div { animation: senaGrow2 .8s cubic-bezier(.3,0,.2,1) both; }
      `}</style>

      {/* ============ HERO ============
          Verde como base (color principal del logosímbolo), pero con una
          cuña naranja real en el costado — no un punto decorativo — para
          que el naranja institucional tenga presencia visible, tal como
          indica el manual de marca (verde y naranja a la par). */}
      <div style={{
        background: `linear-gradient(115deg, ${BRAND.greenDark} 0%, ${BRAND.green} 60%, ${BRAND.greenMid} 100%)`,
        borderRadius: 18, padding: '30px 34px', marginBottom: 22, color: '#fff',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap',
      }}>
        {/* Barra superior verde→naranja (misma proporción que el resto del sistema) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BRAND.greenBright} 0%, ${BRAND.greenBright} 55%, ${BRAND.orangeMid} 100%)` }} />
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }} width="100%" height="100%">
          <defs>
            <pattern id="compHeroPattern" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="22" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#compHeroPattern)" />
        </svg>
        {/* Cuña naranja diagonal — bloque de color real, no solo un halo tenue */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '34%',
          background: `linear-gradient(160deg, rgba(252,115,35,0.22) 0%, rgba(252,115,35,0.06) 70%)`,
          clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', minWidth: 240, flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: BRAND.orangeMid, display: 'inline-block' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>Seguimiento del rendimiento</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 25, fontWeight: 800, letterSpacing: '-0.5px' }}>Cumplimiento General</h1>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, opacity: 0.85, maxWidth: 380, lineHeight: 1.5 }}>
            Rendimiento consolidado de todos los instructores y áreas técnicas de la unidad.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {bestArea && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 14px', fontSize: 12.5, fontWeight: 600 }}>
                <IconLayers size={14} /> Área líder: {bestArea.name} ({bestArea.value}%)
              </span>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={ringR} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
            <circle
              cx="50" cy="50" r={ringR} fill="none" stroke={BRAND.orangeMid} strokeWidth="9"
              strokeDasharray={`${ringCirc * (currentMonth.value / 100)} ${ringCirc}`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
            />
            <text x="50" y="47" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{currentMonth.value}%</text>
            <text x="50" y="63" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="rgba(255,255,255,0.75)" letterSpacing="0.05em">CUMPL. GLOBAL</text>
          </svg>
        </div>
      </div>

      {/* ============ TOP STATS ============
          Antes: 3 bloques sólidos en verde que empastaban la pantalla.
          Ahora: tarjetas neutras (fondo colors.card) con un chip de ícono
          de color — verde / naranja / verde — para que la vista se sienta
          balanceada e institucional en vez de "toda verde". */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        {[
          { label: 'Cumplimiento global', value: `${currentMonth.value}%`, Icon: IconTarget, accent: BRAND.greenMid, chipBg: theme === 'dark' ? 'rgba(57,169,0,0.16)' : '#EAF6DE' },
          { label: 'Total instructores', value: String(totalInstructors), Icon: IconUsers, accent: BRAND.orangeMid, chipBg: theme === 'dark' ? 'rgba(252,115,35,0.16)' : '#FFF1E8' },
          { label: 'Informes al día', value: '0', Icon: IconCheckCircle, accent: BRAND.greenMid, chipBg: theme === 'dark' ? 'rgba(57,169,0,0.16)' : '#EAF6DE' },
        ].map((s, i) => {
          const SIcon = s.Icon;
          return (
            <div key={s.label} className="sena-fade2" style={{
              animationDelay: `${i * 90}ms`, borderRadius: 14, padding: '20px 20px',
              position: 'relative', overflow: 'hidden',
              background: colors.card, border: `1px solid ${colors.border}`,
              borderTop: `3px solid ${s.accent}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'transform .15s, box-shadow .15s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: s.accent }}>
                <SIcon size={19} />
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: colors.text }}>{s.value}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6, color: colors.textMuted }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ============ DOS COLUMNAS ============ */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Cumplimiento por Área — ranking */}
        <div style={{ background: colors.card, borderRadius: 14, padding: 22, border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>Cumplimiento por área</div>
            <div style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>Rendimiento de cada área técnica</div>
          </div>
          {rankedAreas.length === 0 ? (
            <div style={{ padding: '24px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint, marginBottom: 14 }}>
              No hay áreas registradas todavía.
            </div>
          ) : rankedAreas.map((a, i) => (
            <div key={a.name} className="sena-fade2" style={{ animationDelay: `${i * 90}ms`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: i < 3 ? RANK_COLORS[i] : rankFallbackBg, color: i < 3 ? '#fff' : colors.textMuted,
                    fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</span>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{a.name}</span>
                  <span style={{ fontSize: 11.5, color: colors.textFaint }}>{a.instructors} instructores</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: a.color }}>{a.value}%</span>
              </div>
              <div className="sena-bar2" style={{ height: 8, background: colors.inputBg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.value}%`, background: `linear-gradient(90deg, ${a.color}CC, ${a.color})`, borderRadius: 4, animationDelay: `${i * 90 + 100}ms` }} />
              </div>
            </div>
          ))}
          <button onClick={() => setShowAreaModal(true)} style={{
            width: '100%', marginTop: 6, padding: '11px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${BRAND.greenBright}, ${BRAND.greenMid})`, color: '#fff',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Ver detalles completos <IconArrowRight size={14} />
          </button>
        </div>

        {/* Evolución Mensual — tendencia + histórico */}
        <div style={{ background: colors.card, borderRadius: 14, padding: 22, border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>Evolución mensual</div>
            <div style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>Histórico de cumplimiento</div>
          </div>

          {/* Mini-tendencia del año, solo si hay al menos 2 meses cargados */}
          {hasTrend && (
            <div style={{ marginBottom: 18 }}>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="100" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="compAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.greenSoft} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={BRAND.greenSoft} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="compStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={BRAND.greenMid} />
                    <stop offset="75%" stopColor={BRAND.greenBright} />
                    <stop offset="100%" stopColor={BRAND.orangeMid} />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#compAreaFill)" />
                <path d={linePath} className="sena-line2" fill="none" stroke="url(#compStroke)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p) => {
                  const isCurrent = !!p.current;
                  return (
                    <g key={p.month}>
                      {isCurrent && <circle cx={p.x} cy={p.y} r="5" fill="none" stroke={BRAND.orangeMid} strokeWidth="2" style={{ animation: 'senaPulse2 1.8s ease-out infinite' }} />}
                      <circle cx={p.x} cy={p.y} r={isCurrent ? 4.5 : 3.2} fill={colors.card} stroke={isCurrent ? BRAND.orangeMid : BRAND.greenMid} strokeWidth="2" />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {monthly.length === 0 ? (
            <div style={{ padding: '24px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint }}>
              No hay meses registrados todavía.
            </div>
          ) : visibleMonths.map((m, i) => (
            <div key={m.month} className="sena-fade2" style={{
              animationDelay: `${i * 70}ms`,
              padding: '14px 16px', borderRadius: 12, marginBottom: 10,
              background: m.current ? currentRowBg : colors.inputBg,
              border: m.current ? `1px solid ${currentRowBorder}` : '1px solid transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: m.current ? BRAND.greenMid : colors.card, border: m.current ? 'none' : `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.current ? '#fff' : colors.textMuted, flexShrink: 0 }}>
                    <IconCalendar size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{m.month}</div>
                    {m.current && <div style={{ fontSize: 10, color: BRAND.orangeMid, fontWeight: 700 }}>Mes actual</div>}
                  </div>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: m.current ? BRAND.greenMid : colors.textSecondary }}>{m.value}%</span>
              </div>
              <div style={{ height: 6, background: m.current ? currentTrackBg : colors.border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.value}%`, background: m.current ? `linear-gradient(90deg, ${BRAND.greenBright}, ${BRAND.greenMid})` : BRAND.greenSoft, borderRadius: 3 }} />
              </div>
            </div>
          ))}

          {monthly.length > MONTHS_COLLAPSED && (
            <button onClick={() => setShowFullHistory(v => !v)} style={{
              width: '100%', marginTop: 4, padding: '11px', borderRadius: 10, border: `1px solid ${colors.border}`,
              background: colors.inputBg, color: colors.textSecondary,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {showFullHistory ? 'Ver menos' : 'Ver historial completo'}
              <IconChevronDown size={14} style={{ transform: showFullHistory ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          )}
        </div>
      </div>

      {showAreaModal && <AreaDetailsModal onClose={() => setShowAreaModal(false)} colors={colors} theme={theme} />}
    </div>
  );
}