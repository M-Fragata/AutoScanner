import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Calculator,
  RotateCcw,
  Play,
} from 'lucide-react';
import {
  customPidService,
  testCustomPidFormula,
  DEFAULT_CUSTOM_PID_PRESETS,
} from '../services/customPidService';
import type { CustomPidDefinition, ManufacturerPreset } from '../types/scanner';

interface CustomPidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPidsUpdated?: () => void;
}

export const CustomPidModal: React.FC<CustomPidModalProps> = ({
  isOpen,
  onClose,
  onPidsUpdated,
}) => {
  const [pids, setPids] = useState<CustomPidDefinition[]>(customPidService.getPids());
  const [isCreating, setIsCreating] = useState(false);

  // Formulário de novo PID
  const [formName, setFormName] = useState('');
  const [formMode, setFormMode] = useState('01');
  const [formPid, setFormPid] = useState('');
  const [formFormula, setFormFormula] = useState('A - 40');
  const [formUnit, setFormUnit] = useState('°C');
  const [formMin, setFormMin] = useState('0');
  const [formMax, setFormMax] = useState('150');
  const [formManufacturer, setFormManufacturer] = useState<ManufacturerPreset>('Universal');
  const [formDesc, setFormDesc] = useState('');

  // Simulador de fórmula ao vivo
  const [testHex, setTestHex] = useState('41 5C 68');
  const [testFormulaInput, setTestFormulaInput] = useState('A - 40');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    result?: number;
    formatted?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    customPidService.togglePid(id);
    setPids([...customPidService.getPids()]);
    if (onPidsUpdated) onPidsUpdated();
  };

  const handleDelete = (id: string) => {
    customPidService.deletePid(id);
    setPids([...customPidService.getPids()]);
    if (onPidsUpdated) onPidsUpdated();
  };

  const handleResetDefaults = () => {
    const res = customPidService.resetToDefaults();
    setPids([...res]);
    if (onPidsUpdated) onPidsUpdated();
  };

  const handleRunTest = () => {
    const res = testCustomPidFormula(testFormulaInput, testHex);
    setTestResult(res);
  };

  const handleSaveNewPid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPid.trim() || !formFormula.trim()) return;

    customPidService.addPid({
      name: formName.trim(),
      mode: formMode.trim(),
      pid: formPid.trim().toUpperCase(),
      formula: formFormula.trim(),
      unit: formUnit.trim(),
      minVal: Number(formMin) || 0,
      maxVal: Number(formMax) || 100,
      description: formDesc.trim() || undefined,
      manufacturer: formManufacturer,
      enabled: true,
      lastValue: Number(formMin) || 0,
    });

    setPids([...customPidService.getPids()]);
    setIsCreating(false);
    // Limpa formulário
    setFormName('');
    setFormPid('');
    setFormDesc('');
    if (onPidsUpdated) onPidsUpdated();
  };

  const handleImportPreset = (preset: CustomPidDefinition) => {
    customPidService.importPreset(preset);
    setPids([...customPidService.getPids()]);
    if (onPidsUpdated) onPidsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Editor de PIDs Customizados & Fórmulas
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50">
                  Modo 01 & 22
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cadastre parâmetros proprietários de montadoras com fórmulas matemáticas (A, B, C, D)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Barra de Ações Rápidas & Importação de Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Predefinições Rápidas por Montadora
              </p>
              <p className="text-[11px] text-slate-400">
                Importe sensores testados para Volkswagen TSI, Chevrolet Ecotec e Ford
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const vw = DEFAULT_CUSTOM_PID_PRESETS.find((p) => p.id === 'vw_oil_temp');
                  if (vw) handleImportPreset(vw);
                  const boost = DEFAULT_CUSTOM_PID_PRESETS.find((p) => p.id === 'vw_boost_pressure');
                  if (boost) handleImportPreset(boost);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors cursor-pointer"
              >
                + VW / Audi TSI
              </button>
              <button
                type="button"
                onClick={() => {
                  const gm = DEFAULT_CUSTOM_PID_PRESETS.find((p) => p.id === 'gm_trans_temp');
                  if (gm) handleImportPreset(gm);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800/60 transition-colors cursor-pointer"
              >
                + GM Câmbio ATF
              </button>
              <button
                type="button"
                onClick={() => {
                  const ford = DEFAULT_CUSTOM_PID_PRESETS.find((p) => p.id === 'ford_hpfp_pressure');
                  if (ford) handleImportPreset(ford);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-800/60 transition-colors cursor-pointer"
              >
                + Ford HPFP
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center px-2.5 py-1 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                title="Restaurar lista original de fábrica"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Padrão
              </button>
            </div>
          </div>

          {/* Testador Interativo de Fórmulas Matemáticas */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Testador de Fórmulas em Tempo Real
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                Variáveis: <strong>A</strong> (Byte 1), <strong>B</strong> (Byte 2), <strong>C</strong> (Byte 3), <strong>D</strong> (Byte 4)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Hex de Resposta Exemplo
                </label>
                <input
                  type="text"
                  value={testHex}
                  onChange={(e) => setTestHex(e.target.value)}
                  placeholder="ex: 41 5C 68 ou 68"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Fórmula Matemática
                </label>
                <input
                  type="text"
                  value={testFormulaInput}
                  onChange={(e) => setTestFormulaInput(e.target.value)}
                  placeholder="ex: A - 40 ou (A*256+B)/100"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunTest}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-sm shadow-purple-600/30"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Testar Cálculo</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs font-mono border flex items-center justify-between ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                }`}
              >
                <span>
                  {testResult.success ? `Resultado Calculado: ${testResult.formatted}` : `Erro: ${testResult.error}`}
                </span>
                {testResult.success && <span className="text-[10px] uppercase font-bold text-emerald-400">Válido</span>}
              </div>
            )}
          </div>

          {/* Botão para Exibir/Ocultar Formulário de Criação */}
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-2xl text-xs font-bold text-slate-400 hover:text-purple-300 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo PID Customizado</span>
            </button>
          ) : (
            <form onSubmit={handleSaveNewPid} className="p-5 rounded-2xl bg-slate-950 border border-purple-900/60 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Novo Sensor / PID Customizado
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Nome do Sensor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ex: Pressão do Turbo (Bar)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Montadora / Categoria
                  </label>
                  <select
                    value={formManufacturer}
                    onChange={(e) => setFormManufacturer(e.target.value as ManufacturerPreset)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Universal">Universal</option>
                    <option value="Volkswagen / Audi">Volkswagen / Audi</option>
                    <option value="Chevrolet / GM">Chevrolet / GM</option>
                    <option value="Ford">Ford</option>
                    <option value="Fiat / Stellantis">Fiat / Stellantis</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Modo OBD (Hex)
                  </label>
                  <input
                    type="text"
                    required
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value)}
                    placeholder="01 ou 22"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    PID (Hex) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPid}
                    onChange={(e) => setFormPid(e.target.value)}
                    placeholder="ex: 5C ou 1940"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Unidade de Medida
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="ex: °C, bar, %, V"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Fórmula Matemática (Usando A, B, C, D) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFormula}
                    onChange={(e) => setFormFormula(e.target.value)}
                    placeholder="ex: A - 40 ou (A*256+B)/100"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Mín
                    </label>
                    <input
                      type="number"
                      value={formMin}
                      onChange={(e) => setFormMin(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Máx
                    </label>
                    <input
                      type="number"
                      value={formMax}
                      onChange={(e) => setFormMax(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Descrição Técnica (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="ex: Sensor de pressão absoluta do turbo acoplado ao coletor"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer shadow-md shadow-purple-600/30"
                >
                  Salvar PID
                </button>
              </div>
            </form>
          )}

          {/* Listagem de PIDs Cadastrados */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PIDs Registrados ({pids.length})
            </h3>

            {pids.map((pid) => (
              <div
                key={pid.id}
                className={`p-4 rounded-2xl border transition-all ${
                  pid.enabled
                    ? 'bg-slate-950/70 border-purple-800/60 shadow-md shadow-purple-950/20'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(pid.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                        pid.enabled ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                      title={pid.enabled ? 'Desativar leitura' : 'Ativar leitura'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pid.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{pid.name}</h4>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                          {pid.manufacturer}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{pid.description}</p>
                      <div className="flex items-center space-x-3 text-xs mt-1.5 font-mono">
                        <span className="text-cyan-400">
                          Modo {pid.mode} PID {pid.pid}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-purple-300">
                          Fórmula: <code className="bg-slate-900 px-1.5 py-0.5 rounded">{pid.formula}</code>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">
                          Escala: {pid.minVal} a {pid.maxVal} {pid.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {pid.enabled && pid.lastValue !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Valor Atual</p>
                        <p className="text-base font-extrabold font-mono text-purple-300">
                          {pid.lastValue} <span className="text-xs text-slate-400">{pid.unit}</span>
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(pid.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Excluir PID"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>
            <strong className="text-purple-400">{pids.filter((p) => p.enabled).length}</strong> PIDs ativos no fluxo de telemetria
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
