import { useState } from 'react';
import { revisarGc } from './revisionGcService';

// Reemplaza esto por la cédula/id real del usuario logueado (ej. desde tu contexto de auth)
function useIdentificadorInstructor() {
  return 'CEDULA_DEL_INSTRUCTOR';
}

export default function UploadGcForm() {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const identificador = useIdentificadorInstructor();

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0] || null);
    setResultado(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setError('Selecciona un archivo PDF primero');
      return;
    }

    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const data = await revisarGc(archivo, identificador);
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Subir GC para revisión</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm border rounded p-2"
        />

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {cargando ? 'Revisando...' : 'Enviar para revisión'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-600 text-sm whitespace-pre-line">{error}</p>
      )}

      {resultado && (
        <div className="mt-4 p-4 bg-gray-50 border rounded text-sm whitespace-pre-line">
          {resultado.colaEstado === 'en_espera' || resultado.colaEstado === 'duplicado' ? (
            <p>{resultado.mensaje}</p>
          ) : (
            <p>{resultado.mensaje}</p>
          )}
        </div>
      )}
    </div>
  );
}