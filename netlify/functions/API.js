// Usamos 'import' para importar las dependencias, la sintaxis moderna.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Creamos un handler asíncrono y lo exportamos directamente.
export const handler = async (event) => {
  // Definimos la clave de la API desde las variables de entorno de Netlify.
  const apiKey = process.env.GEMINI_API_KEY;

  // Verificamos que la clave de la API esté configurada.
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Error: La clave de la API no está configurada. Por favor, añádela a las variables de entorno de Netlify."
      })
    };
  }

  // Verificamos que la solicitud sea un POST y que tenga un cuerpo.
  if (event.httpMethod !== "POST" || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "Error: El método de la solicitud debe ser POST y debe contener un cuerpo con los datos."
      })
    };
  }

  // Parseamos el cuerpo JSON de la solicitud.
  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (parseError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "Error: El cuerpo de la solicitud no es un JSON válido."
      })
    };
  }
  
  // Obtenemos el prompt del cuerpo JSON. Ahora esperamos la clave "prompt".
  const prompt = requestBody.prompt;

  // Si no hay prompt, devolvemos un error 400.
  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "Error: Falta el campo 'prompt' en el cuerpo JSON de la solicitud."
      })
    };
  }

  // Inicializamos el modelo de IA.
  const api = new GoogleGenerativeAI(apiKey);
  const model = api.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Hacemos la petición a Gemini.
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Devolvemos la respuesta exitosa en formato JSON.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
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
        error: `Error interno del servidor. Mensaje de la API de Gemini: ${error.message}`
      })
    };
  }
};