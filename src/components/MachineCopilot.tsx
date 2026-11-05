import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, RefreshCw, X } from 'lucide-react';
import { FinancialImpact, MachineAsset, TelemetryPoint } from '../types/telemetry';

interface MachineCopilotProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  financials: FinancialImpact;
  onClose?: () => void;
}

interface Message {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  timestamp: string;
}

export const MachineCopilot: React.FC<MachineCopilotProps> = ({
  asset,
  currentCycle,
  activePoint,
  financials,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate diagnosis when asset or lifecycle milestone changes
  useEffect(() => {
    generateAutomatedDiagnosis();
  }, [asset.id, Math.floor(currentCycle / 20)]);

  const generateAutomatedDiagnosis = async () => {
    const prompt = `Provide an instant 2-sentence executive summary of ${asset.name} (${asset.category}) at ${currentCycle} of ${asset.maxLife} ${asset.timeUnit}. Highlight key sensor drift, RUL, and recommended maintenance action.`;
    await sendMessageToApi(prompt, true);
  };

  const sendMessageToApi = async (userPrompt: string, isAutomated = false) => {
    setIsLoading(true);

    const telemetryContext = {
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      category: asset.category,
      location: asset.location,
      timeUnit: asset.timeUnit,
      currentCycle,
      maxLife: asset.maxLife,
      status: financials.status,
      rulPred: activePoint.RUL_pred,
      healthIndexMse: activePoint.health_index_mse,
      threshold3Sigma: asset.threshold3Sigma,
      sensors: asset.sensors.map((s) => ({
        name: s.name,
        current: activePoint[s.key as keyof TelemetryPoint],
        baseline: s.baseline,
        unit: s.unit,
      })),
      avoidedLoss: financials.avoidedLoss,
      scheduledCost: financials.scheduledCost,
      unplannedCost: financials.unplannedCost,
    };

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          telemetryContext,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || data.error || 'Diagnostic assessment complete.';

      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'copilot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (isAutomated) {
        setMessages([newMsg]);
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch {
      // Heuristic fallback
      const fallbackMsg: Message = {
        id: Date.now().toString(),
        sender: 'copilot',
        text: `**Aero-Copilot Assessment (${asset.name}):**\nCondition is **${financials.status}** with **${Math.round(activePoint.RUL_pred)} ${asset.timeUnit}** remaining. ${
          activePoint.RUL_pred < 35
            ? `Recommended Action: Schedule preventive overhaul now to protect $${financials.avoidedLoss.toLocaleString()} in unscheduled outage losses.`
            : `System is running stably within normal operational envelopes.`
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (isAutomated) {
        setMessages([fallbackMsg]);
      } else {
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    await sendMessageToApi(userText, false);
  };

  const quickPrompts = [
    { label: 'Condition Summary', prompt: `Summarize the operational health of ${asset.name} in plain terms.` },
    { label: 'Recommended Action', prompt: `What maintenance procedure should be executed for ${asset.name} right now?` },
    { label: 'Financial Savings', prompt: `Explain the cost avoidance between scheduled service and catastrophic failure for this machine.` },
  ];

  return (
    <div className="bg-gradient-to-b from-[#1b263b] to-[#151f32] border border-slate-700/60 rounded-xl flex flex-col h-full shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#172235] to-[#1b273d] border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600/25 border border-blue-400/40 rounded-lg text-blue-400 shadow-inner">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>PredictIQ Copilot</span>
              <span className="text-[10px] text-blue-300 bg-blue-900/60 px-1.5 py-0.2 rounded border border-blue-700/50 font-medium">
                AI Assistant
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {asset.name} · {currentCycle} {asset.timeUnit}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => generateAutomatedDiagnosis()}
            disabled={isLoading}
            title="Refresh Diagnostic"
            className="p-1.5 text-slate-300 hover:text-white bg-[#223048] hover:bg-[#2a3c5a] border border-slate-600/60 rounded-lg disabled:opacity-40 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white bg-[#223048] hover:bg-[#2a3c5a] border border-slate-600/60 rounded-lg transition-colors shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-[#131d2c] border-b border-slate-700/60 flex items-center gap-1.5 overflow-x-auto shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mr-1" />
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputValue(qp.prompt);
              sendMessageToApi(qp.prompt, false);
            }}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-md bg-[#1f2c42] hover:bg-[#273752] text-slate-200 hover:text-white border border-slate-600/50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 shadow-sm"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[380px] bg-[#101726]/85">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-[#1b263b] border border-slate-600/50 text-slate-100 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {m.sender === 'user' ? 'You' : 'Copilot'} · {m.timestamp}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-300 bg-[#1b263b] border border-slate-600/50 rounded-xl px-3.5 py-2.5 w-fit shadow-sm">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
            <span>Analyzing machine telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-[#131d2c] border-t border-slate-700/60 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask about ${asset.name} health or maintenance...`}
          className="flex-1 bg-[#1c273c] border border-slate-600/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-md"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
