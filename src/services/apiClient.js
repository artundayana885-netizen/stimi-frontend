import axios from 'axios';

/**
 * URL base del backend (API REST de NestJS).
 * Lee el archivo de variables de entorno (.env) o cae a http://localhost:3000 como fallback local.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // No fijamos aquí un Content-Type global: axios ya pone
  // 'application/json' automáticamente en peticiones con objetos planos,
  // y calcula 'multipart/form-data; boundary=...' automáticamente cuando
  // el body es un FormData (como al subir evidencias). Si se deja fijo en
  // 'application/json', las subidas de archivo se rompen porque el
  // boundary nunca se genera y el backend no reconoce el archivo.
  withCredentials: true, // Habilitar envío de cookies si el backend las requiere
});

// Interceptor de peticiones: adjuntar token de autorización automáticamente si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sitmi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: manejo global de errores HTTP
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customErrorMsg = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';

    if (error.response) {
      const { status, data } = error.response;

      // Intentar extraer el mensaje específico enviado por el backend.
      // Soporta los formatos típicos de NestJS ("error"/"message") y el
      // de las respuestas de n8n ("mensaje", en español).
      const backendMessage = data?.error || data?.message || data?.mensaje;
      const formattedMessage = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage;

      switch (status) {
        case 400:
          customErrorMsg = formattedMessage || 'Petición incorrecta (Bad Request).';
          break;
        case 401:
          customErrorMsg = formattedMessage || 'Sesión no autorizada. Por favor, inicia sesión de nuevo.';
          // Opcional: Cerrar sesión limpiando el almacenamiento local
          localStorage.removeItem('sena_user');
          localStorage.removeItem('sitmi_token');
          // Podríamos redirigir si se desea (window.location.href = '/login')
          break;
        case 403:
          customErrorMsg = formattedMessage || 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          customErrorMsg = formattedMessage || 'El recurso solicitado no fue encontrado en el servidor.';
          break;
        case 500:
          customErrorMsg = formattedMessage || 'Error interno del servidor. Por favor contacta al administrador.';
          break;
        default:
          customErrorMsg = formattedMessage || `Error del servidor (Código ${status}).`;
      }
    } else if (error.request) {
      customErrorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión de red o si el backend está encendido.';
    }

    // Retornamos un error con el mensaje personalizado para que el hook o componente pueda atraparlo y mostrarlo
    return Promise.reject(new Error(customErrorMsg));
  }
);

export default apiClient;