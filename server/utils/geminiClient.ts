import { GoogleGenAI } from '@google/genai';
import { config } from './env.ts';

let geminiClientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!config.geminiApiKey || config.geminiApiKey.trim() === '') {
    return null;
  }

  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({
      apiKey: config.geminiApiKey,
    });
  }

  return geminiClientInstance;
}
