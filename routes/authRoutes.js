import express from 'express';
import {
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Endpoint 1: Solicitar código de recuperación por correo
router.post('/forgot-password', forgotPassword);

// Endpoint 2: Verificar código de 6 dígitos (máximo 5 intentos)
router.post('/verify-reset-code', verifyResetCode);

// Endpoint 3: Restablecer contraseña con bcrypt e invalidar código
router.post('/reset-password', resetPassword);

export default router;
