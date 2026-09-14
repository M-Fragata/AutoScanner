# AutoScanner AI 🚗⚡

Aplicação Full-Stack de **Scanner Automotivo Inteligente OBD-II** com leitura de telemetria em tempo real e emissão de laudos técnicos detalhados com **Google Gemini AI**.

---

## 🏛️ Arquitetura do Projeto

O projeto é dividido em dois diretórios principais estritamente desacoplados:

```
AutoScanner/
├── client/                     # Frontend SPA
│   ├── src/
│   │   ├── components/         # Componentes funcionais modulares (Dashboard, Telemetry, Report, etc.)
│   │   ├── hooks/              # Custom Hooks (useScanner, useTelemetry)
│   │   ├── services/           # Cliente HTTP da API (api.ts) e Driver ELM327 (elm327.service.ts)
│   │   │   ├── api.ts
│   │   │   └── elm327/         # Driver serial, decodificador de PIDs e tipos
│   │   ├── types/              # Interfaces estritas (scanner.ts)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Estilização Tailwind CSS v4
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts          # Configuração Vite com proxy para o backend
│
├── server/                     # Backend API (Node.js Nativo)
│   ├── routes/                 # Definição e mapeamento de rotas Express
│   │   ├── scanner.routes.ts
│   │   └── index.ts
│   ├── controllers/            # Validação com Zod e repasse para services
│   │   └── scanner.controller.ts
│   ├── services/               # Regra de negócio e integração isolada com Google Gemini
│   │   ├── scanner.service.ts
│   │   └── gemini.service.ts
│   ├── utils/                  # Helpers, configs de ambiente e cliente Gemini
│   │   ├── env.ts              # Validação de variáveis de ambiente com Zod
│   │   ├── geminiClient.ts     # Instância singleton do GoogleGenAI
│   │   ├── errors.ts           # Classes AppError e tratamento de status HTTP
│   │   └── sampleCodes.ts      # Base de dados OBD-II DTC (P0300, P0420, etc.)
│   ├── test/                   # Testes unitários e integração com node:test e node:assert
│   │   ├── validation.test.ts
│   │   ├── scanner.service.test.ts
│   │   └── api.test.ts
│   ├── app.ts                  # Instância Express, CORS, middlewares e tratamento de erros
│   ├── server.ts               # Ponto de entrada exclusivo (app.listen)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── package.json                # Scripts centralizados da raiz
```

---

## 🛠️ Tecnologias Utilizadas

### 1. Frontend (`/client`)
- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`) com tema cockpit automotivo dark
- **Lucide Icons** para instrumentos e manômetros
- Tipagem estrita em todas as props e hooks (`useScanner`, `useTelemetry`)

### 2. Backend (`/server`)
- **Node.js Nativo** com execução direta de TypeScript (`--experimental-strip-types` e `--watch`)
- **Express** com middleware global de tratamento de erros assíncronos
- **Zod** para validação estrita de todos os dados de entrada (`body`, `query`, `params`)
- **Google Generative AI SDK** (`@google/genai`) para laudos de mecânica avançada
- **Test Runner Nativo** (`node:test` e `node:assert`), sem dependência de Jest ou Vitest

---

## 🚀 Como Executar o Projeto

> **Nota:** Certifique-se de utilizar o terminal CMD ou configurar o caminho do Node.js: `D:\Node`.

### 1. Configuração do Backend

1. Acesse a pasta do servidor:
   ```cmd
   cd server
   ```
2. Crie o arquivo `.env` a partir do exemplo:
   ```cmd
   copy .env.example .env
   ```
3. *(Opcional)* Adicione sua chave da API do Google Gemini em `GEMINI_API_KEY`:
   ```env
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   GEMINI_API_KEY=sua_chave_aqui
   ```
   *Caso nenhuma chave seja informada, o AutoScanner ativa automaticamente seu motor heurístico especializado automotivo de fallback.*

4. Inicie o servidor em modo de desenvolvimento:
   ```cmd
   npm run dev
   ```
   O servidor estará ativo em `http://localhost:3001`.

### 2. Configuração do Frontend

1. Em outro terminal, acesse a pasta do cliente:
   ```cmd
   cd client
   ```
2. Inicie o servidor Vite:
   ```cmd
   npm run dev
   ```
3. Abra `http://localhost:5173` no seu navegador.

---

## 🧪 Testes Automatizados (Node.js Nativo)

Para rodar a suíte de testes unitários e de integração utilizando exclusivamente o **Test Runner nativo do Node.js**:

```cmd
cd server
npm test
```

### O que é coberto nos testes:
- Validação de schemas Zod com dados válidos e inválidos (`test/validation.test.ts`)
- Regras de negócio de simulação OBD-II e diagnósticos (`test/scanner.service.test.ts`)
- Testes de integração HTTP com `fetch` nativo sobre as rotas (`test/api.test.ts`)

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/health` | Healthcheck do serviço |
| `GET` | `/api/scanner/simulate` | Simula handshake OBD-II e leitura de sensores |
| `GET` | `/api/scanner/dtc-codes` | Lista códigos de falha catalogados (com busca) |
| `GET` | `/api/scanner/dtc-codes/:code` | Retorna detalhes de um código DTC específico |
| `POST` | `/api/scanner/diagnose` | Valida payload com Zod e gera laudo com IA Gemini |
