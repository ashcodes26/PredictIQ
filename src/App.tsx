/**
 * PredictIQ · Multi-Asset Industrial IoT Predictive Maintenance
 * Clean, Uncongested Enterprise Dashboard with Machine Copilot & Multi-Machine Support
 */

import React, { useState, useMemo } from 'react';
import { CleanTopNav } from './components/CleanTopNav';
import { CleanAssetHero } from './components/CleanAssetHero';
import { CleanTimeline } from './components/CleanTimeline';
import { CleanSensorGrid } from './components/CleanSensorGrid';
import { HealthIndexRulChart } from './components/HealthIndexRulChart';
import { VenturePitchPanel } from './components/VenturePitchPanel';
import { MachineCopilot } from './components/MachineCopilot';
import { AddMachineModal } from './components/AddMachineModal';
import { AppPyCodeModal } from './components/AppPyCodeModal';
import { getDefaultFleet, createCustomMachine, getAssetFinancialStatus } from './utils/engineSimulation';
import { MachineAsset, MachineType } from './types/telemetry';

export default function App() {
  const [assets, setAssets] = useState<MachineAsset[]>(getDefaultFleet);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('turbofan-01');
  const [currentCycle, setCurrentCycle] = useState<number>(35);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'roi'>('overview');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Retrieve active asset
  const currentAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Handle switching asset
  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setIsPlaying(false);
    const targetAsset = assets.find((a) => a.id === id);
    if (targetAsset) {
      setCurrentCycle((prev) => Math.min(prev, targetAsset.maxLife));
    }
  };

  // Handle adding new machine
  const handleAddMachine = (
    name: string,
    type: MachineType,
    location: string,
    criticality: 'Critical' | 'High' | 'Medium',
    lifespan: number
  ) => {
    const newMachine = createCustomMachine(name, type, location, criticality, lifespan);
    setAssets((prev) => [newMachine, ...prev]);
    setSelectedAssetId(newMachine.id);
    setCurrentCycle(15);
    setIsPlaying(false);
  };

  const safeCycle = Math.max(1, Math.min(currentAsset.maxLife, currentCycle));
  const activePoint = currentAsset.data[safeCycle - 1] || currentAsset.data[0];

  const financials = useMemo(() => {
    return getAssetFinancialStatus(safeCycle, activePoint, currentAsset);
  }, [safeCycle, activePoint, currentAsset]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Clean Top Navigation Bar */}
      <CleanTopNav
        assets={assets}
        selectedAssetId={selectedAssetId}
        onSelectAsset={handleSelectAsset}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Clean Asset Hero Card */}
        <CleanAssetHero
          asset={currentAsset}
          currentCycle={safeCycle}
          activePoint={activePoint}
          financials={financials}
        />

        {/* Clean Uncongested Timeline Scrubber */}
        <CleanTimeline
          asset={currentAsset}
          currentCycle={safeCycle}
          onCycleChange={setCurrentCycle}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          speed={speed}
          onSpeedChange={setSpeed}
        />

        {/* Content & Optional Copilot Sidecar */}
        <div className={`grid grid-cols-1 ${isCopilotOpen ? 'lg:grid-cols-12 gap-6' : ''}`}>
          {/* Main Visual Content */}
          <div className={isCopilotOpen ? 'lg:col-span-8' : 'w-full'}>
            {activeTab === 'overview' && (
              <CleanSensorGrid
                asset={currentAsset}
                currentCycle={safeCycle}
                activePoint={activePoint}
              />
            )}

            {activeTab === 'models' && (
              <HealthIndexRulChart
                data={currentAsset.data}
                currentCycle={safeCycle}
                maxCycles={currentAsset.maxLife}
                kneePoint={currentAsset.kneePoint}
                threshold3Sigma={currentAsset.threshold3Sigma}
                timeUnit={currentAsset.timeUnit}
              />
            )}

            {activeTab === 'roi' && (
              <VenturePitchPanel
                asset={currentAsset}
                data={currentAsset.data}
                currentCycle={safeCycle}
                financials={financials}
              />
            )}
          </div>

          {/* Machine Copilot Panel */}
          {isCopilotOpen && (
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <MachineCopilot
                  asset={currentAsset}
                  currentCycle={safeCycle}
                  activePoint={activePoint}
                  financials={financials}
                  onClose={() => setIsCopilotOpen(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quiet footer */}
        <footer className="pt-6 pb-4 border-t border-[#1e2638] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>PredictIQ Enterprise Fleet Condition Monitoring</span>
            <span className="mx-2">·</span>
            <span>{assets.length} Assets Registered</span>
          </div>
          <div>
            <span>Stand-alone Python Benchmark: <code className="text-blue-400">app.py</code></span>
          </div>
        </footer>
      </main>

      {/* Add New Machine Modal */}
      <AddMachineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMachine={handleAddMachine}
      />

      {/* Python Code Inspector Modal */}
      <AppPyCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
