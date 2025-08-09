// Usamos 'require' para importar las dependencias, que es el formato que Netlify espera.
const { GoogleGenerativeAI } = require("@google/genai");
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

// Creamos una nueva aplicación de Express.
const app = express();

// Usamos el middleware CORS para permitir peticiones desde otros dominios.
app.use(cors());

// Definimos la variable para la clave de la API, obtenida de las variables de entorno de Netlify.
// Si no existe, se usa una cadena vacía.
const apiKey = process.env.GEMINI_API_KEY || "";

// Inicializamos el modelo de IA.
let api = null;
let model = null;

async function initializeModel() {
  if (apiKey === "") {
    console.error("GEMINI_API_KEY no está configurada.");
    return;
  }
  api = new GoogleGenerativeAI(apiKey);
  model = api.getGenerativeModel({ model: "gemini-pro" });
}

// Inicializa el modelo al inicio de la aplicación.
initializeModel();

// Definimos el endpoint de la API para recibir peticiones GET.
// La URL completa será https://[tu-sitio].netlify.app/.netlify/functions/api
app.get("/api", async (req, res) => {
  if (!model) {
    res.status(500).send("El modelo de IA no ha sido inicializado. Por favor, revisa la configuración de la API key.");
    return;
  }

  // Obtenemos el prompt de la URL de la petición.
  const prompt = req.query.prompt;

  if (!prompt) {
    res.status(400).send("Falta el parámetro 'prompt'. Ejemplo: /api?prompt=Hola mundo");
    return;
  }

  try {
    // Enviamos el prompt al modelo de IA.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Enviamos la respuesta del modelo como un JSON.
    res.json({
      success: true,
      data: text
    });
  } catch (error) {
    console.error("Error al generar contenido:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al generar contenido."
    });
  }
});

// Exportamos la función de Express para que Netlify la use.
exports.handler = serverless(app);
