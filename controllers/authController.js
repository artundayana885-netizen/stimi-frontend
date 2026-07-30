import bcrypt from 'bcryptjs';
import { sendResetCodeEmail } from '../config/nodemailer.js';

/**
 * Simulación de tabla / colección de usuarios en memoria.
 * Incluye los campos requeridos: resetCode, resetCodeExpires y resetCodeAttempts.
 * En producción con Mongoose/Prisma/Sequelize/Knex, estos campos forman parte de la colección/tabla de usuarios.
 */
export const usersDB = [
  {
    id: '1',
    email: 'instructor@gmail.com',
    name: 'Instructor SENA',
    password: '$2a$10$e8R6.V/XN8w2DqG8rB3uFe1q0jB6i9w1q7l1w8l0w6w4w2w0w8w2w', // Hash por defecto
    resetCode: null,
    resetCodeExpires: null,
    resetCodeAttempts: 0,
  },
  {
    id: '2',
    email: 'coordinador@gmail.com',
    name: 'Coordinador SENA',
    password: '$2a$10$e8R6.V/XN8w2DqG8rB3uFe1q0jB6i9w1q7l1w8l0w6w4w2w0w8w2w',
    resetCode: null,
    resetCodeExpires: null,
    resetCodeAttempts: 0,
  },
];

// Helper para validar formato de correo electrónico con expresión regular
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
};

/**
 * 1. POST /api/forgot-password
 * Solicita envío de código de recuperación por correo
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar formato del correo
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Buscar si el correo existe en la base de datos de usuarios o crearlo dinámicamente
    let user = usersDB.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      user = {
        id: String(Date.now()),
        email: normalizedEmail,
        name: 'Usuario Registrado',
        password: '',
        resetCode: null,
        resetCodeExpires: null,
        resetCodeAttempts: 0,
      };
      usersDB.push(user);
    }

    // a) Generar un código de 6 dígitos aleatorio
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // b) Guardar en el usuario con fecha de expiración de 10 minutos
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    user.resetCodeAttempts = 0;

    // c) Enviar ese código, usando Nodemailer, AL CORREO QUE EL USUARIO ESCRIBIÓ en el formulario
    await sendResetCodeEmail(user.email, resetCode);

    return res.status(200).json({
      message: 'Hemos enviado un código a tu correo',
    });
  } catch (error) {
    console.error('Error en endpoint forgot-password:', error);
    return res.status(500).json({
      error: 'Ocurrió un error interno al procesar la solicitud de envío de correo.',
    });
  }
};

/**
 * 2. POST /api/verify-reset-code
 * Verifica el correo y el código ingresado por el usuario (máximo 5 intentos)
 */
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'El correo y el código son requeridos.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = usersDB.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user || !user.resetCode) {
      return res.status(400).json({
        error: 'No existe una solicitud de recuperación activa para este correo.',
      });
    }

    // Limitar a máximo 5 intentos fallidos por código
    if (user.resetCodeAttempts >= 5) {
      user.resetCode = null;
      user.resetCodeExpires = null;
      user.resetCodeAttempts = 0;
      return res.status(400).json({
        error: 'Has superado el límite de 5 intentos fallidos. Solicita un nuevo código.',
      });
    }

    // Verificar expiración (10 minutos)
    const now = new Date();
    if (now > new Date(user.resetCodeExpires)) {
      return res.status(400).json({
        error: 'El código ha expirado. Por favor solicita uno nuevo.',
      });
    }

    // Verificar coincidencia del código
    if (user.resetCode !== String(code).trim()) {
      user.resetCodeAttempts = (user.resetCodeAttempts || 0) + 1;
      const remainingAttempts = 5 - user.resetCodeAttempts;

      if (remainingAttempts <= 0) {
        user.resetCode = null;
        user.resetCodeExpires = null;
        user.resetCodeAttempts = 0;
        return res.status(400).json({
          error: 'Has superado el límite de 5 intentos fallidos. Solicita un nuevo código.',
        });
      }

      return res.status(400).json({
        error: `Código incorrecto. Intentos restantes: ${remainingAttempts}`,
      });
    }

    // Si es correcto, permite continuar al siguiente paso
    return res.status(200).json({
      success: true,
      message: 'Código verificado correctamente.',
    });
  } catch (error) {
    console.error('Error en endpoint verify-reset-code:', error);
    return res.status(500).json({
      error: 'Ocurrió un error al verificar el código.',
    });
  }
};

/**
 * 3. POST /api/reset-password
 * Actualiza la contraseña del usuario (hasheada con bcrypt) y limpia el resetCode
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = usersDB.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user || !user.resetCode) {
      return res.status(400).json({
        error: 'Solicitud de recuperación no encontrada o expiré. Inicia el proceso de nuevo.',
      });
    }

    // Verificar expiración
    if (new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ error: 'El código ha expirado. Solicita un nuevo código.' });
    }

    // Verificar coincidencia del código
    if (user.resetCode !== String(code).trim()) {
      return res.status(400).json({ error: 'Código de verificación incorrecto.' });
    }

    // Actualizar la contraseña del usuario (hasheada con bcrypt)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;

    // Eliminar/invalidad el resetCode para que no pueda reutilizarse
    user.resetCode = null;
    user.resetCodeExpires = null;
    user.resetCodeAttempts = 0;

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente.',
    });
  } catch (error) {
    console.error('Error en endpoint reset-password:', error);
    return res.status(500).json({
      error: 'Ocurrió un error al actualizar la contraseña.',
    });
  }
};
