import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal } from 'lucide-react';

interface AppPyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppPyCodeModal: React.FC<AppPyCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonCode = `#!/usr/bin/env python3
"""
NASA C-MAPSS Turbofan Predictive Maintenance Platform
=====================================================
Single-file, production-grade interactive digital twin and venture jury pitch dashboard.

Requirements:
    pip install streamlit torch plotly pandas numpy scikit-learn

Execution:
    streamlit run app.py
"""

import math
import time
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler

# Complete script is located in /app.py in this repository root!
# Run: streamlit run app.py
`;

  const handleCopy = () => {
    // Fetch actual file or copy script
    fetch('/app.py')
      .then((res) => (res.ok ? res.text() : pythonCode))
      .catch(() => pythonCode)
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDownload = () => {
    fetch('/app.py')
      .then((res) => (res.ok ? res.text() : pythonCode))
      .catch(() => pythonCode)
      .then((text) => {
        const blob = new Blob([text], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0e17] border border-[#1e293b] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              Self-Contained Executable · app.py (Streamlit + PyTorch)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="bg-[#07090e] px-6 py-3 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-500">Run locally: </span>
            <code className="text-cyan-300 bg-[#0f172a] px-2 py-0.5 rounded border border-[#1e293b]">
              pip install streamlit torch plotly pandas numpy scikit-learn && streamlit run app.py
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy app.py'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-[#07090e]">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">
{`# Setup: pip install streamlit torch plotly pandas numpy scikit-learn
# Run: streamlit run app.py

import numpy as np
import pandas as pd
import streamlit as st
import torch
import torch.nn as nn
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Full PyTorch Pipeline & Streamlit UI is stored in /app.py in this repository root!
# It runs with zero cold-start delay (<3s inline fitting) and provides full interactive
# telemetry scrubbing, dual Plotly diagnostic charts, and NASA asymmetric penalty scoring.`}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>File size: ~23 KB · Single standalone file</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
