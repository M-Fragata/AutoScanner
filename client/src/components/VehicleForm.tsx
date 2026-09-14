import React from 'react';
import { Car, Calendar, Gauge, MessageSquare, Bookmark } from 'lucide-react';
import type { VehicleInfo } from '../types/scanner';

interface VehicleFormProps {
  vehicle: VehicleInfo;
  symptoms: string;
  onVehicleChange: (vehicle: VehicleInfo) => void;
  onSymptomsChange: (symptoms: string) => void;
}

const PRESETS: Array<{ label: string; vehicle: VehicleInfo; symptom: string }> = [
  {
    label: 'VW Golf GTI (Misfire P0300)',
    vehicle: { make: 'Volkswagen', model: 'Golf GTI 2.0 TSI', year: 2021, mileageKm: 58000 },
    symptom: 'Perda de potência repentina em aceleração e vibração perceptível no volante.',
  },
  {
    label: 'Toyota Corolla (Catalisador P0420)',
    vehicle: { make: 'Toyota', model: 'Corolla Altis 2.0', year: 2020, mileageKm: 92000 },
    symptom: 'Luz da injeção acesa constante no painel e consumo excessivo de combustível.',
  },
  {
    label: 'Honda Civic (Mistura Pobre P0171)',
    vehicle: { make: 'Honda', model: 'Civic Touring 1.5 Turbo', year: 2022, mileageKm: 42000 },
    symptom: 'Engasgos nas primeiras partidas a frio e oscilação de marcha lenta.',
  },
];

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  symptoms,
  onVehicleChange,
  onSymptomsChange,
}) => {
  const handleChange = (field: keyof VehicleInfo, value: string | number) => {
    onVehicleChange({
      ...vehicle,
      [field]: value,
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    onVehicleChange(preset.vehicle);
    onSymptomsChange(preset.symptom);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-200 uppercase tracking-wide">
              Ficha do Veículo
            </h2>
          </div>

          {/* Presets rápidos */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Exemplos:</span>
          </div>
        </div>

        {/* Botões de presets rápidos */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/70 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Campos de dados do veículo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Marca
            </label>
            <input
              type="text"
              value={vehicle.make}
              onChange={(e) => handleChange('make', e.target.value)}
              placeholder="Ex: Volkswagen, Toyota"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Modelo
            </label>
            <input
              type="text"
              value={vehicle.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="Ex: Golf GTI, Corolla"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Ano Fabricação
            </label>
            <input
              type="number"
              min={1980}
              max={2026}
              value={vehicle.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value, 10) || 2020)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center">
              <Gauge className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Quilometragem (KM)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={vehicle.mileageKm}
              onChange={(e) => handleChange('mileageKm', parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Sintomas relatados */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center">
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Sintomas e Comportamento Anômalo
          </label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => onSymptomsChange(e.target.value)}
            placeholder="Descreva o que o condutor percebeu: falhas, ruídos, cheiro de combustível, etc."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};
