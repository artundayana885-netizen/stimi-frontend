import { useState, useEffect } from 'react';
import mammoth from 'mammoth';

export default function FilePreviewModal({ file, fileUrl, onClose }) {
  const [docxHtml, setDocxHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isPdf = file && /\.pdf$/i.test(file.name);
  const isDocx = file && /\.docx?$/i.test(file.name);
  const isImage = file && /\.(jpe?g|png|gif|webp)$/i.test(file.name);

  useEffect(() => {
    if (!file || !isDocx) return;
    setLoading(true);
    setError(null);
    file.arrayBuffer()
      .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
      .then(result => { setDocxHtml(result.value); setLoading(false); })
      .catch(() => { setError('No se pudo generar la vista previa de este documento Word.'); setLoading(false); });
  }, [file, isDocx]);

  if (!file) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900,
          height: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #F0F2F5', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <a
              href={fileUrl}
              download={file.name}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #E8ECF0', color: '#374151', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >⬇ Descargar</a>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E8ECF0', background: '#fff', color: '#6B7280', fontSize: 16, cursor: 'pointer' }}
            >✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', background: '#F7F9FC' }}>
          {isPdf && (
            <iframe
              src={fileUrl}
              title={file.name}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}

          {isImage && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 }}>
              <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
            </div>
          )}

          {isDocx && (
            <div style={{ padding: '32px 40px' }}>
              {loading && (
                <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: 40 }}>Generando vista previa…</div>
              )}
              {error && (
                <div style={{ textAlign: 'center', color: '#ef4444', fontSize: 13, padding: 40 }}>{error}</div>
              )}
              {!loading && !error && docxHtml && (
                <>
                  <style>{`
                    .docx-render-content table { width: 100%; border-collapse: collapse; margin: 14px 0; table-layout: fixed; }
                    .docx-render-content table td, .docx-render-content table th { border: 1px solid #E5E7EB; padding: 8px 10px; text-align: left; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
                    .docx-render-content table th { background: #F7F9FC; font-weight: 700; }
                    .docx-render-content img { max-width: 100%; height: auto; }
                    .docx-render-content p { margin: 0 0 10px; }
                    .docx-render-content h1, .docx-render-content h2, .docx-render-content h3 { margin: 18px 0 8px; }
                    .docx-render-content ul, .docx-render-content ol { padding-left: 22px; margin: 0 0 10px; }
                  `}</style>
                  <div
                    className="docx-render-content"
                    style={{ background: '#fff', borderRadius: 10, padding: '36px 44px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: 760, margin: '0 auto', color: '#111827', fontSize: 14, lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                </>
              )}
            </div>
          )}

          {!isPdf && !isImage && !isDocx && (
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: 40 }}>
              No hay vista previa disponible para este tipo de archivo. Puedes descargarlo con el botón de arriba.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}