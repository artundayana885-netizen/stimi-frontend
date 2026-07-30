import { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import Toast from '../Toast';
import { getReports } from '../../../services/reportsService';

/* ============================================================
   Token de marca — paleta institucional SENA (Manual de
   Identidad Visual 2024): verde #39A900, verde oscuro #007832,
   naranja (reemplaza al violeta) #FF6B00.
   Los grises/fondos vienen de useTheme() (colors.*), NO de aquí,
   para que respondan al modo claro/oscuro.
   ============================================================ */
const BRAND = {
  greenDark: '#007832',
  green: '#1B8A3E',
  greenMid: '#39A900',
  greenSoft: '#5CC220',
  greenBright: '#39A900',
  orangeDeep: '#CC5500',
  orangeMid: '#FF6B00',
  orangeSoft: '#FF8A3D',
  danger: '#dc2626',
};

/* ============================================================
   Iconos — línea 2px, sin emojis del sistema.
   ============================================================ */
const Icon = ({ children, size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);
const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
const IconAlertTriangle = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
const IconUpload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
const IconTrendUp = (p) => <Icon {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></Icon>;
const IconTrendDown = (p) => <Icon {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon>;
const IconPencil = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" /></Icon>;
const IconTrash = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></Icon>;
const IconArrowRight = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
const IconAward = (p) => <Icon {...p}><circle cx="12" cy="8" r="6" /><path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11" /></Icon>;
const IconX = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;

/* Nombres de mes en español, usados para el parser de fechas y las etiquetas del calendario */
const MONTHS_ES_FULL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_ES_ABBR = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// Convierte "29 de octubre" o una fecha ISO (yyyy-mm-dd) en { day, month } para la tarjeta-calendario.
// Si no logra interpretarla, devuelve null y el llamador usa un ícono genérico de respaldo.
function parseDateForTile(raw) {
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const monthIdx = parseInt(iso[2], 10) - 1;
    return { day: iso[3], month: MONTHS_ES_ABBR[monthIdx] || '' };
  }
  const es = raw.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)/i);
  if (es) {
    const monthName = es[2].toLowerCase();
    const idx = MONTHS_ES_FULL.findIndex(m => m.startsWith(monthName) || monthName.startsWith(m.slice(0, 4)));
    return { day: es[1].padStart(2, '0'), month: idx >= 0 ? MONTHS_ES_ABBR[idx] : '' };
  }
  return null;
}

// Convierte la fecha del informe (acepta "dd/mm/yyyy" o ISO "yyyy-mm-dd") a un
// timestamp comparable, para poder ordenar la actividad reciente de más nueva a más vieja.
function reportTimestamp(raw) {
  if (!raw) return 0;
  if (raw.includes('/')) {
    const [d, m, y] = raw.split('/');
    const year = y?.length === 2 ? `20${y}` : y;
    return new Date(`${year}-${m?.padStart(2, '0')}-${d?.padStart(2, '0')}`).getTime() || 0;
  }
  return new Date(raw).getTime() || 0;
}

// Histórico de cumplimiento de meses cerrados (registro pasado de la unidad).
// TODO: reemplazar con los datos reales de meses ya cerrados, p.ej.:
// [{ month: 'Septiembre', short: 'SEP', value: 86 }, { month: 'Octubre', short: 'OCT', value: 92 }]
// El mes en curso NO se guarda aquí — se calcula abajo a partir de los informes reales.
const COMPLIANCE_HISTORY = [];

// Mes en curso, calculado a partir de la fecha real del sistema (no queda fijo en un mes).
const _now = new Date();
const CURRENT_MONTH = {
  month: MONTHS_ES_FULL[_now.getMonth()].charAt(0).toUpperCase() + MONTHS_ES_FULL[_now.getMonth()].slice(1),
  short: MONTHS_ES_ABBR[_now.getMonth()],
};

export default function UnitView({ userName, onViewChange }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [toast, setToast] = useState(null);
  const [dbReports, setDbReports] = useState([]);
  const [dates, setDates] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('sena_dates') || '[]');
    return saved; // TODO: sin fechas de ejemplo; se llenará con lo que el coordinador agregue.
  });
  const [showAddDate, setShowAddDate] = useState(false);
  const [newDate, setNewDate] = useState({ label: '', date: '', urgent: false });
  const [editingDateId, setEditingDateId] = useState(null); // null = modo "agregar", id = modo "editar"

  // Carga los informes reales de la unidad (mismo servicio que usa Compliance.jsx).
  useEffect(() => {
    getReports().then(data => {
      setDbReports(data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('sena_dates', JSON.stringify(dates));
  }, [dates]);

  // Fondos tenues por acento, adaptados al tema (versión translúcida en oscuro, pastel en claro)
  const tint = (hex, darkAlpha = 0.15) => isDark
    ? `${hex}${Math.round(darkAlpha * 255).toString(16).padStart(2, '0')}`
    : `${hex}1A`; // ~10% en claro, se ve como pastel sobre fondo blanco
  const greenBg = isDark ? 'rgba(57,169,0,0.14)' : '#EEF8E4';
  const orangeBg = isDark ? 'rgba(255,107,0,0.14)' : '#FFF1E6';
  const dangerBg = isDark ? 'rgba(220,38,38,0.16)' : '#FEF2F2';
  const dangerBorder = isDark ? 'rgba(220,38,38,0.4)' : '#FECACA';

  const showToast = (msg, color = BRAND.greenSoft) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const closeDateModal = () => {
    setShowAddDate(false);
    setEditingDateId(null);
    setNewDate({ label: '', date: '', urgent: false });
  };

  const openEditDate = (d) => {
    setNewDate({ label: d.label, date: d.date, urgent: !!d.urgent });
    setEditingDateId(d.id);
    setShowAddDate(true);
  };

  const saveDate = () => {
    if (!newDate.label.trim()) return;
    if (editingDateId) {
      setDates(prev => prev.map(x => x.id === editingDateId
        ? { ...x, label: newDate.label, date: newDate.date, urgent: !!newDate.urgent }
        : x));
      showToast('Fecha actualizada correctamente');
    } else {
      setDates(prev => [...prev, { id: Date.now(), label: newDate.label, date: newDate.date, urgent: !!newDate.urgent }]);
      showToast('Fecha agregada correctamente');
    }
    closeDateModal();
  };

  const deleteDate = (id, label) => {
    setDates(prev => prev.filter(x => x.id !== id));
    showToast(`Fecha eliminada: ${label}`, BRAND.danger);
  };

  // ── Conteos reales, calculados a partir de los informes de la base de datos ──
  const approvedCount = dbReports.filter(r => r.status === 'Aprobado').length;
  const pendingCount = dbReports.filter(r => r.status === 'Pendiente').length;
  const correctionCount = dbReports.filter(r => r.status === 'A Corregir').length;

  // "Total instructores": mientras no exista un servicio de usuarios propio,
  // se aproxima contando instructores únicos que ya tienen al menos un informe.
  // TODO: si tienes getUsers()/usersService, reemplaza esto por el conteo real
  // de instructores registrados (no solo los que ya entregaron algo).
  // Ajusta el nombre del campo si en tu base de datos no se llama "instructorName".
  const instructorSet = new Set(
    dbReports
      .map(r => r.instructorName || r.instructor || r.userName || r.author || r.userId)
      .filter(Boolean)
  );
  const instructorsCount = instructorSet.size;

  // KPIs de la unidad, ya conectados a los informes reales.
  const stats = [
    { key: 'instructors', icon: IconUsers,        value: instructorsCount, label: 'Total instructores',    accent: BRAND.greenMid,   bg: greenBg,  target: 'user-management' },
    { key: 'approved',    icon: IconCheckCircle,  value: approvedCount,    label: 'Informes aprobados',     accent: BRAND.greenSoft,  bg: greenBg,  target: 'report-management' },
    { key: 'pending',     icon: IconClock,        value: pendingCount,     label: 'Pendientes de revisión', accent: BRAND.orangeMid,  bg: orangeBg, target: 'report-management' },
    { key: 'alerts',      icon: IconAlertTriangle, value: correctionCount, label: 'Con alertas',            accent: BRAND.danger,     bg: dangerBg, target: 'compliance' },
  ];

  const ACTIVITY_STYLE = {
    upload:    { color: BRAND.greenMid,  bg: greenBg,  Icon: IconUpload },
    done:      { color: BRAND.greenSoft, bg: greenBg,  Icon: IconCheckCircle },
    pending:   { color: BRAND.orangeMid, bg: orangeBg, Icon: IconClock },
    corrected: { color: BRAND.danger,    bg: dangerBg, Icon: IconAlertTriangle },
  };

  // Actividad reciente real: últimos informes entregados, ordenados por fecha descendente.
  const recentActivity = [...dbReports]
    .sort((a, b) => reportTimestamp(b.date) - reportTimestamp(a.date))
    .slice(0, 6)
    .map(r => {
      const name = r.instructorName || r.instructor || r.userName || r.author || 'Instructor';
      const kind = r.status === 'Aprobado' ? 'done' : r.status === 'A Corregir' ? 'corrected' : 'pending';
      const action = r.status === 'Aprobado'
        ? `Informe ${r.type || ''} aprobado`
        : r.status === 'A Corregir'
        ? `Informe ${r.type || ''} devuelto a corrección`
        : `Envió informe ${r.type || ''} — en revisión`;
      return { name, action, time: r.date || '', kind };
    });

  // El cumplimiento del mes en curso sale de los informes reales (aprobados / total gestionado),
  // no de un número escrito a mano — así la tarjeta y el gráfico siempre reflejan los datos reales.
  const managedCount = approvedCount + pendingCount;
  const currentMonthValue = managedCount > 0 ? Math.round((approvedCount / managedCount) * 100) : 0;

  const compliance = [...COMPLIANCE_HISTORY, { ...CURRENT_MONTH, value: currentMonthValue }];

  const currentCompliance = compliance[compliance.length - 1].value;
  // Si aún no hay histórico de meses anteriores, no hay con qué comparar.
  const previousEntry = compliance.length > 1 ? compliance[compliance.length - 2] : null;
  const previousCompliance = previousEntry ? previousEntry.value : null;
  const delta = previousCompliance !== null ? currentCompliance - previousCompliance : 0;
  const deltaPositive = delta >= 0;
  const hasComparison = previousEntry !== null;
  const avgCompliance = Math.round(compliance.reduce((sum, c) => sum + c.value, 0) / compliance.length);
  const best = compliance.reduce((a, b) => (b.value > a.value ? b : a));

  // Geometría del gráfico — curva suavizada (Bezier) en vez de líneas rectas, en una grilla de mayor resolución.
  const chartW = 300, chartH = 132, padX = 22, padY = 22;
  const chartMin = Math.max(0, Math.min(...compliance.map(c => c.value)) - 8);
  const chartMax = Math.min(100, Math.max(...compliance.map(c => c.value)) + 8);
  const pointsXY = compliance.map((c, i) => {
    const x = padX + (i / Math.max(compliance.length - 1, 1)) * (chartW - padX * 2);
    const y = chartH - padY - ((c.value - chartMin) / (chartMax - chartMin || 1)) * (chartH - padY * 2);
    return { x, y, ...c };
  });
  const smoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      const midX = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };
  const linePath = smoothPath(pointsXY);
  const areaPath = linePath ? `${linePath} L ${pointsXY[pointsXY.length - 1].x} ${chartH - 2} L ${pointsXY[0].x} ${chartH - 2} Z` : '';
  // Líneas de referencia horizontales (25/50/75/100%) mapeadas al rango visible del gráfico.
  const gridLines = [25, 50, 75, 100]
    .filter(pct => pct >= chartMin && pct <= chartMax)
    .map(pct => ({ pct, y: chartH - padY - ((pct - chartMin) / (chartMax - chartMin || 1)) * (chartH - padY * 2) }));

  const ringR = 42;
  const ringCirc = 2 * Math.PI * ringR;

  const comparisonLabel = hasComparison
    ? `${deltaPositive ? '+' : ''}${delta}% vs. ${previousEntry.month.toLowerCase()}`
    : 'Sin mes anterior registrado';

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text }}>
      <Toast toast={toast} />

      {/* ============ HERO ============ */}
      <div style={{
        background: `linear-gradient(120deg, ${BRAND.greenDark} 0%, ${BRAND.green} 45%, ${BRAND.greenMid} 100%)`,
        borderRadius: 18, padding: '32px 36px', marginBottom: 22, color: '#fff',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32,
        flexWrap: 'wrap',
      }}>
        {/* Textura tipo documento oficial */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }} width="100%" height="100%">
          <defs>
            <pattern id="unitHeroPattern" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="22" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#unitHeroPattern)" />
        </svg>
        <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,107,0,0.10)' }} />

        {/* Texto */}
        <div style={{ position: 'relative', minWidth: 260, flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: BRAND.orangeSoft, display: 'inline-block' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>Panel de coordinación</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            Buen trabajo, {userName?.split(' ')[0] || userName}
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: 14, opacity: 0.85, maxWidth: 380, lineHeight: 1.5 }}>
            Tu unidad mantiene un nivel de cumplimiento sólido este mes. Aquí tienes el resumen de la gestión.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 14px', fontSize: 12.5, fontWeight: 600 }}>
              <IconAward size={14} /> Meta mensual: 85%
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 14px', fontSize: 12.5, fontWeight: 600 }}>
              {pendingCount} informe{pendingCount !== 1 ? 's' : ''} en revisión
            </span>
          </div>
        </div>

        {/* Aro de cumplimiento con variación real vs. mes anterior */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <svg width="128" height="128" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={ringR} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
            <circle
              cx="50" cy="50" r={ringR} fill="none" stroke={BRAND.orangeSoft} strokeWidth="9"
              strokeDasharray={`${ringCirc * (currentCompliance / 100)} ${ringCirc}`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray .3s ease' }}
            />
            <text x="50" y="47" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{currentCompliance}%</text>
            <text x="50" y="63" textAnchor="middle" fontSize="7" fontWeight="600" fill="rgba(255,255,255,0.75)" letterSpacing="0.05em">CUMPLIMIENTO</text>
          </svg>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
            color: deltaPositive ? '#bbf7d0' : '#fed7aa',
            background: 'rgba(0,0,0,0.15)', borderRadius: 20, padding: '3px 10px',
          }}>
            {hasComparison && (deltaPositive ? <IconTrendUp size={12} /> : <IconTrendDown size={12} />)}
            {comparisonLabel}
          </span>
        </div>
      </div>

      {/* ============ TARJETAS KPI ============ */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        {stats.map((s) => {
          const StatIcon = s.icon;
          return (
            <div key={s.key} onClick={() => onViewChange?.(s.target)} style={{
              background: colors.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${colors.border}`,
              borderLeft: `3px solid ${s.accent}`, boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer',
              transition: 'box-shadow .15s, transform .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = isDark ? '0 6px 18px rgba(0,0,0,0.3)' : '0 6px 18px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}>
                  <StatIcon size={19} />
                </div>
                <IconArrowRight size={14} style={{ color: colors.textMuted }} />
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: colors.text, lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ============ ACTIVIDAD RECIENTE + FECHAS ============ */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>

        {/* Actividad Reciente — línea de tiempo */}
        <div style={{ background: colors.card, borderRadius: 14, padding: 22, border: `1px solid ${colors.border}`, boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>Actividad reciente</div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Últimas acciones de tus instructores</div>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: colors.textMuted, fontSize: 13 }}>Aún no hay actividad reciente</div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: 6, bottom: 6, width: 2, background: colors.border }} />
              {recentActivity.map((act, i) => {
                const style = ACTIVITY_STYLE[act.kind];
                const ActIcon = style.Icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 0', position: 'relative' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: style.bg, border: `2px solid ${colors.card}`, boxShadow: `0 0 0 1px ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.color, flexShrink: 0, zIndex: 1 }}>
                      <ActIcon size={13} />
                    </div>
                    <div style={{ flex: 1, paddingTop: 2 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{act.name}</div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 1.4 }}>{act.action}</div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{act.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fechas Importantes — tarjetas tipo calendario */}
        <div style={{ background: colors.card, borderRadius: 14, padding: 22, border: `1px solid ${colors.border}`, boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>Fechas importantes</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Próximos vencimientos y eventos</div>
            </div>
            <button onClick={() => { setEditingDateId(null); setNewDate({ label: '', date: '', urgent: false }); setShowAddDate(true); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none',
              background: `linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              + Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dates.map((d) => {
              const tile = parseDateForTile(d.date);
              return (
                <div key={d.id} style={{ background: colors.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {tile ? (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.card, border: `1px solid ${colors.border}`, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ background: d.urgent ? BRAND.orangeMid : BRAND.greenMid, color: '#fff', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.06em', textAlign: 'center', padding: '2px 0' }}>{tile.month}</div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: colors.text }}>{tile.day}</div>
                    </div>
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.card, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary, flexShrink: 0 }}>
                      <IconCalendar size={19} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{d.date}</div>
                    {d.urgent && (
                      <span style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: dangerBg, color: isDark ? '#f87171' : BRAND.danger, fontSize: 10.5, fontWeight: 700 }}>
                        <IconAlertTriangle size={10} /> Urgente
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => openEditDate(d)}
                      title="Editar"
                      style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = greenBg}
                      onMouseLeave={e => e.currentTarget.style.background = colors.card}
                    ><IconPencil size={13} /></button>
                    <button
                      onClick={() => deleteDate(d.id, d.label)}
                      title="Eliminar"
                      style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${dangerBorder}`, background: dangerBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#f87171' : BRAND.danger, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(220,38,38,0.28)' : '#FEE2E2'}
                      onMouseLeave={e => e.currentTarget.style.background = dangerBg}
                    ><IconTrash size={13} /></button>
                  </div>
                </div>
              );
            })}
            {dates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 0', color: colors.textMuted, fontSize: 13 }}>No hay fechas registradas</div>
            )}
          </div>
        </div>
      </div>

      {/* ============ CUMPLIMIENTO — tendencia trimestral (basada en datos reales) ============ */}
      <div style={{ background: colors.card, borderRadius: 14, padding: '24px 28px', border: `1px solid ${colors.border}`, boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes senaDrawLine { from { stroke-dashoffset: 480; } to { stroke-dashoffset: 0; } }
          @keyframes senaFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes senaPulseRing { 0% { r: 5; stroke-opacity: .6; } 100% { r: 16; stroke-opacity: 0; } }
          .sena-trend-line { stroke-dasharray: 480; stroke-dashoffset: 480; animation: senaDrawLine 1.3s cubic-bezier(.4,0,.2,1) forwards; }
          .sena-fade-up { opacity: 0; animation: senaFadeUp .5s ease forwards; }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>Tendencia de cumplimiento</div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Calculada a partir de los informes aprobados y pendientes de la unidad</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: deltaPositive ? BRAND.greenSoft : BRAND.orangeMid, background: deltaPositive ? greenBg : orangeBg, borderRadius: 20, padding: '6px 13px' }}>
            {hasComparison && (deltaPositive ? <IconTrendUp size={13} /> : <IconTrendDown size={13} />)}
            {comparisonLabel}
          </span>
        </div>

        {/* Resumen rápido: mes actual / promedio / mejor mes */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: `${CURRENT_MONTH.month} (actual, en vivo)`, value: currentCompliance, accent: BRAND.orangeMid, bg: orangeBg },
            { label: 'Promedio trimestral', value: avgCompliance, accent: BRAND.greenMid, bg: greenBg },
            { label: `Mejor mes · ${best.month}`, value: best.value, accent: BRAND.greenSoft, bg: greenBg },
          ].map((m, i) => (
            <div key={m.label} className="sena-fade-up" style={{ animationDelay: `${i * 90}ms`, flex: '1 1 160px', background: m.bg, borderRadius: 12, padding: '13px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: m.accent, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{m.value}%</div>
              <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 3, fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 36, flexWrap: 'wrap' }}>
          {/* Curva suavizada de tendencia */}
          <div style={{ flex: '1 1 300px', minWidth: 260 }}>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="180" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="complianceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND.greenSoft} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={BRAND.greenSoft} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="complianceStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={BRAND.greenMid} />
                  <stop offset="100%" stopColor={BRAND.orangeMid} />
                </linearGradient>
                <filter id="complianceGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {gridLines.map(g => (
                <g key={g.pct}>
                  <line x1={padX} y1={g.y} x2={chartW - padX} y2={g.y} stroke={colors.border} strokeWidth="1" strokeDasharray="3 4" />
                  <text x={0} y={g.y + 3} fontSize="8" fontWeight="600" fill={colors.textMuted}>{g.pct}</text>
                </g>
              ))}

              {areaPath && <path d={areaPath} fill="url(#complianceFill)" />}
              {linePath && <path d={linePath} className="sena-trend-line" fill="none" stroke="url(#complianceStroke)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#complianceGlow)" />}

              {pointsXY.map((p, i) => {
                const isCurrent = i === pointsXY.length - 1;
                return (
                  <g key={i}>
                    {isCurrent && (
                      <circle cx={p.x} cy={p.y} r="5" fill="none" stroke={BRAND.orangeMid} strokeWidth="2" style={{ animation: 'senaPulseRing 1.8s ease-out infinite', transformOrigin: `${p.x}px ${p.y}px` }} />
                    )}
                    <circle cx={p.x} cy={p.y} r={isCurrent ? 5 : 4} fill={colors.card} stroke={isCurrent ? BRAND.orangeMid : BRAND.greenMid} strokeWidth="2.4" />
                    <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="12" fontWeight="800" fill={colors.text}>{p.value}%</text>
                    <text x={p.x} y={chartH - 2} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={isCurrent ? BRAND.orangeMid : colors.textMuted} letterSpacing="0.05em">{p.short}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Anillos por mes, con variación respecto al mes anterior */}
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', paddingBottom: 8 }}>
            {compliance.map((c, i) => {
              const isCurrent = i === compliance.length - 1;
              const prev = compliance[i - 1];
              const monthDelta = prev ? c.value - prev.value : null;
              const size = 76, strokeW = 7, r = (size - strokeW) / 2, circ = 2 * Math.PI * r;
              const ringColor = isCurrent ? BRAND.orangeMid : BRAND.greenMid;
              return (
                <div key={c.month} className="sena-fade-up" style={{ animationDelay: `${300 + i * 110}ms`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.bg} strokeWidth={strokeW} />
                    <circle
                      cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={strokeW}
                      strokeDasharray={`${circ * (c.value / 100)} ${circ}`} strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                    <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill={colors.text}>{c.value}%</text>
                  </svg>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: isCurrent ? BRAND.orangeMid : colors.textSecondary }}>{isCurrent ? `${c.short} · hoy` : c.short}</div>
                  {monthDelta !== null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: monthDelta >= 0 ? BRAND.greenSoft : BRAND.orangeMid }}>
                      {monthDelta >= 0 ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                      {monthDelta >= 0 ? '+' : ''}{monthDelta}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => onViewChange?.('report-management')} style={{
          width: '100%', marginTop: 24, padding: '12px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`, color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Ver estadísticas completas <IconArrowRight size={15} />
        </button>
      </div>

      {/* ============ MODAL: Agregar / Editar fecha ============ */}
      {showAddDate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)' }}
          onClick={closeDateModal}>
          <div style={{ background: colors.card, borderRadius: 18, width: 'min(420px,100%)', padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: colors.text }}>{editingDateId ? 'Editar fecha importante' : 'Agregar fecha importante'}</div>
              <button onClick={closeDateModal} style={{ border: 'none', background: colors.bg, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary }}>
                <IconX size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 5 }}>Descripción</label>
                <input value={newDate.label} onChange={e => setNewDate(d => ({ ...d, label: e.target.value }))}
                  placeholder="Ej: Entrega de informes mensuales"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${colors.border}`, fontSize: 13, color: colors.textSecondary, background: colors.inputBg, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 5 }}>Fecha</label>
                <input value={newDate.date} onChange={e => setNewDate(d => ({ ...d, date: e.target.value }))}
                  placeholder="Ej: 15 de noviembre"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${colors.border}`, fontSize: 13, color: colors.textSecondary, background: colors.inputBg, outline: 'none' }} />
              </div>
              <label htmlFor="urgent" style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '2px 0', cursor: 'pointer' }}>
                <input type="checkbox" id="urgent" checked={newDate.urgent || false} onChange={e => setNewDate(d => ({ ...d, urgent: e.target.checked }))} style={{ cursor: 'pointer', accentColor: BRAND.greenMid }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: colors.textSecondary }}>Marcar como urgente</span>
              </label>
              <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <button onClick={closeDateModal} style={{ padding: '11px', borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.bg, color: colors.textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={saveDate} style={{ padding: '11px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  {editingDateId ? 'Guardar cambios' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}