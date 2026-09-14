import test from 'node:test';
import assert from 'node:assert';
import {
  parseRpm,
  parseCoolantTemp,
  parseSpeed,
  parseBatteryVoltage,
  parseDtcCodes,
  parseVin,
  parseEngineLoad,
  cleanResponse,
  parseFreezeFrameDtc,
  parseReadinessMonitors,
} from '../../client/src/services/elm327/elm327.decoder.ts';

test('ELM327 Decoder - Limpeza de caracteres de prompt e retorno', () => {
  const raw = '41 0C 1A F8\r\r\n>';
  assert.strictEqual(cleanResponse(raw), '41 0C 1A F8');
});

test('ELM327 Decoder - Decodificação de Rotação do Motor (RPM - PID 010C)', () => {
  // 41 0C 1A F8 -> (26 * 256 + 248) / 4 = 1726 RPM
  const rpm1 = parseRpm('41 0C 1A F8\r>');
  assert.strictEqual(rpm1, 1726);

  // Marcha lenta ~ 850 RPM -> (850 * 4) = 3400 -> Hex: 0D 48
  const rpmIdle = parseRpm('41 0C 0D 48');
  assert.strictEqual(rpmIdle, 850);

  // Resposta inválida ou sem PID
  assert.strictEqual(parseRpm('NO DATA'), null);
});

test('ELM327 Decoder - Decodificação de Temperatura do Arrefecimento (ECT - PID 0105)', () => {
  // 41 05 5C -> 92 - 40 = 52°C
  const temp1 = parseCoolantTemp('41 05 5C\r>');
  assert.strictEqual(temp1, 52);

  // 95°C normal -> 95 + 40 = 135 -> Hex: 87
  const tempNormal = parseCoolantTemp('41 05 87');
  assert.strictEqual(tempNormal, 95);
});

test('ELM327 Decoder - Decodificação de Velocidade (VSS - PID 010D)', () => {
  // 41 0D 3C -> 60 km/h
  const speed = parseSpeed('41 0D 3C');
  assert.strictEqual(speed, 60);
});

test('ELM327 Decoder - Decodificação de Voltagem da Bateria (ATRV)', () => {
  const volt1 = parseBatteryVoltage('14.2V\r>');
  assert.strictEqual(volt1, 14.2);

  const volt2 = parseBatteryVoltage('12.4 V');
  assert.strictEqual(volt2, 12.4);

  assert.strictEqual(parseBatteryVoltage('ERROR'), null);
});

test('ELM327 Decoder - Decodificação de Carga do Motor (PID 0104)', () => {
  // 41 04 80 -> 128 * 100 / 255 = 50%
  const load = parseEngineLoad('41 04 80');
  assert.strictEqual(load, 50);
});

test('ELM327 Decoder - Decodificação de Códigos DTC de Falha (Modo 03 e 07)', () => {
  // Exemplo real com 2 falhas: P0103 e P0420 com padding 0000
  // 0103: 0 -> P0, 1 -> 1, 03 -> 03 => P0103
  // 0420: 0 -> P0, 4 -> 4, 20 -> 20 => P0420
  const response = '43 01 03 04 20 00 00\r>';
  const codes = parseDtcCodes(response);
  assert.deepStrictEqual(codes, ['P0103', 'P0420']);

  // Falha de ignição P0300 e mistura P0171
  const response2 = '43 03 00 01 71';
  const codes2 = parseDtcCodes(response2);
  assert.deepStrictEqual(codes2, ['P0300', 'P0171']);

  // Resposta sem falhas
  assert.deepStrictEqual(parseDtcCodes('43 00 00 00 00'), []);
  assert.deepStrictEqual(parseDtcCodes('NO DATA'), []);
});

test('ELM327 Decoder - Decodificação do Chassi / VIN (Modo 09 PID 02)', () => {
  // Resposta Mode 09 PID 02 com bytes ASCII
  // 39 42 57 43 41 34 35 55 37 46 50 30 30 31 38 32 34
  // 9  B  W  C  A  4  5  U  7  F  P  0  0  1  8  2  4
  const hexBytes = '49 02 01 39 42 57 43 41 34 35 55 37 46 50 30 30 31 38 32 34';
  const vin = parseVin(hexBytes);
  assert.strictEqual(vin, '9BWCA45U7FP001824');
});

test('ELM327 Decoder - Decodificação de Freeze Frame (Modo 02)', () => {
  // DTC que disparou o congelamento
  const dtc1 = parseFreezeFrameDtc('42 02 00 03 00\r>');
  assert.strictEqual(dtc1, 'P0300');

  const dtc2 = parseFreezeFrameDtc('42 02 01 71');
  assert.strictEqual(dtc2, 'P0171');

  // Sensores congelados no momento do acendimento da luz
  const rpm = parseRpm('42 0C 00 1A F8');
  assert.strictEqual(rpm, 1726);

  const ect = parseCoolantTemp('42 05 00 5C');
  assert.strictEqual(ect, 52);

  const spd = parseSpeed('42 0D 00 3C');
  assert.strictEqual(spd, 60);
});

test('ELM327 Decoder - Decodificação de Prontidão de Emissões (I/M Readiness - Modo 01 PID 01)', () => {
  // Cenário 1: Luz MIL acesa com 2 falhas ativas
  // Byte A = 82 (Bit 7 = 1 MIL acesa, 2 falhas)
  // Byte B = 07 (Monitores contínuos suportados)
  // Byte C = FF (Todos suportados)
  // Byte D = 00 (Todos concluídos)
  const rep1 = parseReadinessMonitors('41 01 82 07 FF 00\r>');
  assert.notStrictEqual(rep1, null);
  assert.strictEqual(rep1?.milStatus, true);
  assert.strictEqual(rep1?.dtcCount, 2);
  assert.strictEqual(rep1?.verdict, 'REPROVADO_LUZ_MIL');

  // Cenário 2: Veículo limpo e aprovado
  // Byte A = 00 (MIL desligada, 0 falhas)
  const rep2 = parseReadinessMonitors('41 01 00 07 FF 00');
  assert.notStrictEqual(rep2, null);
  assert.strictEqual(rep2?.milStatus, false);
  assert.strictEqual(rep2?.dtcCount, 0);
  assert.strictEqual(rep2?.verdict, 'APROVADO');
});

