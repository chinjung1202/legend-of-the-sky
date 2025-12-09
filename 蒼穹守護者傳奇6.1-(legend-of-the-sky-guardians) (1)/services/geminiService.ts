import { GoogleGenAI } from "@google/genai";
import { TowerDef, Hero } from "../types";

// Always initialize directly per SDK guidelines.
// Expects process.env.API_KEY to be available via Vite define or environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const isGeminiConfigured = () => !!process.env.API_KEY;

export const generateArtPrompt = async (entity: TowerDef | Hero): Promise<string> => {
  if (!process.env.API_KEY) return "請設定 API Key 以生成美術提示詞。";

  const name = entity.name;
  let description = '';
  let subDetails = '';
  let isTower = false;

  // Use 'type' property to distinguish between TowerDef and Hero
  if ('type' in entity) {
    isTower = true;
    description = (entity as TowerDef).t1.description;
    subDetails = `Type: ${(entity as TowerDef).type}. T1: ${(entity as TowerDef).t1.name}, T3 Options: ${(entity as TowerDef).t3Options.map(t => t.name).join(', ')}`;
  } else {
    description = (entity as Hero).description;
    subDetails = `Role: ${(entity as Hero).role}. Skills: ${(entity as Hero).skills.join(', ')}`;
  }

  const baseStyle = isTower 
    ? "Isometric game asset, Tower Defense building, Kingdom Rush style but high fidelity anime art, 3D cel-shaded, fantasy architecture, white background"
    : "Anime character design sheet, full body, dynamic pose, fantasy adventurer, detailed costume, cel-shaded, white background";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Act as an Expert AI Art Director.
        The user wants an asset for a high-quality Anime Style Tower Defense Game (Reference: Kingdom Rush meets Genshin Impact).
        
        Input Name (Chinese): ${name}
        Input Description (Chinese): ${description}
        Details: ${subDetails}
        
        Task:
        1. Translate the Chinese concepts into English.
        2. Create a highly detailed image generation prompt.
        
        Base Style: ${baseStyle}
        
        Return ONLY the prompt string in English, no other text.
      `,
    });
    return response.text || "Prompt generation failed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating prompt.";
  }
};