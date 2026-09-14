import { Router } from 'express';
import { scannerController } from '../controllers/scanner.controller.ts';

export const scannerRouter = Router();

// Rota para simulação de varredura OBD-II da centralina
scannerRouter.get('/simulate', (req, res, next) => scannerController.simulateScan(req, res, next));

// Rota para listar ou pesquisar códigos DTC padrão
scannerRouter.get('/dtc-codes', (req, res, next) => scannerController.getAllCodes(req, res, next));

// Rota para buscar detalhes de um código DTC específico
scannerRouter.get('/dtc-codes/:code', (req, res, next) => scannerController.getCodeByParam(req, res, next));

// Rota principal para diagnóstico com IA e geração de laudo
scannerRouter.post('/diagnose', (req, res, next) => scannerController.diagnose(req, res, next));

// Rota para análise preditiva de desgaste por série temporal com IA
scannerRouter.post('/predict', (req, res, next) => scannerController.predict(req, res, next));
