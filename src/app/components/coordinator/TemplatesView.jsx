import { useState, useEffect } from 'react';

const FILE_ICONS = {
  DOCX: { icon: '📘', bg: '#EEF2FF', color: '#4f46e5', border: '#C7D2FE' },
  XLSX: { icon: '📗', bg: '#F0FDF4', color: '#16a34a', border: '#BBF7D0' },
  PDF:  { icon: '📕', bg: '#FEF2F2', color: '#dc2626', border: '#FECACA' },
};

const CATEGORY_STYLES = {
  'Académico':     { bg: '#EEF2FF', color: '#4f46e5' },
  'Evaluación':    { bg: '#FFF7ED', color: '#c2410c' },
  'Administrativo':{ bg: '#F0FDF4', color: '#15803d' },
  'Personal':      { bg: '#F5F3FF', color: '#7c3aed' },
};

const initialTemplates = [
  {
    id: 1,
    name: 'Plantilla_Plan_Formacion_2025.docx',
    description: 'Formato oficial para el plan de formación anual',
    category: 'Académico',
    type: 'DOCX',
    version: 'v1',
    updatedAt: '2025-10-20',
    updatedBy: 'Coordinación Académica',
    size: '245 KB',
  },
];

function UploadModal({ onClose, onUpload }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'Académico', type: 'DOCX', version: 'v1' });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (!form.name) set('name', f.name);
    const ext = f.name.split('.').pop().toUpperCase();
    if (['DOCX', 'XLSX', 'PDF'].includes(ext)) set('type', ext);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { alert('Ingresa un nombre'); return; }
    onUpload({
      id: Date.now(),
      ...form,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: 'Coordinador',
      size: file ? `${(file.size / 1024).toFixed(0)} KB` : '—',
    });
    onClose();
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    borderRadius: 10, border: '1.5px solid #E8ECF0', fontSize: 13,
    color: '#374151', background: '#F7F9FC', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: 'min(520px,100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>+ Nueva Plantilla</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Sube un documento para los instructores</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            style={{
              border: `2px dashed ${dragging ? '#16a34a' : file ? '#16a34a' : '#D1D5DB'}`,
              borderRadius: 14, padding: '24px 16px', textAlign: 'center',
              background: dragging ? '#F0FDF4' : file ? '#F0FDF4' : '#F9FAFB',
              cursor: 'pointer', transition: 'all .2s',
            }}
            onClick={() => document.getElementById('file-input-tpl').click()}
          >
            <input id="file-input-tpl" type="file" accept=".docx,.xlsx,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{FILE_ICONS[form.type]?.icon || '📄'}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: '#16a34a' }}>✅ Archivo listo</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Arrastra tu archivo aquí</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>o haz clic para seleccionar · DOCX, XLSX, PDF</div>
              </>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre del documento</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Plantilla_Informe_GC_2025.docx" />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64, paddingTop: 9 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Breve descripción del documento..." />
          </div>

          {/* Categoría + Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
                {Object.keys(CATEGORY_STYLES).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => set('type', e.target.value)}>
                {['DOCX', 'XLSX', 'PDF'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Versión */}
          <div>
            <label style={labelStyle}>Versión</label>
            <input style={inputStyle} value={form.version} onChange={e => set('version', e.target.value)} placeholder="v1" />
          </div>

          {/* Botones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0', background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSubmit} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              ☁️ Subir Plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ template, onClose, onConfirm }) {
  if (!template) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: 'min(420px,100%)', padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🗑</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Eliminar Plantilla</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>¿Seguro que deseas eliminar <strong>{template.name}</strong>? Esta acción no se puede deshacer.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0', background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { onConfirm(template.id); onClose(); }} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Sí, Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesView() {
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('sitmi_templates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialTemplates;
  });
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (msg, color = '#16a34a') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = (tpl) => {
    setTemplates(prev => {
      const next = [...prev, tpl];
      try { localStorage.setItem('sitmi_templates', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('✅ Plantilla subida correctamente');
  };

  const handleDelete = (id) => {
    setTemplates(prev => {
      const next = prev.filter(t => t.id !== id);
      try { localStorage.setItem('sitmi_templates', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('🗑 Plantilla eliminada', '#ef4444');
  };

  const handleDownload = (tpl) => {
    showToast(`⬇ Descargando ${tpl.name}...`);
  };

  const handleEdit = (tpl) => {
    showToast(`✏️ Editar plantilla: ${tpl.name}`);
  };

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { icon: '📋', label: 'Total Plantillas',      value: templates.length,                                   color: '#6366f1', bg: '#EEF2FF' },
    { icon: '☁️', label: 'Subidas Este Mes',       value: templates.filter(t => t.updatedAt?.startsWith('2025-10') || t.updatedAt?.startsWith('2025-11')).length, color: '#22c55e', bg: '#F0FDF4' },
    { icon: '✏️', label: 'Actualizaciones',        value: 0,                                                  color: '#f97316', bg: '#FFF7ED' },
    { icon: '🕐', label: 'Última Actualización',   value: 'Hace 2 días',                                      color: '#0ea5e9', bg: '#F0F9FF', small: true },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      <DeleteModal template={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📂</div>
            <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Documentos Oficiales</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Gestión de Plantillas y Requisitos</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Administra las plantillas y documentos disponibles para los instructores</p>
        </div>
        <button onClick={() => setShowUpload(true)} style={{ background: '#fff', color: '#4f46e5', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          + Nueva Plantilla
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: s.small ? 14 : 28, fontWeight: 700, color: s.color, letterSpacing: s.small ? 0 : '-1px', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Header tabla */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Plantillas Disponibles</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Administra las plantillas que los instructores pueden descargar y utilizar</div>
          </div>
          {/* Buscador */}
          <div style={{ position: 'relative', width: 240 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Buscar plantilla..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 10px 8px 32px', width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #E8ECF0', fontSize: 13, background: '#F7F9FC', outline: 'none', color: '#374151' }} />
          </div>
        </div>

        {/* Cabecera columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr 0.8fr 0.6fr 1.6fr 1fr', gap: 0, padding: '10px 24px', background: '#F7F9FC', borderBottom: '1px solid #F0F2F5' }}>
          {['Documento', 'Categoría', 'Tipo', 'Versión', 'Última Actualización', 'Acciones'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>

        {/* Filas */}
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            No hay plantillas disponibles.
          </div>
        ) : filtered.map((tpl, i) => {
          const fi = FILE_ICONS[tpl.type] || FILE_ICONS.PDF;
          const cat = CATEGORY_STYLES[tpl.category] || { bg: '#F7F9FC', color: '#374151' };
          return (
            <div key={tpl.id} style={{
              display: 'grid', gridTemplateColumns: '3fr 1.2fr 0.8fr 0.6fr 1.6fr 1fr',
              gap: 0, padding: '14px 24px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid #F7F9FC' : 'none',
              transition: 'background .1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Documento */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: fi.bg, border: `1px solid ${fi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{fi.icon}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{tpl.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{tpl.description}</div>
                </div>
              </div>
              {/* Categoría */}
              <div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cat.bg, color: cat.color }}>{tpl.category}</span>
              </div>
              {/* Tipo */}
              <div>
                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: fi.bg, color: fi.color, border: `1px solid ${fi.border}` }}>{tpl.type}</span>
              </div>
              {/* Versión */}
              <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{tpl.version}</div>
              {/* Última actualización */}
              <div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{tpl.updatedAt}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{tpl.updatedBy}</div>
              </div>
              {/* Acciones */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => handleDownload(tpl)} title="Descargar" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E8ECF0', background: '#F7F9FC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F7F9FC'}>⬇</button>
                <button onClick={() => handleEdit(tpl)} title="Editar" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E8ECF0', background: '#F7F9FC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF7ED'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F7F9FC'}>✏️</button>
                <button onClick={() => setDeleteTarget(tpl)} title="Eliminar" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}