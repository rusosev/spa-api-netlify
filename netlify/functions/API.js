// Usamos 'require' para importar las dependencias.
const { GoogleGenerativeAI } = require("@google/genai");

// Definimos la clave de la API desde las variables de entorno de Netlify.
const apiKey = process.env.GEMINI_API_KEY || "";
let model;

// Creamos un handler asíncrono, que es el formato nativo de Netlify para funciones.
// El 'event' contiene toda la información de la petición, incluyendo los parámetros de la URL.
exports.handler = async (event) => {
  // Verificamos que la clave de la API esté configurada.
  if (!apiKey) {
    return {
      statusCode: 500,
      body: "Error: La clave de la API no está configurada."
    };
  }

  // Obtenemos el prompt de los parámetros de la URL.
  const prompt = event.queryStringParameters.prompt;

  // Si no hay prompt, devolvemos un error 400.
  if (!prompt) {
    return {
      statusCode: 400,
      body: "Error: Falta el parámetro 'prompt'. Ejemplo: ?prompt=Hola mundo"
    };
  }

  // Inicializamos el modelo de IA.
  try {
    const api = new GoogleGenerativeAI(apiKey);
    model = api.getGenerativeModel({ model: "gemini-pro" });
  } catch (error) {
    console.error("Error al inicializar el modelo:", error);
    return {
      statusCode: 500,
      body: "Error interno del servidor al inicializar el modelo."
    };
  }

  // Hacemos la petición a Gemini.
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Devolvemos la respuesta exitosa en formato JSON.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        data: text
      })
    };
  } catch (error) {
    console.error("Error al generar contenido:", error);
    return {
      statusCode: 500,
      body: "Error interno del servidor al generar contenido."
    };
  }
};
