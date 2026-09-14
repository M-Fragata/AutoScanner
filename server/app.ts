import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import { config } from './utils/env.ts';
import { apiRouter } from './routes/index.ts';
import { AppError } from './utils/errors.ts';

export const app = express();

// Middlewares globais
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Injeção centralizada de rotas da aplicação
app.use('/api', apiRouter);

// Rota 404 para endpoints inexistentes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Rota ${req.method} ${req.originalUrl} não encontrada no servidor.`,
      statusCode: 404,
    },
  });
});

// Middleware centralizado de tratamento de erros assíncronos e de validação
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Falha de validação nos dados fornecidos.',
        statusCode: 400,
        issues: formattedErrors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        type: 'APPLICATION_ERROR',
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      },
    });
    return;
  }

  console.error('❌ Erro inesperado capturado pelo middleware global:', err);

  res.status(500).json({
    success: false,
    error: {
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno no processamento do servidor.',
      statusCode: 500,
    },
  });
});
