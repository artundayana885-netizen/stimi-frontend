import { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useTheme } from '../../../ThemeContext';
import { getReports } from '../../../services/reportsService';

const sena      = '#39A900';
const senaDeep  = '#1B5E0A';
const senaLight = '#7ED957';
const gold      = '#B8860B';
const goldDeep  = '#8C6408';
const brick     = '#B54A34';
const brickDeep = '#8A3323';

const serif = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
const sans  = "'Inter', 'Segoe UI', sans-serif";

const elevate = (tint = '31,42,32') =>
  `0 1px 2px rgba(${tint},0.08), 0 12px 24px -8px rgba(${tint},0.18)`;

// ── Íconos de línea, consistentes en trazo y tamaño ─────────────────────
const Icon = {
  Target: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  X: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" />
    </svg>
  ),
  Alert: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17h.01" />
    </svg>
  ),
  Trophy: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 26} height={p.size || 26} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a2 2 0 0 0 0 4h1.5" /><path d="M16 5h3a2 2 0 0 1 0 4h-1.5" />
      <path d="M12 14v4" /><path d="M9 21h6" /><path d="M9 21c0-1.7 1.3-3 3-3s3 1.3 3 3" />
    </svg>
  ),
  Trend: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17 9 11l4 4 8-8" /><path d="M15 7h6v6" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" />
    </svg>
  ),
};

