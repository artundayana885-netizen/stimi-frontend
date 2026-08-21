import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../ThemeContext';
import { getAllUsers } from '../../../services/authService';

/* ------------------------------------------------------------------ */
/*  PALETA INSTITUCIONAL SENA                                          */
/*  Verde: Manual Identidad Visual 2022-2026 (HEX 39A900)              */
/*  Naranja: Manual Imagen Corporativa 2012 (HEX FC7323)               */
/* ------------------------------------------------------------------ */
const SENA = {
  verde: '#39A900',
  verdeOscuro: '#007832',
  azulOscuro: '#00304D',
  amarillo: '#FDC300',
  naranja: '#FC7323',
};

/* ------------------------------------------------------------------ */
/*  ICONOS — línea, 1.8px, mismo set que UserManagement/CoordinatorViews */
/* ------------------------------------------------------------------ */
const iconBase = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function IconUsers({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M16 21v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 19.5V21" />
      <circle cx="9" cy="8" r="3.25" />
      <path d="M17.5 21v-1.5a3.3 3.3 0 0 0-2.2-3.1" />
      <path d="M14.3 4.2a3.25 3.25 0 0 1 0 6.3" />
    </svg>
  );
}
function IconTarget({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.15" fill={color} stroke="none" />
    </svg>
  );
}
function IconClock({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </svg>
  );
}
function IconAlertTriangle({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M10.6 3.5 2.2 18a1.9 1.9 0 0 0 1.65 2.85h16.3A1.9 1.9 0 0 0 21.8 18L13.4 3.5a1.9 1.9 0 0 0-3.3 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.6h.01" />
    </svg>
  );
}
function IconBarChart({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-7" />
    </svg>
  );
}
function IconDownload({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M12 4v11" />
      <path d="m7.2 10.7 4.8 4.8 4.8-4.8" />
      <path d="M5 19.5h14" />
    </svg>
  );
}
function IconCalendar({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
      <path d="M3.5 9.8h17" />
      <path d="M8 3v3.6M16 3v3.6" />
    </svg>
  );
}

