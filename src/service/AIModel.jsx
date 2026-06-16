import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
});

export async function generateTripPlan(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    });

    return typeof response.text === "string" ? response.text.trim() : "";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
