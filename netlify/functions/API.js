// Importa las librerías necesarias.
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
// Importa la librería de Google Gemini.
const { GoogleGenerativeAI } = require('@google/generativeai');

// Inicializa la aplicación Express.
const app = express();

// Middleware para procesar JSON y permitir CORS.
app.use(express.json());
app.use(cors());

// --- ENDPOINT PRINCIPAL DEL SPA ---
app.post('/api', async (req, res) => {
    try {
        // La API recibe el prompt de Make.com.
        const { promptMaster } = req.body;

        // Conexión segura con Gemini usando variables de entorno de Netlify.
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Selecciona el modelo de Gemini (versión 2.0 Flash).
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-latest" });

        // Envía el prompt a Gemini y espera la respuesta.
        const result = await model.generateContent(promptMaster);
        const response = await result.response;
        const iaOutput = response.text();

        // Prepara el resultado para enviarlo de vuelta a Make.com.
        const iaResult = {
            status: 'success',
            output: iaOutput,
        };

        // Devuelve el resultado a Make.com.
        res.status(200).json(iaResult);

    } catch (error) {
        console.error('Error en el endpoint /api:', error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.', details: error.message });
    }
});

// Exporta la función para que Netlify la pueda usar.
module.exports.handler = serverless(app);
