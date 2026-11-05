# NASA C-MAPSS Turbofan Predictive Maintenance Digital Twin & Jury Pitch Platform

A pitch-ready, dual-delivery Industrial IoT Predictive Maintenance system based on the NASA C-MAPSS (FD001) turbofan benchmark. It pairs an interactive Mission Control dark HUD browser cockpit with a standalone, self-contained Python script (`app.py`) powered by PyTorch, Streamlit, and Plotly.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and presentation modes have been confirmed based on user feedback:
> - **Dual Delivery Model**: Complete interactive browser cockpit running live in AI Studio, coupled with a production-grade, self-contained Python script (`app.py`) with inline PyTorch models and fast fitting.
> - **Visual Language**: Aerospace Mission Control dark HUD aesthetic (#07090E canvas, calibrated telemetry amber and laser cyan accents, crisp hairline borders, tabular monospace metrics).
> - **Simulation Scope**: Deep-dive engine inspection with multi-engine fleet switcher (Units #1 through #5 with distinct run-to-failure lifespans and degradation profiles).

- **Confirmed Decision 1**: Dual delivery of interactive web application and exportable Python `app.py`.
- **Confirmed Decision 2**: Dark aerospace telemetry console with dense, tabular HUD metrics and zero generic AI slop.
- **Confirmed Decision 3**: Multi-engine fleet selector with interactive time machine (cycle scrubber, playback, degradation knee-point triggers).

---

## 1. Overview & Core Concept

- **What It Does**: Simulates continuous run-to-failure degradation of aircraft turbofan engines across operational cycles. A two-stage PyTorch machine learning pipeline first estimates a continuous Health Index via an Autoencoder's reconstruction MSE (flagging statistical 3-sigma knee-point drift), then predicts Remaining Useful Life (RUL) with an LSTM sequence model under piecewise-linear clipping (RUL $\le 125$).
- **Target Audience**: Venture capital innovation juries, chief maintenance officers, and aerospace engineering evaluators who require both high-level business ROI metrics and deep machine learning explainability.
- **Key Value**: Bridges the gap between raw edge sensor telemetry and boardroom financial decisions, proving how predictive intervention prevents catastrophic failure ($180,000 unplanned downtime vs. $12,000 scheduled repair) while scoring low on NASA asymmetric penalty metrics.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Fleet Overview & Unit Selection**: Evaluators toggle between Turbofan Units (#1 through #5) in the top telemetry ribbon to observe varying healthy baseline lengths and wear rates.
2. **Time Machine Scrubber & Real-Time Simulation**: Presenters can manually scrub engine cycles (1 to 200+) or click **"Simulate Telemetry"** (1x, 2x, 5x speed) to watch multi-sensor telemetry stream in real time.
3. **Threshold Breaching & Alert Transitions**:
   - Cycles $1 \to \text{Knee-Point}$: System state displays `NOMINAL / HEALTHY` (emerald).
   - Cycles $\text{Knee-Point} \to \text{Degradation}$: Autoencoder MSE breaches 3-sigma statistical baseline; state escalates to `DRIFT DETECTED` (telemetry amber).
   - Cycles $\text{Late Degradation}$: LSTM RUL drops below 30 cycles; state updates to `SCHEDULE MAINTENANCE` (orange).
   - Cycles $\text{Terminal Wear}$: RUL drops below 10 cycles; system triggers `CRITICAL IMMINENT FAILURE` (rose alert).
4. **Diagnostic Deep-Dive**: Presenters inspect the Multi-Sensor Drift chart (T24, T50, P30, Nf, Ps30, Vibration) against nominal tolerance bands, alongside the dual Autoencoder MSE vs. LSTM RUL trajectory.
5. **Pitch & Financial ROI Panel**: Demonstrates the asymmetric penalty score ($s = \sum e^{-d/10}-1$ vs. $e^{d/13}-1$) and calculates net savings, downtime prevention ROI, and flight hours preserved.
6. **Code & Artifact Export**: View and copy the complete, single-file Python `app.py` script ready for local `streamlit run app.py` deployment.

### Visual Identity & Theme
- **Aesthetic Direction**: High-precision Aerospace Mission Control HUD. Flat obsidian panels, hairline slate dividers, zero decorative glow or cartoon pills.
- **Color Palette (60-30-10 Rule)**:
  - *Dominant Canvas (60%)*: Deep space obsidian (`#07090E` / `#0B0E17`).
  - *Structural Panels (30%)*: Precision slate surfaces (`#111827` / `#161F30`), crisp hairline borders (`#1E293B` / `#2D3748`).
  - *Telemetry Accents (10%)*: Calibrated laser cyan (`#06B6D4`) for primary signals, telemetry amber (`#F59E0B`) for drift warnings, cobalt (`#3B82F6`) for baselines, and crimson (`#EF4444`) for critical failure limits.
- **Typography & Precision Notation**:
  - *Interface & Labels*: Technical geometric sans (`Plus Jakarta Sans` / `IBM Plex Sans`).
  - *Metrics, Coordinates & Timestamps*: Dedicated tabular monospace (`font-mono tabular-nums`), explicit unit separation (e.g. `1,428.6` with muted `°R` unit).
- **Zero-Pill Discipline**: Status indicators use unboxed text with symbol glyphs (`● Nominal`, `▲ Drift Detected`, `■ Maintenance Required`), separated by subtle typographic slashes (`/`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Execution Model (React Browser Cockpit + Python app.py)**
  - *Chosen Approach*: Implement an ultra-responsive, zero-latency digital twin in the live browser preview while generating a standalone, verified Python `app.py` file with exact PyTorch architectures.
  - *Why*: Allows immediate interactive demonstration during the live pitch without requiring Python sandbox dependencies in the browser frame, while providing the single-file PyTorch/Streamlit deliverable requested for CLI execution.
- **Decision 2: Fast Deterministic Model Fitting in Python (`< 3s`)**
  - *Chosen Approach*: The Python script uses an inline PyTorch Autoencoder and GRU/LSTM with a lightweight synthetic generator and fast 5-epoch warmup on startup or cached weights.
  - *Why*: Streamlit apps must not hang or fail on startup. Instant boot is critical for jury demos.
- **Decision 3: Asymmetric NASA Scoring Function Inclusion**
  - *Chosen Approach*: Embed the authentic NASA C-MAPSS evaluation metric penalizing late predictions ($d > 0$) much more severely than early predictions ($d < 0$).
  - *Why*: Shows judges deep domain expertise in industrial aerospace maintenance where failing late causes uncontained engine failures.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NASA C-MAPSS PLATFORM                           │
└────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│     Interactive Web Cockpit       │       │       Standalone `app.py`         │
│       (AI Studio Dev Port)        │       │   (Streamlit + PyTorch + Plotly)  │
├───────────────────────────────────┤       ├───────────────────────────────────┤
│ • React 19 + Tailwind v4          │       │ • PyTorch Autoencoder (Stage 1)   │
│ • Mission Control HUD Canvas      │       │ • PyTorch LSTM/GRU RUL (Stage 2)  │
│ • Multi-Engine Fleet Engine       │       │ • C-MAPSS FD001 Telemetry Gen     │
│ • Vector Sensor Drift Visualizer  │       │ • Interactive Plotly Diagnostics  │
│ • Financial ROI & Penalty Score   │       │ • Asymmetric Scoring & ROI Matrix │
│ • Python Script Viewer & Export   │       │ • Single-File Execution (<3s boot)│
└───────────────────────────────────┘       └───────────────────────────────────┘
```

### Component Hierarchy
1. **Top Telemetry Ribbon**: Unit selector (`Unit #1` to `#5`), flight hours logged, total operating cycles, and system connection health.
2. **Executive KPI Ribbon**:
   - Dynamic System Status (HEALTHY $\to$ DRIFT $\to$ SCHEDULE $\to$ CRITICAL).
   - Current Cycle & Projected RUL with $\pm 95\%$ confidence bounds.
   - Autoencoder Anomaly Reconstruction MSE vs. 3-Sigma threshold.
   - Real-time Cost Avoidance ($168,000 saved per avoided uncontained failure).
3. **Time Machine Controller**:
   - Operating cycle slider (`1` to `max_cycles`).
   - Play/Pause simulation toggle with speed multiplier (`1x`, `2x`, `5x`).
   - Step forward / Step backward single-cycle precision buttons.
4. **Telemetry Diagnostic Stage**:
   - *Panel A*: Multi-Sensor Drift Chart (T24, T50, P30, Nf, Ps30, Vibration proxy) with nominal operating envelopes.
   - *Panel B*: Health Degradation Index (Autoencoder MSE crossing threshold) & RUL curve (Actual vs Predicted with piecewise clipping at 125).
5. **Venture Pitch & Impact Matrix**:
   - Asymmetric NASA scoring penalty comparison.
   - Scheduled Maintenance ($12k) vs Unplanned Downtime ($180k) breakdown.
   - Fleet-wide MTBF and dispatch reliability improvements.
6. **Code Export & Local Execution Modal**:
   - Full syntax-highlighted viewer for `app.py`.
   - 1-click clipboard copy and `.py` file download.
   - CLI verification instructions (`pip install streamlit torch plotly pandas numpy scikit-learn && streamlit run app.py`).
