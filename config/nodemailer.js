import nodemailer from 'nodemailer';
import 'dotenv/config';

// Transporter de Nodemailer configurado con el servicio 'gmail' y credenciales desde .env
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía el correo electrónico con el código de recuperación de 6 dígitos.
 * @param {string} toEmail Correo del usuario destinatario
 * @param {string} code Código de 6 dígitos
 */
export const sendResetCodeEmail = async (toEmail, code) => {
  const mailOptions = {
    from: `"SITMI Soporte" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Código de recuperación de contraseña - SITMI',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #16a34a; margin: 0; font-size: 24px;">Recuperación de Contraseña</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Portal de Instructores y Coordinación SITMI</p>
        </div>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hola,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Has solicitado restablecer tu contraseña. Ingresa el siguiente código de verificación de 6 dígitos en la aplicación:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; background-color: #f1f5f9; padding: 14px 28px; border-radius: 10px; border: 2px dashed #cbd5e1; display: inline-block;">
            ${code}
          </span>
        </div>
        
        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="color: #854d0e; font-size: 13px; margin: 0;">
            ⚠️ Este código expirará en <strong>10 minutos</strong>. Tienes un máximo de 5 intentos para ingresarlo.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Si no has solicitado restablecer tu contraseña, puedes ignorar este correo de forma segura.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
