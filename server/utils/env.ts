import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT deve ser um número entre 1 e 65535',
    }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional().default(''),
});

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;
  geminiApiKey: string;
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Falha na validação das variáveis de ambiente:', parsed.error.format());
  throw new Error('Configuração de ambiente inválida');
}

export const config: AppConfig = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  corsOrigin: parsed.data.CORS_ORIGIN,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
};
