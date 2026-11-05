import React, { useState } from 'react';
import { X, Plus, Cpu, Zap, Wind, Droplets, Gauge } from 'lucide-react';
import { MachineType } from '../types/telemetry';
import { MACHINE_TYPE_TEMPLATES } from '../utils/engineSimulation';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMachine: (
    name: string,
    type: MachineType,
    location: string,
    criticality: 'Critical' | 'High' | 'Medium',
    lifespan: number
  ) => void;
}

export const AddMachineModal: React.FC<AddMachineModalProps> = ({
  isOpen,
  onClose,
  onAddMachine,
}) => {
  const [selectedType, setSelectedType] = useState<MachineType>('transformer');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [criticality, setCriticality] = useState<'Critical' | 'High' | 'Medium'>('High');
  const [lifespan, setLifespan] = useState(200);

  if (!isOpen) return null;

  const machineOptions: Array<{
    type: MachineType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultName: string;
    defaultLoc: string;
    costInfo: string;
  }> = [
    {
      type: 'transformer',
      label: 'HV Power Transformer',
      icon: Zap,
      defaultName: 'Substation Transformer TX-500',
      defaultLoc: 'East Grid Substation · 230kV',
      costInfo: '$450k Unplanned / $22k Scheduled',
    },
    {
      type: 'turbofan',
      label: 'Aviation Turbofan Engine',
      icon: Cpu,
      defaultName: 'Turbofan GE90-115B #03',
      defaultLoc: 'Boeing 777 · Wing Mount L',
      costInfo: '$180k Unplanned / $12k Scheduled',
    },
    {
      type: 'pump',
      label: 'Centrifugal Slurry Pump',
      icon: Droplets,
      defaultName: 'Heavy Slurry Pump P-404',
      defaultLoc: 'Refinery Processing Train C',
      costInfo: '$85k Unplanned / $6.5k Scheduled',
    },
    {
      type: 'gearbox',
      label: 'Wind Turbine Gearbox',
      icon: Wind,
      defaultName: 'Nacelle Gearbox WTG-24',
      defaultLoc: 'Offshore Wind Cluster · Turbine #24',
      costInfo: '$320k Unplanned / $18k Scheduled',
    },
    {
      type: 'generator',
      label: 'Power Plant Generator',
      icon: Gauge,
      defaultName: 'Main Stator Generator GEN-01',
      defaultLoc: 'Combined Cycle Unit 1',
      costInfo: '$260k Unplanned / $15k Scheduled',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || machineOptions.find((m) => m.type === selectedType)?.defaultName || 'New Machine';
    const finalLoc = location.trim() || machineOptions.find((m) => m.type === selectedType)?.defaultLoc || 'Main Facility';
    onAddMachine(finalName, selectedType, finalLoc, criticality, lifespan);
    setName('');
    setLocation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1c273c] to-[#151f32] border border-slate-700/60 rounded-xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-gradient-to-r from-[#172235] to-[#1b273d]">
          <div>
            <h3 className="text-base font-semibold text-white">Add Industrial Asset</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Deploy predictive maintenance monitoring to a new industrial machine
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Machine Type Selector Cards */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-2">
              Select Machine Category
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {machineOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(opt.type);
                      setLifespan(MACHINE_TYPE_TEMPLATES[opt.type].defaultLifespan);
                      if (!name) setName(opt.defaultName);
                      if (!location) setLocation(opt.defaultLoc);
                    }}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-900/40 border-blue-400 text-white shadow-md'
                        : 'bg-[#1f2c42] border-slate-600/50 text-slate-200 hover:border-slate-500 shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-slate-300 mt-1 line-clamp-1">{opt.costInfo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Machine Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5">
                Asset Name / Identifier
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={machineOptions.find((m) => m.type === selectedType)?.defaultName}
                className="w-full bg-[#121a28] border border-slate-600/60 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5">
                Installation Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={machineOptions.find((m) => m.type === selectedType)?.defaultLoc}
                className="w-full bg-[#121a28] border border-slate-600/60 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
              />
            </div>
          </div>

          {/* Criticality & Lifecycle Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5">
                Operational Criticality
              </label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as any)}
                className="w-full bg-[#121a28] border border-slate-600/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="Critical" className="bg-[#162030]">Critical (Immediate Line Stoppage)</option>
                <option value="High" className="bg-[#162030]">High Priority (Redundant Failover)</option>
                <option value="Medium" className="bg-[#162030]">Medium (Auxiliary Support)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5">
                Inspection Interval ({MACHINE_TYPE_TEMPLATES[selectedType].timeUnit})
              </label>
              <input
                type="number"
                min={100}
                max={400}
                value={lifespan}
                onChange={(e) => setLifespan(Number(e.target.value))}
                className="w-full bg-[#121a28] border border-slate-600/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Machine Monitor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
