import { app } from './app.ts';
import { config } from './utils/env.ts';

const server = app.listen(config.port, () => {
  console.log(`🚗 AutoScanner API rodando com sucesso!`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`⚙️  Ambiente: ${config.nodeEnv}`);
  console.log(`🤖 Gemini AI: ${config.geminiApiKey ? 'Ativo (Chave configurada)' : 'Motor Heurístico Fallback ativo'}`);
});

// Tratamento de encerramento gracioso (Graceful Shutdown)
function handleShutdown(signal: string): void {
  console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor graciosamente...`);
  server.close(() => {
    console.log('✅ Servidor HTTP encerrado com sucesso.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forçando encerramento por timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
