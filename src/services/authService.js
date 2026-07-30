import apiClient from './apiClient';

/**
 * Inicia sesión de un usuario en el backend.
 * Guarda el perfil en localStorage si el inicio de sesión es exitoso.
 */
export async function loginUser(email, password) {
  const { data } = await apiClient.post('/usuario/login', { email, password });
  
  const userProfile = data.user; // { name, email, role }
  
  // Guardamos la sesión localmente
  localStorage.setItem('sena_user', JSON.stringify(userProfile));
  
  // Si en el futuro el backend implementa JWT Token, lo guardamos así:
  if (data.token) {
    localStorage.setItem('sitmi_token', data.token);
  } else {
    // Por ahora simulamos un token estático para cumplir con el interceptor de apiClient
    localStorage.setItem('sitmi_token', 'simulated_session_token');
  }

  return userProfile;
}

/**
 * Registra un nuevo usuario en la base de datos MySQL del backend.
 */
export async function registerUser(payload) {
  const { data } = await apiClient.post('/usuario/register', payload);
  return data;
}

/**
 * Cierra la sesión activa limpiando el almacenamiento local.
 */
export function logoutUser() {
  localStorage.removeItem('sena_user');
  localStorage.removeItem('sitmi_token');
}

/**
 * Envía una solicitud de recuperación de contraseña para el correo dado.
 * Endpoint: POST /usuario/forgot-password
 */
export async function forgotPassword(email) {
  const { data } = await apiClient.post('/usuario/forgot-password', { email });
  return data;
}

/**
 * Verifica el código de 6 dígitos ingresado por el usuario.
 * Endpoint: POST /usuario/verify-reset-code
 */
/**
 * Verifica el código de 6 dígitos ingresado por el usuario.
 * Nota: el backend no tiene un endpoint separado para verificar el código;
 * la validación real ocurre en resetPassword(). Aquí solo confirmamos
 * que el usuario completó los 6 dígitos, sin llamar al backend todavía.
 */
export async function verifyResetCode(email, code) {
  if (!code || code.length < 6) {
    throw new Error('Ingresa el código completo de 6 dígitos');
  }
  return { message: 'Código ingresado' };
}

/**
 * Restablece la contraseña del usuario usando el código de verificación recibido por correo.
 * Endpoint: POST /usuario/reset-password
 */
export async function resetPassword(email, code, newPassword) {
  const { data } = await apiClient.post('/usuario/reset-password', { email, code, newPassword });
  return data;
}

/**
 * Cambia la contraseña de un usuario autenticado.
 */
export async function changePassword(email, currentPassword, newPassword) {
  const { data } = await apiClient.post('/usuario/change-password', { email, currentPassword, newPassword });
  return data;
}

/**
 * Obtiene todos los usuarios registrados en el sistema.
 */
export async function getAllUsers() {
  const { data } = await apiClient.get('/usuario');
  return data;
}

/**
 * Alterna el estado activo/inactivo del usuario.
 */
export async function toggleUserStatus(id) {
  const { data } = await apiClient.put(`/usuario/status/${id}`);
  return data;
}

/**
 * Actualiza el rol del usuario en la base de datos.
 */
export async function changeUserRole(id, role) {
  const { data } = await apiClient.put(`/usuario/role/${id}`, { role });
  return data;
}

/**
 * Elimina un usuario de la base de datos.
 */
export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/usuario/${id}`);
  return data;
}