// Brote — mismo guiño de "formación / crecimiento" del resto de la app
function SproutIcon({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M12 10c0-3.5-2.5-6-7-6 0 4.5 2.5 7 7 7" />
      <path d="M12 13c0-3.9 2.8-6.7 7.5-6.7 0 4.9-2.8 7.7-7.5 7.7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  DATOS BASE                                                         */
/* ------------------------------------------------------------------ */

const CURRENT_DATE = new Date();
const CURRENT_YEAR = String(CURRENT_DATE.getFullYear());
const CURRENT_MONTH_INDEX = CURRENT_DATE.getMonth();

// Años disponibles en el selector de filtros: el actual y los dos siguientes.
// Solo el año actual tiene datos reales (el resto todavía no ha ocurrido).
const YEARS = [CURRENT_YEAR, String(Number(CURRENT_YEAR) + 1), String(Number(CURRENT_YEAR) + 2)];

const MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Áreas institucionales (mismas que en Gestión de Usuarios, para que el
// filtro de área sea consistente en toda la aplicación).
const AREAS = [
  'Gestión Administrativa',
  'Gestión Empresarial',
  'Gestión de Mercados',
  'Contabilidad y Finanzas',
  'Análisis y Desarrollo de Sistemas de Información',
  'Gestión de Redes de Datos',
  'Producción de Multimedia',
  'Producción Agropecuaria Ecológica',
  'Agricultura de Precisión',
  'Control Ambiental',
  'Gestión de Recursos Naturales',
  'Guianza Turística',
  'Gestión de Servicios Turísticos',
];

const AREA_COLORS = [SENA.verde, SENA.naranja, '#22C55E', '#EA580C', '#65A30D', SENA.amarillo, SENA.azulOscuro, '#16A34A', '#F97316'];

function initialsOf(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  HELPERS DE AGREGACIÓN                                              */
/*  Reciben AREAS/AREA_DATA como parámetro porque ahora se construyen  */
/*  en tiempo real a partir de los instructores obtenidos del backend. */
/* ------------------------------------------------------------------ */

function round(n) { return Math.round(n * 10) / 10; }

function getMonthlyForArea(areaKey, areaList, areaData) {
  const areas = areaKey === 'Todas las áreas' ? areaList : [areaKey].filter(a => areaData[a]);
  const months = [];
  for (let i = 0; i < 12; i++) {
    if (areas.length === 0) { months.push(null); continue; }
    let gcSum = 0, gfSum = 0, count = 0;
    areas.forEach(a => {
      const m = areaData[a]?.monthly?.[i];
      if (m) { gcSum += m.gc; gfSum += m.gf; count++; }
    });
    months.push(count ? { gc: round(gcSum / count), gf: round(gfSum / count) } : null);
  }
  return months;
}

function getStatsForArea(areaKey, monthIndex, areaList, areaData) {
  const areas = areaKey === 'Todas las áreas' ? areaList : [areaKey].filter(a => areaData[a]);

  if (areas.length === 0) {
    return { instructors: 0, pending: 0, alerts: 0, compliance: null };
  }

  const instructors = areas.reduce((s, a) => s + (areaData[a].instructors ?? 0), 0);
  const pending = areas.reduce((s, a) => s + (areaData[a].pending ?? 0), 0);
  const alerts = areas.reduce((s, a) => s + (areaData[a].alerts ?? 0), 0);

  let compliance = null;
  if (monthIndex === null) {
    let total = 0, count = 0;
    areas.forEach(a => {
      (areaData[a].monthly || []).forEach(m => { if (m) { total += (m.gc + m.gf) / 2; count++; } });
    });
    compliance = count ? round(total / count) : null;
  } else {
    let total = 0, count = 0;
    areas.forEach(a => {
      const m = areaData[a].monthly?.[monthIndex];
      if (m) { total += (m.gc + m.gf) / 2; count++; }
    });
    compliance = count ? round(total / count) : null;
  }

  return { instructors, pending, alerts, compliance };
}

function getTopInstructorsForArea(areaKey, areaList, areaData) {
  const areas = areaKey === 'Todas las áreas' ? areaList : [areaKey].filter(a => areaData[a]);
  const list = areas.flatMap(a => (areaData[a].topInstructors || []).map(i => ({ ...i, area: a })));
  return list.sort((a, b) => b.value - a.value).slice(0, 5);
}

function getAreaBreakdown(areaList, areaData) {
  const totalInstructors = areaList.reduce((s, a) => s + (areaData[a]?.instructors ?? 0), 0);
  if (totalInstructors === 0) return [];
  return areaList
    .filter(a => (areaData[a]?.instructors ?? 0) > 0)
    .map(a => ({
      name: a,
      value: round(((areaData[a]?.instructors ?? 0) / totalInstructors) * 100),
      color: areaData[a]?.color || SENA.verde,
    }));
}

/* ------------------------------------------------------------------ */
/*  GRÁFICOS — reciben `c` (colors del tema) para grid/labels          */
/* ------------------------------------------------------------------ */

function BarChart({ data, c }) {
  const max = 100;
  const hasAnyData = data.some(d => d.value !== null);

  const marginLeft = 28;
  const marginRight = 12;
  const chartH = 130;
  const plotW = 560; // ancho fijo del área de trazado; el SVG escala al 100% del contenedor
  const totalW = plotW + marginLeft + marginRight;

  // Con pocos meses (p. ej. un solo mes seleccionado) igual reparte el
  // ancho fijo del gráfico, así nunca se ve como una barra suelta y cortada.
  const groupW = plotW / Math.max(data.length, 1);
  const barW = Math.min(26, (groupW - 10) / 2);

  if (!hasAnyData) {
    return (
      <div style={{
        width: '100%', height: chartH + 26, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        background: c.inputBg, borderRadius: 10, border: `1px dashed ${c.border}`,
      }}>
        <IconBarChart size={22} color={c.textFaint} />
        <div style={{ fontSize: 12.5, color: c.textFaint, fontWeight: 500 }}>Sin informes registrados para este periodo</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: chartH + 26 }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${totalW} ${chartH + 26}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${marginLeft}, 0)`}>
          {[0, 50, 100].map((line) => (
            <g key={line}>
              <line x1={0} y1={chartH - (line / max) * chartH} x2={plotW} y2={chartH - (line / max) * chartH} stroke={c.border} strokeWidth={1} />
              <text x={-8} y={chartH - (line / max) * chartH + 3} textAnchor="end" fontSize={9} fill={c.textFaint}>{line}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = i * groupW + (groupW - (barW * 2 + 4)) / 2;
            const hasData = d.value !== null;
            return (
              <g key={d.month}>
                {hasData ? (
                  <>
                    <rect x={x} y={chartH - (d.value.gc / max) * chartH} width={barW} height={Math.max((d.value.gc / max) * chartH, 2)} fill={SENA.verde} rx={4} />
                    <rect x={x + barW + 4} y={chartH - (d.value.gf / max) * chartH} width={barW} height={Math.max((d.value.gf / max) * chartH, 2)} fill={SENA.naranja} rx={4} />
                  </>
                ) : (
                  <>
                    <rect x={x} y={chartH - 2} width={barW} height={2} fill={c.border} rx={1} />
                    <rect x={x + barW + 4} y={chartH - 2} width={barW} height={2} fill={c.border} rx={1} />
                  </>
                )}
                <text x={x + barW} y={chartH + 16} textAnchor="middle" fontSize={9.5} fontWeight={500} fill={c.textMuted}>{d.month}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}


function DonutChart({ data, centerLabel, centerValue, c }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length || total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={55} fill="none" stroke={c.border} strokeWidth={16} />
          <circle cx={70} cy={70} r={32} fill={c.card} />
          <text x={70} y={67} textAnchor="middle" fontSize={14} fontWeight={700} fill={c.text}>{centerValue}</text>
          <text x={70} y={82} textAnchor="middle" fontSize={9} fill={c.textFaint}>{centerLabel}</text>
        </svg>
        <div style={{ fontSize: 12, color: c.textFaint }}>Sin datos por área</div>
      </div>
    );
  }

  let cumulative = 0;
  const r = 55; const cx = 70; const cy = 70;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return { ...d, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        {slices.map((s) => <path key={s.name} d={s.d} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={32} fill={c.card} />
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize={14} fontWeight={700} fill={c.text}>{centerValue}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill={c.textFaint}>{centerLabel}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: c.textMuted }}>{d.name}</span>
            <span style={{ fontWeight: 700, color: c.text, marginLeft: 'auto' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENTE PRINCIPAL                                               */
/* ------------------------------------------------------------------ */

export default function Reports() {
  const { colors: c } = useTheme();

  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState(YEARS[0]);
  const [monthLabel, setMonthLabel] = useState('Todos los meses');
  const [area, setArea] = useState('Todas las áreas');

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllUsers();
        setDbUsers(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthIndex = monthLabel === 'Todos los meses' ? null : MONTHS_FULL.indexOf(monthLabel);

  // Solo se cuentan los usuarios con rol asignado (no las solicitudes
  // pendientes de aprobación) y con cuenta activa.
  const instructorsList = useMemo(() => (
    dbUsers
      .filter(u => u.estado !== 'Pendiente')
      .map(u => ({
        name: u.name,
        area: u.area || 'Sin asignar',
        compliance: u.compliance ?? null,
        active: u.active,
      }))
  ), [dbUsers]);

  // Construye AREA_DATA en tiempo real a partir de los instructores reales.
  // Como el backend aún no expone un histórico mensual de Gestión
  // Contractual (GC) / Gestión Financiera (GF), el cumplimiento actual de
  // cada instructor se registra en el mes en curso; los demás meses
  // quedan sin datos hasta que existan informes históricos.
  const areaData = useMemo(() => {
    const data = {};
    AREAS.forEach((a, idx) => {
      const inArea = instructorsList.filter(i => i.area === a && i.active !== false);
      const withCompliance = inArea.filter(i => i.compliance !== null);
      const avgCompliance = withCompliance.length
        ? round(withCompliance.reduce((s, i) => s + i.compliance, 0) / withCompliance.length)
        : null;

      const monthly = Array(12).fill(null);
      if (avgCompliance !== null) monthly[CURRENT_MONTH_INDEX] = { gc: avgCompliance, gf: avgCompliance };

      const color = AREA_COLORS[idx % AREA_COLORS.length];

      data[a] = {
        color,
        instructors: inArea.length,
        pending: inArea.filter(i => i.compliance === null).length,
        alerts: withCompliance.filter(i => i.compliance < 80).length,
        monthly,
        topInstructors: withCompliance
          .sort((x, y) => y.compliance - x.compliance)
          .slice(0, 5)
          .map(i => ({ name: i.name, value: i.compliance, initials: initialsOf(i.name), color, bg: color })),
      };
    });
    return data;
  }, [instructorsList]);

  const yearHasData = !loading && year === CURRENT_YEAR && instructorsList.length > 0;

  const monthlyRaw = useMemo(() => getMonthlyForArea(area, AREAS, areaData), [area, areaData]);
  const chartData = useMemo(() => {
    if (monthIndex === null) {
      return MONTHS_SHORT.map((m, i) => ({ month: m, value: monthlyRaw[i] }));
    }
    return [{ month: MONTHS_SHORT[monthIndex], value: monthlyRaw[monthIndex] }];
  }, [monthlyRaw, monthIndex]);

  const stats = useMemo(() => getStatsForArea(area, monthIndex, AREAS, areaData), [area, monthIndex, areaData]);
  const topInstructors = useMemo(() => getTopInstructorsForArea(area, AREAS, areaData), [area, areaData]);
  const areaBreakdown = useMemo(() => getAreaBreakdown(AREAS, areaData), [areaData]);

  // No debe ser posible exportar nada mientras no haya informes cargados
  // para el año/filtros seleccionados: sin esta guarda, el botón generaba
  // un CSV vacío ("—", 0, 0, 0) que no le sirve a nadie.
  const handleExportCSV = () => {
    if (!yearHasData) return;

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Reporte de Cumplimiento - SENA SITMI\n";
    csvContent += `Filtros: Año: ${year} | Mes: ${monthLabel} | Área: ${area}\n\n`;

    csvContent += "Indicador;Valor\n";
    csvContent += `Total Instructores;${stats.instructors}\n`;
    csvContent += `Cumplimiento General;${stats.compliance !== null ? stats.compliance + "%" : "—"}\n`;
    csvContent += `Informes Pendientes;${stats.pending}\n`;
    csvContent += `Con Alertas;${stats.alerts}\n\n`;

    csvContent += "Mes;Gestion Contractual (GC) %;Gestion Financiera (GF) %\n";
    chartData.forEach(d => {
      const gcVal = d.value ? d.value.gc : "—";
      const gfVal = d.value ? d.value.gf : "—";
      csvContent += `${d.month};${gcVal};${gfVal}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_cumplimiento_${year}_${area.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sel = {
    padding: '8px 12px', borderRadius: 8, border: `1px solid ${c.borderStrong}`,
    fontSize: 13, background: c.inputBg, color: c.textSecondary, cursor: 'pointer', outline: 'none',
  };

  const statCards = [
    { Icon: IconUsers, value: yearHasData ? stats.instructors : 0, label: 'Total Instructores', color: SENA.verde, bg: '#EAF6DE', trend: 'up' },
    { Icon: IconTarget, value: yearHasData && stats.compliance !== null ? `${stats.compliance}%` : '—', label: 'Cumplimiento General', color: SENA.verde, bg: '#EAF6DE', trend: 'up' },
    { Icon: IconClock, value: yearHasData ? stats.pending : 0, label: 'Informes Pendientes', color: '#8A6B00', bg: '#FFF6D6', trend: 'down' },
    { Icon: IconAlertTriangle, value: yearHasData ? stats.alerts : 0, label: 'Con Alertas', color: '#ef4444', bg: '#FEF2F2', trend: 'down' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: c.text }}>

      {/* Banner — degradado verde institucional SENA */}
      <div className="coord-banner" style={{
        background: `linear-gradient(135deg, ${SENA.verde} 0%, ${SENA.verdeOscuro} 100%)`,
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 130, bottom: -10, opacity: 0.16, transform: 'scale(2.6) rotate(8deg)' }}>
          <SproutIcon size={40} color="#fff" />
        </div>
        <div style={{ color: '#fff', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconBarChart size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Análisis y Estadísticas</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Reportes y Estadísticas</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Visualiza el desempeño general de tu unidad</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!yearHasData}
          title={yearHasData ? 'Descargar reporte en CSV' : 'No hay informes para exportar todavía'}
          style={{
            background: yearHasData ? '#fff' : 'rgba(255,255,255,0.35)',
            color: yearHasData ? SENA.verdeOscuro : 'rgba(0,48,26,0.55)',
            border: 'none',
            borderRadius: 10, padding: '10px 20px', fontWeight: 700,
            fontSize: 13, cursor: yearHasData ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 7,
            position: 'relative', opacity: yearHasData ? 1 : 0.75,
          }}
        >
          <IconDownload size={15} color={yearHasData ? SENA.verdeOscuro : 'rgba(0,48,26,0.55)'} />
          Exportar Reporte
        </button>
      </div>

      {/* Filtros */}
      <div className="coord-filters" style={{ background: c.card, borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: `1px solid ${c.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={year} onChange={(e) => setYear(e.target.value)} style={sel}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={monthLabel} onChange={(e) => setMonthLabel(e.target.value)} style={sel}>
          <option>Todos los meses</option>
          {MONTHS_FULL.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={area} onChange={(e) => setArea(e.target.value)} style={sel}>
          <option>Todas las áreas</option>
          {AREAS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {!yearHasData ? (
        <div style={{ background: c.card, borderRadius: 14, padding: '48px 24px', border: `1px solid ${c.border}`, textAlign: 'center', color: c.textMuted }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <IconCalendar size={30} color={c.textFaint} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, color: c.text, marginBottom: 4 }}>
            {loading ? 'Cargando informes…' : `Aún no hay informes para ${year}`}
          </div>
          <div style={{ fontSize: 13 }}>
            {loading ? 'Obteniendo los datos de instructores.' : 'Los datos de este año todavía no están disponibles.'}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {statCards.map((s) => (
              <div key={s.label} style={{ background: c.card, borderRadius: 14, padding: '18px', border: `1px solid ${c.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.Icon size={19} color={s.color} />
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    {s.trend === 'up'
                      ? <path d="M6 17 12 7l6 10" />
                      : <path d="M6 7 12 17l6-10" />}
                  </svg>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.text, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
            <div style={{ background: c.card, borderRadius: 14, padding: 20, border: `1px solid ${c.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: c.text }}>
                  Cumplimiento {monthIndex === null ? 'Mensual' : MONTHS_FULL[monthIndex]} {year}
                  {area !== 'Todas las áreas' && ` · ${area}`}
                </div>
                <div style={{ fontSize: 12, color: c.textFaint, marginTop: 2 }}>Comparativa GC vs GF por mes</div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                {[{ color: SENA.verde, label: 'GC' }, { color: SENA.naranja, label: 'GF' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                    <span style={{ color: c.textMuted }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <BarChart data={chartData} c={c} />
            </div>
            <div style={{ background: c.card, borderRadius: 14, padding: 20, border: `1px solid ${c.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: c.text }}>Cumplimiento por Área</div>
                <div style={{ fontSize: 12, color: c.textFaint, marginTop: 2 }}>Desempeño por programa</div>
              </div>
              <DonutChart
                data={areaBreakdown}
                centerLabel="General"
                centerValue={stats.compliance !== null ? `${stats.compliance}%` : '—'}
                c={c}
              />
            </div>
          </div>

          {/* Top instructors */}
          <div style={{ background: c.card, borderRadius: 14, padding: 20, border: `1px solid ${c.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: c.text, marginBottom: 14 }}>
              Mejores Instructores{area !== 'Todas las áreas' && ` · ${area}`}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topInstructors.length === 0 && (
                <div style={{ fontSize: 13, color: c.textFaint }}>No hay instructores para mostrar.</div>
              )}
              {topInstructors.map((inst) => (
                <div key={inst.name} className="coord-instructor-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: inst.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{inst.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inst.name}</div>
                    <div style={{ fontSize: 11, color: c.textFaint }}>{inst.area}</div>
                  </div>
                  <div className="coord-progress" style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180 }}>
                    <div style={{ flex: 1, height: 6, background: c.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${inst.value}%`, background: `linear-gradient(90deg, ${SENA.verde}, ${SENA.verdeOscuro})`, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: SENA.verdeOscuro, minWidth: 36, textAlign: 'right' }}>{inst.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}