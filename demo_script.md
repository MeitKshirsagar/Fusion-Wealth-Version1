# 🎬 3-Minute Demo Script: Fusion Wealth × Archestra

## 0:00–0:20 — The Hook (Impact)
> *"What if you could have a Goldman Sachs analyst team — for free? Fusion Wealth brings institutional-grade portfolio optimization to retail investors, powered by Archestra AI agents."*

- **Show:** Your dark-mode dashboard briefly (first impression matters)
- **Show:** Split-screen layout already set up: **Archestra on left, Dashboard on right**

## 0:20–0:50 — Architecture Flash (Learning & Growth)
- Show Archestra with your **two agents**: "Fusion Quant 📊" and "Fusion Advisor 🤝"
- **Quick voiceover:** *"We built a custom MCP server with 9 tools — including a custom SSE transport to handle Archestra's stateless probes, multi-session management, and Docker networking."*
- Show the **tool list** recognized by Archestra (all 9 tools with [Quant]/[Advisor]/[Shared] labels)
- **⏱️ This takes 30 seconds but covers: Technical Implementation + Learning & Growth**

## 0:50–1:40 — The Quant Agent Live (Technical + Creativity)
Run these two prompts in sequence (pre-type them for speed):

1. **"Buy 100 shares of TCS at 3500 and 50 shares of RELIANCE at 2800"**
   - 👉 While agent processes, **pan to the dashboard** — show the Trading Terminal flash green with `🤖 Agent Trade Detected` toast
   - *"Notice how the agent's action instantly appears on our live React dashboard — no refresh needed."*

2. **"Simulate a 2008-style crash on my portfolio"**
   - 👉 This is your **showstopper** — Markdown tables with crash impact, emoji risk assessment
   - *"The agent is stress-testing the portfolio we just built, using historical crisis multipliers."*

## 1:40–2:20 — The Advisor Steps In (Orchestration + Aesthetics)
Switch to the Advisor agent:

3. **"What's the market sentiment for a Balanced Guardian investor?"**
   - 👉 Shows formatted news with 🟢/🔴 sentiment emojis

4. **"Given the crash data, should I be worried? My health score is 72."**
   - 👉 Gemini generates a narrative explanation — this is the **Quant→Advisor handoff** that shows orchestration

- *"The Quant gives raw data, the Advisor speaks in plain English. Two agents, one platform."*

## 2:20–2:50 — The Full Pipeline (Best Use of Archestra)
5. **"Calculate my full portfolio strategy"** (paste a quick JSON state)
   - 👉 This fires the **entire pipeline**: Merton + Monte Carlo + Goals + Gemini narrative
   - Pan to dashboard showing updated charts
   - *"Nine tools, five quant engines, one API call — all orchestrated by Archestra."*

## 2:50–3:00 — Closing
> *"Fusion Wealth proves Archestra can power real financial applications — not just chatbots. Institutional-grade wealth management, accessible to everyone."*

---

## 🎯 Key Tips for Maximum Impact

| Tip | Why |
|---|---|
| **Pre-type all prompts** in a notepad, copy-paste during recording | Saves 30+ seconds of typing |
| **Speed up wait times** to 2x in editing | Judges won't wait for API calls |
| **Keep terminal logs visible** in a small corner | Shows MCP server activity — judges love backend proof |
| **Start with trades FIRST**, not strategy | The live dashboard flash is your most visual moment — lead with it |
| **Reset `trades.json` to `[]`** before recording | Clean slate for the demo |
| **Don't explain the code** | Show, don't tell. The video is about the *product*, not the implementation |

## 📋 Pre-Recording Checklist
```
1. cd server && npm run start        (Express server on :3001)
2. cd server && npm run mcp:sse      (MCP server on :3002)  
3. npm run dev                       (Frontend on :5173)
4. echo "[]" > server/trades.json    (Reset trades)
5. Archestra agents configured (Quant + Advisor)
6. OBS recording at 1080p, split-screen layout ready
7. All 5 prompts pre-typed in a notepad
```

## 💡 Key Insight
**Lead with the visual wow (trade flash), then go deep (crash simulation), then show intelligence (narrative).** This arc keeps judges engaged across all 3 minutes.