// ── Anillo de progreso — la pieza distintiva del encabezado ─────────────
function ProgressRing({ value, size = 128, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  const id = 'ringGrad';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFFFE0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

export default function Compliance() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const [dbReports, setDbReports] = useState([]);

  useEffect(() => {
    getReports().then(data => {
      setDbReports(data || []);
    }).catch(console.error);
  }, []);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // ── Base de los 12 meses: ahora todos parten en "pending" (sin
  // entregas). Se rellenan únicamente con los informes reales que
  // existan en la base de datos.
  const baseMonthly = monthNames.map(month => ({ month, gc: 0, gf: 0, overall: 0, status: 'pending' }));

  const monthlyData = baseMonthly.map(m => {
    const reportsForMonth = dbReports.filter(r => {
      if (!r.date) return false;
      const monthPart = r.date.split('/')[0];
      const monthIdx = parseInt(monthPart, 10) - 1;
      return monthNames[monthIdx] === m.month;
    });

    if (reportsForMonth.length === 0) {
      return { ...m, gcStatus: 'none', gfStatus: 'none' };
    }

    let gc = m.gc;
    let gf = m.gf;
    let gcStatus = 'none';
    let gfStatus = 'none';

    reportsForMonth.forEach(r => {
      const isGc = r.type?.toUpperCase() === 'GC';
      const score = r.status === 'Aprobado' ? 100 : (r.status === 'Pendiente' ? 50 : 0);
      if (isGc) { gc = score; gcStatus = r.status; }
      else { gf = score; gfStatus = r.status; }
    });

    const overall = Math.round((gc + gf) / 2);

    // Distingue "en revisión" (entregado, aún sin evaluar) de
    // "no cumplió" (ya evaluado y devuelto a corrección).
    const submitted = [gcStatus, gfStatus].filter(s => s !== 'none');
    let status;
    if (submitted.length === 0) status = 'pending';
    else if (submitted.every(s => s === 'Aprobado')) status = 'completed';
    else if (submitted.some(s => s === 'A Corregir')) status = 'partial';
    else status = 'review';

    return { month: m.month, gc, gf, gcStatus, gfStatus, overall, status };
  });

  // Ranking de meses de mayor a menor cumplimiento (solo meses con entregas)
  const rankedData = monthlyData
    .filter(d => d.status !== 'pending')
    .map(d => ({ month: d.month.substring(0, 3), overall: d.overall, status: d.status }))
    .sort((a, b) => b.overall - a.overall);

  const completedMonths = monthlyData.filter(d => d.status !== 'pending');
  const ANNUAL = completedMonths.length > 0
    ? Math.round(completedMonths.reduce((sum, d) => sum + d.overall, 0) / completedMonths.length)
    : 0;

  // ── Contadores basados únicamente en los informes reales, sin sumas fijas.
  const approvedCount = dbReports.filter(r => r.status === 'Aprobado').length;
  const pendingCount = dbReports.filter(r => r.status === 'Pendiente').length;
  const correctionCount = dbReports.filter(r => r.status === 'A Corregir').length;

  const ink       = colors.text;
  const sub       = colors.textMuted;
  const bgPage    = colors.bg;
  const cardBorder = isDark ? colors.border : 'rgba(31,42,32,0.06)';

  const stats = [
    { label: 'Cumplimiento anual', value: `${ANNUAL}%`, Icon: Icon.Target, from: sena,      to: senaDeep,  glow: '57,169,0'  },
    { label: 'Informes completos', value: String(approvedCount),  Icon: Icon.Check,  from: '#4CAF1E', to: senaDeep,  glow: '57,169,0' },
    { label: 'Pendientes',         value: String(pendingCount),   Icon: Icon.Clock,  from: '#D2A22E', to: goldDeep,  glow: '184,134,11' },
    { label: 'Con observaciones',  value: String(correctionCount),   Icon: Icon.Alert,  from: '#C85F42', to: brickDeep, glow: '181,74,52'  },
  ];

  // Estado del mes: define un color de acento y una etiqueta — la tarjeta
  // conserva el mismo fondo neutro que el resto de la UI.
  // "review"  → informe entregado, en espera de evaluación del coordinador.
  // "partial" → informe evaluado y devuelto a corrección.
  const statusConfig = {
    completed: { color: isDark ? '#4ADE80' : senaDeep, dim: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(27,94,10,0.08)', label: 'Cumplió'      },
    review:    { color: isDark ? '#F0C048' : goldDeep,  dim: isDark ? 'rgba(240,192,72,0.14)' : 'rgba(140,100,8,0.09)', label: 'En revisión' },
    partial:   { color: isDark ? '#F0938C' : brickDeep, dim: isDark ? 'rgba(240,148,140,0.14)' : 'rgba(138,51,35,0.09)', label: 'No cumplió'  },
    pending:   { color: sub,                            dim: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(31,42,32,0.05)', label: 'Pendiente'   },
  };

  const congratsBg = isDark ? 'linear-gradient(160deg, #10240F, #0C1E0A)' : 'linear-gradient(160deg, #F2FBE8, #E2F4CE)';
  const congratsBorder = isDark ? '#1F4A2E' : '#D4EDB4';
  const pillBg = colors.card;

  // ── Nivel de desempeño y mensaje del cuadro de felicitaciones,
  // calculados a partir del cumplimiento real (ya no hay texto fijo).
  const performanceLevel = ANNUAL >= 90 ? 'Excelente' : ANNUAL >= 75 ? 'Bueno' : ANNUAL >= 50 ? 'Regular' : 'Por mejorar';

  return (
    <div className="cmp-root" style={{ fontFamily: sans, color: ink, background: bgPage, padding: '4px', borderRadius: 24 }}>
      <style>{`
        .cmp-root, .cmp-root *, .cmp-root *::before, .cmp-root *::after { box-sizing: border-box; }
        @keyframes cmpRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .cmp-anim { animation: cmpRise .5s cubic-bezier(.2,.7,.3,1) both; }

        .cmp-header { padding: 34px 40px; border-radius: 24px; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
        .cmp-header-title { font-size: 32px; }
        .cmp-ring-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .cmp-ring-center { position: absolute; display: flex; flex-direction: column; align-items: center; }
        .cmp-ring-value { font-family: ${serif}; font-size: 30px; font-weight: 700; color: #fff; line-height: 1; }
        .cmp-ring-label { font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.75); margin-top: 4px; }

        .cmp-congrats { padding: 22px 26px; gap: 20px; }
        .cmp-trophy { width: 58px; height: 58px; }
        .cmp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .cmp-stat-card { padding: 20px 18px; transition: transform .18s ease, box-shadow .18s ease; }
        .cmp-stat-card:hover { transform: translateY(-3px); }
        .cmp-stat-value { font-size: 27px; }
        .cmp-chart-card, .cmp-months-card { padding: 26px 28px; }
        .cmp-months-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .cmp-month-card { transition: transform .15s ease, box-shadow .15s ease; }
        .cmp-month-card:hover { transform: translateY(-2px); }
        .cmp-month-pending { border-style: dashed !important; box-shadow: none !important; }

        @media (max-width: 1000px) {
          .cmp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .cmp-months-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 720px) {
          .cmp-header { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 640px) {
          .cmp-header { padding: 22px 20px !important; border-radius: 18px !important; }
          .cmp-header-title { font-size: 23px !important; }
          .cmp-congrats { padding: 16px !important; gap: 14px !important; flex-direction: column !important; align-items: flex-start !important; }
          .cmp-trophy { width: 50px !important; height: 50px !important; }
          .cmp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .cmp-stat-card { padding: 14px 12px !important; }
          .cmp-stat-value { font-size: 21px !important; }
          .cmp-chart-card, .cmp-months-card { padding: 16px !important; }
          .cmp-months-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
        }
        @media (max-width: 380px) {
          .cmp-stats-grid { grid-template-columns: 1fr !important; }
          .cmp-months-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header — con anillo de progreso como pieza distintiva */}
      <div className="cmp-header cmp-anim" style={{
        background: `radial-gradient(120% 160% at 15% 0%, ${sena} 0%, ${senaDeep} 55%, #0F3D06 100%)`,
        marginBottom: 22, position: 'relative', overflow: 'hidden',
        boxShadow: elevate('15,60,6'),
      }}>
        {/* Textura de puntos sutil para dar profundidad sin distraer */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)',
          backgroundSize: '18px 18px', opacity: 0.5, pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', right: -60, top: -70, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', left: -30, bottom: -70, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,0,0,0.12)' }} />

        <div style={{ position: 'relative', maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>
            <Icon.Trend size={13} /> Análisis de desempeño
          </div>
          <h2 className="cmp-header-title" style={{ margin: '0 0 8px', fontFamily: serif, fontWeight: 600, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            Mi Cumplimiento
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6 }}>
            Seguimiento de tu desempeño y entregas durante el año
          </p>
        </div>

        <div className="cmp-ring-wrap" style={{ position: 'relative' }}>
          <ProgressRing value={ANNUAL} />
          <div className="cmp-ring-center">
            <span className="cmp-ring-value">{ANNUAL}%</span>
            <span className="cmp-ring-label">Anual</span>
          </div>
        </div>
      </div>

      {/* Congratulations — solo se muestra cuando hay al menos un mes con entregas */}
      {completedMonths.length > 0 && (
        <div className="cmp-congrats cmp-anim" style={{
          background: congratsBg,
          borderRadius: 20, border: `1px solid ${congratsBorder}`, marginBottom: 22,
          display: 'flex', alignItems: 'center', boxShadow: elevate(),
          animationDelay: '.06s',
        }}>
          <div className="cmp-trophy" style={{
            borderRadius: 18,
            background: `linear-gradient(150deg, ${sena}, ${senaDeep})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
            boxShadow: `0 10px 20px -6px rgba(57,169,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35)`,
          }}><Icon.Trophy size={26} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#4ADE80' : senaDeep, marginBottom: 4 }}>¡Excelente trabajo!</div>
            <p style={{ margin: '0 0 10px', fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.6 }}>
              Mantienes un nivel de cumplimiento del <strong style={{ color: isDark ? '#4ADE80' : senaDeep }}>{ANNUAL}%</strong> durante el año. Tu constancia se nota en cada entrega.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: pillBg, padding: '5px 13px', borderRadius: 20, fontSize: 12, color: colors.textSecondary, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <Icon.Check size={12} /> Nivel: <strong>{performanceLevel}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: pillBg, padding: '5px 13px', borderRadius: 20, fontSize: 12, color: colors.textSecondary, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <Icon.Calendar size={12} /> {completedMonths.length} {completedMonths.length === 1 ? 'mes completado' : 'meses completados'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="cmp-stats-grid cmp-anim" style={{ marginBottom: 22, animationDelay: '.1s' }}>
        {stats.map((s, i) => (
          <div key={i} className="cmp-stat-card" style={{ background: colors.card, borderRadius: 18, border: `1px solid ${cardBorder}`, boxShadow: elevate() }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: `linear-gradient(150deg, ${s.from}, ${s.to})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 14,
              boxShadow: `0 8px 16px -4px rgba(${s.glow},0.45), inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}><s.Icon /></div>
            <div className="cmp-stat-value" style={{ fontFamily: serif, fontWeight: 700, background: `linear-gradient(150deg, ${s.from}, ${s.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: sub }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="cmp-chart-card cmp-anim" style={{ background: colors.card, borderRadius: 20, border: `1px solid ${cardBorder}`, marginBottom: 22, boxShadow: elevate(), animationDelay: '.14s' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>Ranking de cumplimiento</div>
        <div style={{ fontSize: 12, color: sub, marginBottom: 22 }}>Meses ordenados de mayor a menor cumplimiento</div>
        {rankedData.length === 0 ? (
          <div style={{ padding: '32px 4px', textAlign: 'center', fontSize: 12.5, color: sub }}>
            Aún no hay entregas registradas para mostrar el ranking.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, rankedData.length * 40)}>
            <BarChart data={rankedData} layout="vertical" margin={{ top: 0, right: 34, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke={sub} style={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="month" stroke={sub} style={{ fontSize: 12 }} width={44} />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(31,42,32,0.04)' }}
                contentStyle={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: '0 12px 34px rgba(0,0,0,0.14)', fontSize: 13, color: colors.text }}
                formatter={(value, _name, item) => [statusConfig[item.payload.status].label, 'Estado']}
              />
              <Bar dataKey="overall" radius={[0, 6, 6, 0]} barSize={18}>
                {rankedData.map((d, i) => (
                  <Cell key={i} fill={statusConfig[d.status].color} />
                ))}
                <LabelList dataKey="status" position="right" formatter={(s) => statusConfig[s].label} style={{ fontSize: 11.5, fontWeight: 700, fill: colors.text }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Grid */}
      <div className="cmp-months-card cmp-anim" style={{ background: colors.card, borderRadius: 20, border: `1px solid ${cardBorder}`, boxShadow: elevate(), animationDelay: '.18s' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Cumplimiento mensual</div>
        <div className="cmp-months-grid">
          {monthlyData.map(d => {
            const cfg = statusConfig[d.status];
            const isPending = d.status === 'pending';
            return (
              <div
                key={d.month}
                className={`cmp-month-card${isPending ? ' cmp-month-pending' : ''}`}
                style={{
                  background: isPending ? 'transparent' : (isDark ? colors.bgAlt : '#FAFAF8'),
                  borderRadius: 16,
                  border: `1px solid ${cardBorder}`,
                  borderLeft: isPending ? `1px dashed ${cardBorder}` : `3px solid ${cfg.color}`,
                  padding: '16px 16px 15px',
                  boxShadow: elevate(),
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: sub, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.month}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.dim,
                    padding: '3px 9px', borderRadius: 20, letterSpacing: '0.02em',
                  }}>{cfg.label}</span>
                </div>

                {isPending ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 84, color: sub, fontSize: 11.5 }}>
                    Sin entregas aún
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[{ label: 'GC', st: d.gcStatus }, { label: 'GF', st: d.gfStatus }].map(item => {
                      const visual = item.st === 'Aprobado'
                        ? { Icon: Icon.Check, color: isDark ? '#4ADE80' : senaDeep, bg: isDark ? 'rgba(74,222,128,0.16)' : 'rgba(27,94,10,0.08)', label: 'Cumplió' }
                        : item.st === 'Pendiente'
                        ? { Icon: Icon.Clock, color: isDark ? '#F0C048' : goldDeep, bg: isDark ? 'rgba(240,192,72,0.16)' : 'rgba(140,100,8,0.09)', label: 'En revisión' }
                        : item.st === 'A Corregir'
                        ? { Icon: Icon.X, color: isDark ? '#F0938C' : brickDeep, bg: isDark ? 'rgba(240,148,140,0.16)' : 'rgba(138,51,35,0.09)', label: 'No cumplió' }
                        : { Icon: Icon.X, color: sub, bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(31,42,32,0.05)', label: 'Sin entrega' };
                      return (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                            background: visual.bg, color: visual.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <visual.Icon size={12} />
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>{item.label}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: visual.color }}>
                            {visual.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}