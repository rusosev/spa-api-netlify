// Importamos la clase GenerativeModel de la nueva dependencia @google/genai.
import { GoogleGenerativeAI } from "@google/genai";

// Inicializa la variable de la API key. Si no se encuentra, se asigna una cadena vacía.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
let api = null;
let model = null;

// Esta función inicializa el modelo de IA.
// Es importante llamar a esta función antes de cualquier otra interacción con la API.
export async function initializeModel() {
  if (apiKey === "") {
    console.error("VITE_GEMINI_API_KEY no está configurada.");
    return;
  }
  // Se inicializa el objeto GoogleGenerativeAI con la clave de la API.
  api = new GoogleGenerativeAI(apiKey);
  // Se obtiene el modelo específico a usar (gemini-pro).
  model = api.getGenerativeModel({ model: "gemini-pro" });
}

// Esta función envía el prompt al modelo de IA y maneja la respuesta.
export async function generateContent(prompt) {
  if (!model) {
    console.error("El modelo de IA no ha sido inicializado. Por favor, llama a initializeModel() primero.");
    return null;
  }

  try {
    // Se envía el prompt al modelo.
    const result = await model.generateContent(prompt);
    // Se extrae la respuesta del resultado.
    const response = await result.response;
    // Se obtiene el texto de la respuesta.
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error al generar contenido:", error);
    return null;
  }
}
