// Usamos 'require' para importar las dependencias.
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Creamos un handler asíncrono, que es el formato nativo de Netlify para funciones.
// El 'event' contiene toda la información de la petición, incluyendo los parámetros de la URL.
exports.handler = async (event) => {
  // Definimos la clave de la API desde las variables de entorno de Netlify.
  const apiKey = process.env.GEMINI_API_KEY;

  // Verificamos que la clave de la API esté configurada.
  if (!apiKey) {
    return {
      statusCode: 500,
      body: "Error: La clave de la API no está configurada. Por favor, añádela a las variables de entorno de Netlify."
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
  const api = new GoogleGenerativeAI(apiKey);
  const model = api.getGenerativeModel({ model: "gemini-pro" });

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
      body: JSON.stringify({
        success: false,
        error: "Error interno del servidor al generar contenido. Revisa los logs de Netlify para más detalles."
      })
    };
  }
};