# Fusion Wealth (Public Shell)

**A Next-Gen Wealth Management Interface with Quant Integration**

## Overview

This repository contains the **Public Shell** of the Fusion Wealth platform. It demonstrates a high-fidelity UI/UX, modern React architecture, and the integration patterns used to connect with autonomous AI agents via the Model Context Protocol (MCP).

**Note:** The proprietary mathematical models (including implementations of Nobel-prize winning economic theories like Intertemporal Consumption, alongside Custom News Sentiment Analysis and Factor Vetting) have been stripped from this public release. They are replaced with mock implementations in the `src/core/logic.public.ts` and `server/src/logic.ts` modules for demonstration purposes.

## Key Features

- **Dynamic Dashboard**: Real-time visualization of wealth projection using simulated Monte Carlo data.
- **Intertemporal Consumption Model**: (Mocked) Calculates safe spending limits based on human capital and projected lifespan.
- **Behavioral Risk Profiling**: Interactive "Sleep-at-night" tests rather than standard questionnaires.
- **Agentic Trading Terminal**: A simulated paper-trading terminal that highlights trades initiated autonomously by a backend Agent via MCP.
- **Live Sentiment Analysis**: (Mocked fallback) Interprets financial news to adjust portfolio risk dynamically.
- **Goal Planning**: Interactive goal setting, gap analysis, and success probability mapping.

## Technology Stack

### Frontend (The Shell)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via utility classes)
- **Charts**: Recharts
- **Icons**: Lucide-React

### Backend (The Engine & Agent Integration)
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **AI Interoperability**: `@modelcontextprotocol/sdk` (MCP Server implementation for Agentic execution)
- **LLM Integration**: `@google/genai`

## Architecture Highlights

The application is structured into two distinct layers that communicate to empower an autonomous AI experience:

1.  **Public Shell (Frontend)**: Handles UI rendering, user state management, and real-time polling of backend data (e.g., watching for Agent trades).
2.  **Quant Core & MCP Server (Backend)**: 
    *   Exposes endpoints for the frontend (like `/strategy` logic and `/trade/holdings`).
    *   Runs an **MCP Server** (on port 3002 via SSE) that exposes specific tools (like `execute_trade` and `fetch_news`) to external AI Agents, allowing them to autonomously interact with the simulated environment.

### Quant Core Dependency Injection

The application is designed to easily swap between the public mock math and the private proprietary math using a Dependency Injection pattern via Vite aliases.
- In the **Private Build**, the alias `@core-logic` matches `src/core/logic.private.ts`.
- In this **Public Build**, it falls back to `src/core/logic.public.ts`.

## Getting Started Locally

**Prerequisites:** Node.js v19+

1. Install all dependencies for both frontend and backend:
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```
2. Set up environment variables:
   * Create a `.env` file in the root and add `VITE_API_URL=http://localhost:3001`
   * Create a `.env` file in the `server` directory and add your keys (e.g., `GEMINI_API_KEY=your_key`)
3. Start the Express/MCP Backend Server:
   ```bash
   cd server
   npm run start
   ```
4. Start the React Frontend (in a new terminal):
   ```bash
   npm run dev
   ```

You will see the full UI on `localhost:5173`, but the calculations driven by the proprietary "Secret Sauce" will be simulated.
