import { Router } from 'express';
import { scannerRouter } from './scanner.routes.ts';

export const apiRouter = Router();

apiRouter.use('/scanner', scannerRouter);

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AutoScanner API',
  });
});
