// server.js
// Backend Node.js + Express para el portal SITMI
// Incluye endpoints para recuperación de contraseña (/api/forgot-password, /api/verify-reset-code, /api/reset-password) y Asistente IA.

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Montar las rutas de autenticación y recuperación de contraseña (/api/forgot-password, etc.)
app.use('/api', authRoutes);

// Endpoint del Asistente IA con Google Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-flash-latest';

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "message"' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'Eres un asistente virtual del portal SITMI del SENA. Ayudas a instructores con dudas sobre informes GC y GF, fechas límite, documentos requeridos y uso del sistema. Responde siempre en español, de forma clara y concisa.'
          }]
        },
        contents: [
          { role: 'user', parts: [{ text: message }] }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error de la API de Gemini:', errText);
      return res.status(502).json({ error: 'Error al consultar el asistente' });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || 'No pude generar una respuesta.';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend (Node.js + Express) corriendo en http://localhost:${PORT}`);
});