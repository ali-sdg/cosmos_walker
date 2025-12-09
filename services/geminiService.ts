import { GoogleGenAI } from "@google/genai";
import { CelestialBody } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartDescription = async (body: CelestialBody): Promise<string> => {
  try {
    const prompt = `
      Write a fascinating, scientific summary about ${body.name} (${body.displayName}) in Turkish.
      Keep it strictly scientific but engaging. Max 3 sentences.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || body.description;
  } catch (error) {
    console.warn("AI Description Failed:", error);
    return body.description; // Fallback
  }
};

export const askSmartQuestion = async (body: CelestialBody, question: string): Promise<string> => {
  try {
    const prompt = `
      You are an astronomy expert. Answer this question in Turkish about ${body.displayName}: "${question}".
      Keep the answer scientific, accurate, and concise (max 50 words).
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Şu anda yanıt veremiyorum.";
  } catch (error) {
    console.error("AI Question Failed:", error);
    throw error;
  }
};