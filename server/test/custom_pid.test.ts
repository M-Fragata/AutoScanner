import { test } from 'node:test';
import assert from 'node:assert';

// Função de avaliação isolada para execução no test runner nativo do Node
function evaluateSafeFormula(
  formula: string,
  vars: { A: number; B: number; C: number; D: number }
): number {
  const clean = formula.trim();
  if (!clean) return 0;

  const tokens: string[] = [];
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let numStr = '';
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        numStr += clean[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let ident = '';
      while (i < clean.length && /[a-zA-Z0-9]/.test(clean[i])) {
        ident += clean[i];
        i++;
      }
      const upper = ident.toUpperCase();
      if (upper === 'A') tokens.push(String(vars.A));
      else if (upper === 'B') tokens.push(String(vars.B));
      else if (upper === 'C') tokens.push(String(vars.C));
      else if (upper === 'D') tokens.push(String(vars.D));
      else tokens.push(ident.toLowerCase());
      continue;
    }

    if (['+', '-', '*', '/', '^', '(', ')'].includes(char)) {
      if (
        char === '-' &&
        (tokens.length === 0 || ['(', '+', '-', '*', '/', '^'].includes(tokens[tokens.length - 1]))
      ) {
        let numStr = '-';
        i++;
        while (i < clean.length && /[0-9.]/.test(clean[i])) {
          numStr += clean[i];
          i++;
        }
        tokens.push(numStr);
        continue;
      }

      tokens.push(char);
      i++;
      continue;
    }

    i++;
  }

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const outputQueue: string[] = [];
  const operatorStack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (token in precedence) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop();
      }
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop()!);
  }

  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      evalStack.push(Number(token));
    } else {
      const b = evalStack.pop() ?? 0;
      const a = evalStack.pop() ?? 0;
      let res = 0;

      switch (token) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          res = b === 0 ? 0 : a / b;
          break;
        case '^':
          res = Math.pow(a, b);
          break;
        default:
          res = 0;
      }
      evalStack.push(res);
    }
  }

  const finalResult = evalStack.length > 0 ? evalStack[0] : 0;
  return isNaN(finalResult) || !isFinite(finalResult) ? 0 : finalResult;
}

test('Motor de Fórmulas Custom PIDs - Decodificação de Temperatura (A - 40)', () => {
  const result = evaluateSafeFormula('A - 40', { A: 132, B: 0, C: 0, D: 0 });
  assert.strictEqual(result, 92);
});

test('Motor de Fórmulas Custom PIDs - Decodificação de 2 Bytes ((A * 256 + B) / 1000)', () => {
  // Ex: A=14, B=150 -> (14 * 256 + 150) / 1000 = 3734 / 1000 = 3.734
  const result = evaluateSafeFormula('(A * 256 + B) / 1000', { A: 14, B: 150, C: 0, D: 0 });
  assert.strictEqual(Number(result.toFixed(3)), 3.734);
});

test('Motor de Fórmulas Custom PIDs - Percentual ((A * 100) / 255)', () => {
  const result = evaluateSafeFormula('(A * 100) / 255', { A: 255, B: 0, C: 0, D: 0 });
  assert.strictEqual(result, 100);

  const half = evaluateSafeFormula('(A * 100) / 255', { A: 127.5, B: 0, C: 0, D: 0 });
  assert.strictEqual(half, 50);
});

test('Motor de Fórmulas Custom PIDs - Decimais e Subtração com Unário ((A * 0.01) - 1.0)', () => {
  // Turbo Boost: A=185 -> (185 * 0.01) - 1.0 = 1.85 - 1.0 = 0.85
  const result = evaluateSafeFormula('(A * 0.01) - 1.0', { A: 185, B: 0, C: 0, D: 0 });
  assert.strictEqual(Number(result.toFixed(2)), 0.85);
});

test('Motor de Fórmulas Custom PIDs - Divisão por zero não gera crash', () => {
  const result = evaluateSafeFormula('A / 0', { A: 100, B: 0, C: 0, D: 0 });
  assert.strictEqual(result, 0);
});
