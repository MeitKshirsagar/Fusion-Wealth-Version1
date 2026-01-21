# Fusion Wealth (Public Shell)

**A Next-Gen Wealth Management Interface with Quant Integration**

## Overview
This repository contains the **Public Shell** of the Fusion Wealth platform. It demonstrates the high-fidelity UI/UX, React architecture, and the integration patterns used to connect with our proprietary quantitative models.

**Note:** The proprietary mathematical models (Intertemporal Consumption, News Sentiment Analysis, and Factor Vetting) have been stripped from this public release to protect Intellectual Property. They are replaced with mock implementations in the `src/core/logic.public.ts` module for demonstration purposes.

## Architecture
The application is structured into two distinct layers:
1.  **Public Shell (Present)**: React + Vite frontend, UI components, and state management.
2.  **Quant Core (Redacted)**: A private internal module containing the specific algorithmic weightings and formulas.

### Quant Core Integration
The application uses a **Dependency Injection** pattern via Vite aliases.
- In the **Private Build**, the alias `@core-logic` matches `src/core/logic.private.ts`.
- In this **Public Build**, it falls back to `src/core/logic.public.ts`.

## Features
- **Dynamic Dashboard**: Real-time visualization of wealth projection.
- **Intertemporal Consumption Model**: (Mocked) Calculates safe spending limits based on human capital.
- **Sentiment Analysis**: (Mocked) Inteprets financial news to adjust portfolio risk.
- **Goal Planning**: Interactive goal setting and gap analysis.

## Getting Started
1.  Clone the repository.
2.  `npm install`
3.  `npm run dev`

You will see the full UI, but the numbers driven by the "Secret Sauce" will be simulated.
