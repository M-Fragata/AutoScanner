import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { scannerService } from '../services/scanner.service.ts';
import { NotFoundError } from '../utils/errors.ts';

// Schemas Zod para validação estrita de entradas
export const vehicleSchema = z.object({
  make: z.string().min(1, 'Marca do veículo é obrigatória'),
  model: z.string().min(1, 'Modelo do veículo é obrigatório'),
  year: z
    .number()
    .int()
    .min(1980, 'Ano deve ser igual ou superior a 1980')
    .max(new Date().getFullYear() + 1, 'Ano inválido'),
  mileageKm: z.number().nonnegative('Quilometragem deve ser um valor positivo'),
});

export const telemetrySchema = z.object({
  rpm: z.number().min(0).max(12000),
  coolantTempC: z.number().min(-40).max(200),
  vehicleSpeedKmh: z.number().min(0).max(400),
  batteryVoltage: z.number().min(0).max(30),
  fuelPressureBar: z.number().min(0).max(20),
  intakeTempC: z.number().min(-40).max(120),
});

export const diagnoseBodySchema = z.object({
  vehicle: vehicleSchema,
  dtcCodes: z
    .array(
      z
        .string()
        .regex(/^[PCBU][0-9A-Fa-f]{4}$/i, 'Formato de código DTC inválido. Exemplo: P0300')
        .transform((val) => val.toUpperCase())
    )
    .min(1, 'Informe pelo menos um código de falha DTC para diagnóstico'),
  symptoms: z.string().max(1000).optional(),
  telemetry: telemetrySchema.optional(),
});

export const telemetrySampleSchema = z.object({
  timestamp: z.number(),
  rpm: z.number(),
  coolantTempC: z.number(),
  vehicleSpeedKmh: z.number(),
  batteryVoltage: z.number(),
  fuelPressureBar: z.number(),
  intakeTempC: z.number(),
});

export const predictBodySchema = z.object({
  vehicle: vehicleSchema,
  telemetryHistory: z.array(telemetrySampleSchema).min(1, 'Histórico de telemetria deve conter ao menos 1 amostra'),
  symptoms: z.string().max(1000).optional(),
});

export const codeParamSchema = z.object({
  code: z
    .string()
    .regex(/^[PCBU][0-9A-Fa-f]{4}$/i, 'Código DTC inválido. Formato esperado: P0300')
    .transform((val) => val.toUpperCase()),
});

export const queryCodesSchema = z.object({
  search: z.string().optional(),
});

export class ScannerController {
  public async diagnose(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = diagnoseBodySchema.parse(req.body);
      const result = await scannerService.diagnoseVehicle(validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async predict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = predictBodySchema.parse(req.body);
      const result = await scannerService.predictVehicleWear(validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAllCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = queryCodesSchema.parse(req.query);
      let codes = scannerService.getAllDtcCodes();

      if (search) {
        const term = search.toLowerCase();
        codes = codes.filter(
          (c) =>
            c.code.toLowerCase().includes(term) ||
            c.title.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term)
        );
      }

      res.status(200).json({
        success: true,
        count: codes.length,
        data: codes,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getCodeByParam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = codeParamSchema.parse(req.params);
      const dtc = scannerService.getDtcByCode(code);

      if (!dtc) {
        throw new NotFoundError(`Código DTC ${code} não encontrado no banco padrão.`);
      }

      res.status(200).json({
        success: true,
        data: dtc,
      });
    } catch (err) {
      next(err);
    }
  }

  public async simulateScan(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scanData = scannerService.simulateEcuScan();
      res.status(200).json({
        success: true,
        data: scanData,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const scannerController = new ScannerController();
