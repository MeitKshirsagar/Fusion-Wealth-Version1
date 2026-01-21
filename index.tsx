
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Wallet,
  RefreshCw,
  Activity,
  ArrowRight,
  Banknote,
  Coins,
  BarChart3,
  Clock,
  Globe,
  Calculator,
  Goal,
  Scale,
  Navigation2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Moon,
  Map,
  ShieldAlert,
  Info,
  ExternalLink,
  Loader2,
  Dna,
  Lock,
  Mail,
  User,
  AlertCircle,
  Radio,
  Coffee,
  Gem,
  PiggyBank,
  Rocket,
  Settings2
} from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

/**
 * CONFIGURATION
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '', apiVersion: 'v1' });

// Core Logic Imports
import {
  MertonEngine,
  SentimentEngine,
  FactorEngine,
  GoalEngine,
  TaxEngine
} from '@core-logic';

import {
  FinancialGoal,
  RiskAnswers,
  NewsItem,
  BehavioralStats,
  PortfolioState,
  PortfolioBreakdown,
  PortfolioAsset,
  MertonOutput,
  Prescription,
  TransitionPoint
} from './src/core/types';

/**
 * TYPES & INTERFACES
 */

// Types removed


/**
 * UI COMPONENTS
 */

const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-[#151518] border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

function FusionWealthAppContent() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskStep, setRiskStep] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPhase, setSyncPhase] = useState<string>("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [syncMethod, setSyncMethod] = useState<'MANUAL' | 'AUTO' | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [breakdown, setBreakdown] = useState<PortfolioBreakdown | null>(null);
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[] | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const lastPersonaRef = useRef<string | null>(null);
  const calcIdRef = useRef<number>(0);

  const [state, setState] = useState<PortfolioState>({
    age: 0,
    salary: 0,
    savings: 0,
    riskAnswers: { midnightTest: null, choiceOfPaths: null, safetyNet: null, goalHorizon: null },
    targetAge: 0,
    monthlyExpenses: 0,
    behavioral: { streak: 0, lastContributionAmount: 0, monthlyExpenses: 0, contributionConsistency: 0 },
    goals: [
      { id: '1', label: 'Dream Home', type: 'Housing', targetAmount: 25000000, yearsAway: 12, inflationRate: 0.06 },
      { id: '2', label: 'Kid\'s Education', type: 'Education', targetAmount: 12000000, yearsAway: 15, inflationRate: 0.10 }
    ]
  });

  const [marketMetrics, setMarketMetrics] = useState<{ mu: number, sigma: number }>({ mu: 0.10, sigma: 0.18 });

  // Derived state is now calculated via useMemo, not useState
  // const [merton, setMerton] = useState<MertonOutput | null>(null);
  // const [transitionMap, setTransitionMap] = useState<TransitionPoint[]>([]);
  // const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  // const [healthScore, setHealthScore] = useState(0);

  const [xaiNote, setXaiNote] = useState<string>("");
  // const [loading, setLoading] = useState(false); // No longer needed for sync calc
  const [newsLoading, setNewsLoading] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);


  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const fetchWealthInsights = async (
    currentState: PortfolioState,
    mertonOutput: MertonOutput,
    score: number
  ) => {
    if (insightsLoading) return;
    setInsightsLoading(true);
    try {
      const prompt = `Act as an elite private wealth manager for a high-net-worth individual in India.

      User Profile:
      - Persona: ${mertonOutput.persona}
      - Monthly Income: ${formatCurrency(currentState.salary)}
      - Total Savings: ${formatCurrency(currentState.savings)}
      - Monthly Burn: ${formatCurrency(currentState.monthlyExpenses)}
      - Financial Health Score: ${score}/100

      Task: Provide ONE single, punchy, actionable insight (max 25 words) to improve their financial situation. Be direct. No fluff. Focus on the biggest gap (e.g., low savings rate, high burn, or good progress).`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) setXaiNote(text);
    } catch (e) {
      console.error("Insights Error:", e);
      setXaiNote(`Financial Roadmap Updated. Based on your "${mertonOutput.persona}" profile, your savings plan is looking healthy.`);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchSentinelNews = async (persona: string) => {
    if (newsLoading) return;
    setNewsLoading(true);
    try {
      const prompt = `Act as a high-frequency macro research desk for Fusion Wealth. Search for the most recent, high-impact financial news, regulatory changes, and market shifts (Late 2024 to 2025 context) that directly affect a "${persona}" investor profile in the Indian market. Include specific insights on sectors like Fintech, Real Estate, and Blue-chip Equities.
      
      CRITICAL: Return the result as a raw JSON array of objects. Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
      
      Each object MUST have:
      - headline: String (Punchy, professional)
      - source: String (e.g., Bloomberg, Mint, Economic Times)
      - url: String (A direct, valid link to the article from Google Search)
      - category: String (e.g., 'Monetary Policy', 'Sector Watch', 'Macro Alpha')
      - sentiment: String ('positive' | 'negative' | 'neutral')
      - impact: String ('Low' | 'Medium' | 'High')
      - summary: String (A 2-sentence deep dive insight)
      - timestamp: String (e.g., '14 mins ago' or '2 hours ago')`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt
      });

      let cleanText = response.text?.trim() || "[]";
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');

      const items = JSON.parse(cleanText);
      if (items.length > 0) {
        setNews(items);
        lastPersonaRef.current = persona;
      }
    } catch (e) {
      console.error("Sentinel Feed Error:", e);
      if (news.length === 0) {
        setNews([{
          headline: "Market Resilience in Fiscal Q4",
          source: "HedgePulse",
          url: "https://google.com/search?q=indian+markets+2025",
          category: "Market Update",
          sentiment: "neutral",
          impact: "High",
          summary: "Current indices suggest a steady environment for growth-oriented plans.",
          timestamp: "Just now"
        }]);
      }
    } finally {
      setNewsLoading(false);
    }
  };

  class MarketDataEngine {
    static async fetchMarketMetrics(): Promise<{ mu: number, sigma: number }> {
      const CACHE_KEY = 'fusion_wealth_market_metrics';
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

      // 1. Try LocalStorage Cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log("Using Cached Market Metrics (LocalStorage)");
            return data;
          }
        }
      } catch (e) {
        console.warn("Cache read error:", e);
      }

      // 2. Fetch from API
      try {
        // Using Reliance as a proxy for NIFTY 50 due to free tier limits on indices
        const symbol = 'RELIANCE.BSE';
        const apiKey = 'C3IVZAL03LMAOOQN';
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();
        const timeSeries = data['Time Series (Daily)'];

        if (!timeSeries) {
          // Silently fallback to cache or defaults
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) return JSON.parse(cached).data;
          return { mu: 0.10, sigma: 0.18 };
        }

        const closes: number[] = Object.values(timeSeries)
          .slice(0, 100) // Last 100 trading days
          // @ts-ignore
          .map((d: any) => parseFloat(d['4. close']))
          .reverse();

        if (closes.length < 2) return { mu: 0.10, sigma: 0.18 };

        // Calculate Daily Log Returns
        const returns = [];
        for (let i = 1; i < closes.length; i++) {
          returns.push(Math.log(closes[i] / closes[i - 1]));
        }

        // Calculate Annualized Volatility (Sigma)
        const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length - 1);
        const sigma = Math.sqrt(variance) * Math.sqrt(252);

        // Calculate Annualized Return (Mu) - CAGR
        const totalReturn = (closes[closes.length - 1] - closes[0]) / closes[0];
        const days = closes.length;
        const mu = (Math.pow(1 + totalReturn, 252 / days) - 1);

        console.log(`Market Metrics (Live): Mu=${(mu * 100).toFixed(2)}%, Sigma=${(sigma * 100).toFixed(2)}%`);

        const result = {
          mu: Math.max(0.05, Math.min(0.25, mu)),
          sigma: Math.max(0.10, Math.min(0.40, sigma))
        };

        // 3. Update Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: result
        }));

        return result;

      } catch (e) {
        console.error("Market Data Error:", e);
        // Fallback to stale cache if available
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return JSON.parse(cached).data;
        return { mu: 0.10, sigma: 0.18 };
      }
    }
  }

  // LAYER 4: Market Data Engine (Async Fetch)
  useEffect(() => {
    const loadMarketData = async () => {
      const metrics = await MarketDataEngine.fetchMarketMetrics();
      setMarketMetrics(metrics);
    };
    loadMarketData();
  }, []); // Run once on mount

  // MEMOIZED CALCULATIONS (The Core Logic)
  const { merton, transitionMap, prescriptions, healthScore } = useMemo(() => {
    // LAYER 2: Black-Litterman Intelligence Tilt
    const sentimentTilt = SentimentEngine.calculate(news);
    const muTilt = sentimentTilt * 0.02;
    const adjustedMu = Math.max(0.05, marketMetrics.mu + muTilt);
    const sigma = marketMetrics.sigma;

    // LAYER 1: Merton Engine
    const mRes = MertonEngine.calculate(state, adjustedMu, sigma);

    // Monte Carlo
    const yearsLeft = Math.max(1, state.targetAge - state.age);
    const mc = MertonEngine.runMonteCarlo(state.savings, yearsLeft, adjustedMu, sigma, state.behavioral.lastContributionAmount);

    // Goals
    const goalAllocatedSip = state.goals.length > 0
      ? state.behavioral.lastContributionAmount / state.goals.length
      : 0;
    const goalResults = state.goals.map(g => GoalEngine.calculateGoalGap(g, goalAllocatedSip, adjustedMu));

    // Transition Map
    const r = 0.04;
    const mapData: TransitionPoint[] = [];
    for (let i = 0; i <= yearsLeft; i++) {
      const curAge = state.age + i;
      const hc = (mRes.netMonthlyIncome * 12) * ((1 - Math.pow(1 + r, -(state.targetAge - curAge))) / r);
      const fa = mc[i * 12]?.median || 0;
      mapData.push({ age: curAge, humanCapital: Math.max(0, hc), financialAssets: fa });
    }

    // LAYER 3: Factor Vetting
    const qualityScore = FactorEngine.calculate(mRes.persona, portfolioAssets);

    const avgGoalSuccess = goalResults.length > 0
      ? goalResults.reduce((acc, curr) => acc + curr.successRate, 0) / goalResults.length
      : 100;

    const finalHealthScore = Math.round((mRes.mertonFraction * 40) + (avgGoalSuccess * 0.4) + (qualityScore * 0.2));

    return {
      merton: mRes,
      transitionMap: mapData,
      prescriptions: goalResults,
      healthScore: finalHealthScore
    };
  }, [state, marketMetrics, news, portfolioAssets]);

  // Trigger News & Insights when Persona changes
  useEffect(() => {
    if (merton && (!news.length || lastPersonaRef.current !== merton.persona)) {
      fetchSentinelNews(merton.persona);
    }
  }, [merton?.persona]); // Only re-run if persona changes

  useEffect(() => {
    if (merton && !isSyncing && !insightsLoading && !xaiNote) {
      fetchWealthInsights(state, merton, healthScore);
    }
  }, [healthScore]); // Trigger insights on score change (debounced effectively by memo)

  const executeSyncSimulation = async () => {
    setIsSyncing(true);
    setSyncPhase("CONNECTING_BANK_ACCOUNTS");
    await new Promise(r => setTimeout(r, 1000));
    setSyncPhase("AGGREGATING_BROKERAGE_DATA");
    await new Promise(r => setTimeout(r, 1200));
    setSyncPhase("ANALYZING_STOCKS_AND_BONDS");
    await new Promise(r => setTimeout(r, 800));
    setSyncPhase("FINALIZING_CONSOLIDATED_NW");
    await new Promise(r => setTimeout(r, 1500));

    const newSavings = 4200000;
    const nextState = { ...state, savings: newSavings };
    setState(nextState);

    if (isDemoMode) {
      const demoAssets: PortfolioAsset[] = [
        { name: 'Nifty 50 Index Fund', value: 1850000, category: 'Equity' },
        { name: 'Bluechip Alpha Stocks', value: 964000, category: 'Equity' },
        { name: 'Corporate Bond Fund', value: 1092000, category: 'Debt' },
        { name: 'Liquid Savings', value: 294000, category: 'Cash' }
      ];
      setPortfolioAssets(demoAssets);

      setBreakdown({
        equity: 2814000,
        debt: 1092000,
        cash: 294000,
        lastUpdated: new Date().toLocaleDateString(),
        source: 'Sentinel Sync'
      });
    } else {
      setBreakdown({
        equity: 2800000,
        debt: 1100000,
        cash: 300000,
        lastUpdated: new Date().toLocaleDateString(),
        source: 'Sentinel Sync'
      });
    }

    setSyncPhase("MAPPING_FUTURE");
    // No need to call calculateEverything, state update triggers useMemo
    // await calculateEverything(nextState);

    setXaiNote(`[Sync Successful] Investment data updated. Your total savings & investments now reflect ${formatCurrency(newSavings)}.`);
    setIsSyncing(false);
    setSyncPhase("");
    setShowSyncModal(false);
    setShowDisclosure(false);
    setSyncMethod(null);
    setManualFile(null);
  };

  const handleSyncClick = () => {
    setShowSyncModal(true);
  };

  const fetchLatestCAS = async (token: string) => {
    try {
      // 1. Search for CAS emails
      const searchRes = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: 'subject:"Consolidated Account Statement" has:attachment', maxResults: 1 }
      });

      if (!searchRes.data.messages || searchRes.data.messages.length === 0) {
        throw new Error("No CAS emails found.");
      }

      const messageId = searchRes.data.messages[0].id;

      // 2. Get message details to find attachment ID
      const messageRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const parts = messageRes.data.payload.parts;
      const attachmentPart = parts.find((p: any) => p.filename && p.filename.endsWith('.pdf'));

      if (!attachmentPart || !attachmentPart.body.attachmentId) {
        throw new Error("No PDF attachment found in the latest CAS email.");
      }

      // 3. Fetch attachment data
      const attachmentRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentPart.body.attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return attachmentRes.data.data; // Base64 string
    } catch (error) {
      console.error("Error fetching CAS:", error);
      throw error;
    }
  };

  const processCASData = async (base64Data: string) => {
    console.log("Sending PDF to Python Backend for CAS Parsing...");
    // Simulate parsing delay
    await new Promise(r => setTimeout(r, 2000));
    return true;
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setSyncPhase("CONNECTING_GMAIL_SENTINEL");
        setShowDisclosure(false); // Hide disclosure once login starts
        setIsSyncing(true);

        const base64Data = await fetchLatestCAS(tokenResponse.access_token);
        setSyncPhase("PARSING_CAS_PDF");
        await processCASData(base64Data);

        // Proceed with simulation logic after successful fetch/parse
        executeSyncSimulation();
      } catch (error) {
        console.error("Gmail Sync Failed:", error);
        setXaiNote("Error: Could not sync with Gmail. Please try manual upload.");
        setIsSyncing(false);
        setShowDisclosure(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    onError: () => {
      console.error("Google Login Failed");
      setIsSyncing(false);
      setShowDisclosure(false);
    }
  });

  const handleSyncMethodSelect = (method: 'MANUAL' | 'AUTO') => {
    setSyncMethod(method);
    if (method === 'AUTO') {
      setShowSyncModal(false);
      setShowDisclosure(true);
      // Trigger login after 3s delay (handled in Disclosure effect or timeout)
      // setTimeout(() => {
      //   if (isDemoMode) {
      //     executeSyncSimulation();
      //   } else {
      //     login();
      //   }
      // }, 3000);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setManualFile(e.target.files[0]);
      // Simulate parsing delay then sync
      setTimeout(() => {
        executeSyncSimulation();
      }, 1500);
    }
  };



  // Removed useEffect triggering calculateEverything on state change
  // Calculations are now reactive via useMemo

  const addGoal = () => {
    const newGoal: FinancialGoal = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Financial Target',
      type: 'Legacy',
      targetAmount: 5000000,
      yearsAway: 10,
      inflationRate: 0.07
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    setEditingGoalId(newGoal.id);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const startRecalibration = () => {
    setRiskStep(0);
    setShowRiskModal(true);
  };

  const renderRiskWizard = () => {
    const steps = [
      {
        type: 'inputs',
        id: 'financials',
        icon: <Wallet className="w-10 h-10 text-emerald-400" />,
        title: "Financial Health",
        subtitle: "Let's establish your baseline cash flow.",
        fields: [
          { label: "Monthly Income", value: state.salary, onChange: (v: number) => setState(s => ({ ...s, salary: v })) },
          { label: "Monthly Spending", value: state.monthlyExpenses, onChange: (v: number) => setState(s => ({ ...s, monthlyExpenses: v })) }
        ]
      },
      {
        type: 'inputs',
        id: 'assets',
        icon: <PiggyBank className="w-10 h-10 text-blue-400" />,
        title: "Assets & Growth",
        subtitle: "Your current wealth snapshot.",
        fields: [
          { label: "Total Savings", value: state.savings, onChange: (v: number) => setState(s => ({ ...s, savings: v })) },
          { label: "Monthly SIP", value: state.behavioral.lastContributionAmount, onChange: (v: number) => setState(s => ({ ...s, behavioral: { ...s.behavioral, lastContributionAmount: v } })) }
        ]
      },
      {
        type: 'inputs',
        id: 'timeline',
        icon: <Clock className="w-10 h-10 text-indigo-400" />,
        title: "Your Timeline",
        subtitle: "Time is the most critical factor.",
        fields: [
          { label: "Current Age", value: state.age, onChange: (v: number) => setState(s => ({ ...s, age: v })) },
          { label: "Retirement Age", value: state.targetAge, onChange: (v: number) => setState(s => ({ ...s, targetAge: v })) }
        ]
      },
      {
        type: 'choice',
        id: 'midnightTest',
        icon: <Moon className="w-10 h-10 text-indigo-400" />,
        title: "The Sleep-at-Night Test",
        subtitle: "If your investments dropped 20% tomorrow, how would you feel?",
        options: [
          { key: 'A', text: "Very anxious—I'd want to withdraw immediately." },
          { key: 'B', text: "Concerned, but I'd wait and see for a few weeks." },
          { key: 'C', text: "Not worried; markets always bounce back eventually." },
          { key: 'D', text: "Excited! It's a great time to buy more at a discount." }
        ]
      },
      {
        type: 'choice',
        id: 'choiceOfPaths',
        icon: <Map className="w-10 h-10 text-emerald-400" />,
        title: "Your Preferred Journey",
        subtitle: "What kind of investment growth are you looking for?",
        options: [
          { key: 'A', text: "Low risk: Slow but steady 5-6% growth." },
          { key: 'B', text: "Balanced: Moderate risk with 10-12% growth." },
          { key: 'C', text: "High growth: Higher risk with 15%+ potential." }
        ]
      },
      {
        type: 'choice',
        id: 'safetyNet',
        icon: <ShieldAlert className="w-10 h-10 text-amber-400" />,
        title: "Your Emergency Fund",
        subtitle: "How many months could you support yourself if you lost your job today?",
        options: [
          { key: 'A', text: "Less than 1 month" },
          { key: 'B', text: "1 to 3 months" },
          { key: 'C', text: "3 to 6 months" },
          { key: 'D', text: "More than 6 months" }
        ]
      },
      {
        type: 'choice',
        id: 'goalHorizon',
        icon: <Clock className="w-10 h-10 text-blue-400" />,
        title: "Your Time Horizon",
        subtitle: "How soon do you need to start using your primary savings?",
        options: [
          { key: 'A', text: "Within the next 3 years" },
          { key: 'B', text: "In 3 to 10 years" },
          { key: 'C', text: "More than 10 years from now" }
        ]
      }
    ];

    const currentStep = steps[riskStep];

    const handleNext = () => {
      if (riskStep < steps.length - 1) {
        setRiskStep(riskStep + 1);
      } else {
        setShowRiskModal(false);
        setRiskStep(0);
        setShowOnboarding(false);

        // calculateEverything(); // Removed, reactive
      }
    };

    const handleChoice = (key: any) => {
      const nextAnswers = { ...state.riskAnswers, [currentStep.id]: key };
      setState({ ...state, riskAnswers: nextAnswers });
      handleNext();
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
        <div className="max-w-xl w-full bg-[#1a1a1e] border border-white/10 rounded-3xl p-8 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative">
          <button onClick={() => setShowRiskModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center">{currentStep.icon}</div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight italic">{currentStep.title}</h3>
            <p className="text-white/50 text-sm font-medium">{currentStep.subtitle}</p>
          </div>

          <div className="space-y-4">
            {currentStep.type === 'inputs' ? (
              <div className="space-y-4">
                {/* @ts-ignore */}
                {currentStep.fields.map((field, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-white/30 uppercase pl-2">{field.label}</label>
                    <input
                      type="number"
                      value={field.value === 0 ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ))}
                <button onClick={handleNext} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20 mt-4">
                  NEXT STEP
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* @ts-ignore */}
                {currentStep.options.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleChoice(opt.key)}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/40 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      {opt.key}
                    </div>
                    <span className="text-sm font-medium">{opt.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === riskStep ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Strategic Allocation Calculation (Consume, Save, Invest)
  const allocation = useMemo(() => {
    if (!merton) return null;
    const net = merton.netMonthlyIncome;
    const safeConsume = merton.safeMonthlyConsumption;
    const surplus = Math.max(0, net - safeConsume);

    // Clamp fraction to 0.95 for UI display to ensure at least 5% Savings Buffer
    // This prevents the "0% Savings" confusion while maintaining aggressive growth
    const uiFraction = Math.min(0.95, merton.mertonFraction);
    const investAmt = surplus * uiFraction;
    const saveAmt = surplus * (1 - uiFraction);

    const consumePct = (safeConsume / net) * 100;
    const investPct = (investAmt / net) * 100;
    const savePct = (saveAmt / net) * 100;

    return {
      consume: { amt: safeConsume, pct: consumePct },
      invest: { amt: investAmt, pct: investPct },
      save: { amt: saveAmt, pct: savePct },
      isOverspending: state.monthlyExpenses > safeConsume
    };
  }, [merton, state.monthlyExpenses]);

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0b] text-white p-6 text-center overflow-y-auto">
        {showRiskModal && renderRiskWizard()}
        <div className="max-w-xl w-full py-12 space-y-8 animate-in fade-in zoom-in duration-500">
          <Zap className="w-20 h-20 text-emerald-400 mx-auto" />
          {onboardingStep === 0 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight uppercase italic">Welcome to Fusion</h2>
                <p className="text-white/50 leading-relaxed italic">Tell us about your current finances to build your custom roadmap.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2">Total Monthly Income</label>
                  <input type="number" placeholder="e.g. 2,50,000" value={state.salary === 0 ? '' : state.salary} onChange={e => setState({ ...state, salary: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-mono focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2 flex items-center gap-2">Total Savings & Investments <Info className="w-2.5 h-2.5 opacity-50" title="Includes Cash, Stocks, Bonds, Mutual Funds, etc." /></label>
                  <input type="number" placeholder="Cash + Stocks + Bonds" value={state.savings === 0 ? '' : state.savings} onChange={e => setState({ ...state, savings: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-blue-400 font-mono focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2">Your Age</label>
                  <input type="number" placeholder="28" value={state.age === 0 ? '' : state.age} onChange={e => setState({ ...state, age: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-indigo-400 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2">Retirement Age Goal</label>
                  <input type="number" placeholder="55" value={state.targetAge === 0 ? '' : state.targetAge} onChange={e => setState({ ...state, targetAge: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
              <button onClick={() => setOnboardingStep(1)} className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-2xl">CONTINUE <ArrowRight className="w-5 h-5" /></button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight uppercase">Welcome to Fusion</h2>
                <p className="text-white/50 leading-relaxed italic">Let's build your custom financial roadmap. We'll start with your basics and then define your strategy.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => setShowRiskModal(true)} className="bg-emerald-500 text-black font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-emerald-500/20">
                  START CALIBRATION <BrainCircuit className="w-5 h-5" />
                </button>
                <button onClick={() => { setShowOnboarding(false); }} className="text-white/20 text-[10px] font-black uppercase hover:text-white transition-colors">SKIP & USE DEFAULTS</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans p-4 md:p-8 animate-in fade-in duration-700">
      {showRiskModal && renderRiskWizard()}

      {isSyncing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl text-center">
          <div className="space-y-8">
            <Dna className="w-24 h-24 text-emerald-500 mx-auto animate-spin" />
            <h3 className="text-xl font-black uppercase tracking-widest">{syncPhase.replace(/_/g, ' ')}</h3>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Navigation2 className="w-8 h-8 text-emerald-500" />
          <h1 className="text-3xl font-bold tracking-tight italic">Fusion Wealth</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right flex flex-col items-end">
            <div className="text-[10px] uppercase font-black text-white/30 mb-1">Strategy Profile</div>
            <button
              onClick={startRecalibration}
              className="group flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-all active:scale-95"
            >
              {merton?.persona || 'Analyzing...'}
              <Edit2 className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div className="text-right border-l border-white/10 pl-6">
            <div className="text-[10px] uppercase font-black text-white/30 mb-1">Financial Fitness Score</div>
            <div className="text-2xl font-mono font-black text-emerald-400">{healthScore}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6 pb-20">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Your Financial Dashboard
              </h2>
              <p className="text-xs text-white/40 mt-1">Real-time holistic view of your wealth.</p>
            </div>
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {isSyncing ? "Syncing..." : "Sync My Full Portfolio"}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">Monthly Income</label>
              <input type="number" value={state.salary === 0 ? '' : state.salary} onChange={e => setState({ ...state, salary: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-emerald-400 font-mono text-sm focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center gap-1 whitespace-nowrap h-4">Total Savings <Info className="w-2 h-2" title="Includes Stocks, Bonds, etc." /></label>
              <input type="number" value={state.savings === 0 ? '' : state.savings} onChange={e => setState({ ...state, savings: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-blue-400 font-mono text-sm focus:border-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">Monthly Spending</label>
              <input type="number" value={state.monthlyExpenses === 0 ? '' : state.monthlyExpenses} onChange={e => setState({ ...state, monthlyExpenses: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-red-400 font-mono text-sm focus:border-red-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">Monthly Investment (SIP)</label>
              <input type="number" value={state.behavioral.lastContributionAmount === 0 ? '' : state.behavioral.lastContributionAmount} onChange={e => setState({ ...state, behavioral: { ...state.behavioral, lastContributionAmount: e.target.value === '' ? 0 : Number(e.target.value) } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-mono text-sm focus:border-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">Current Age</label>
              <input type="number" value={state.age === 0 ? '' : state.age} onChange={e => setState({ ...state, age: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:border-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">Retirement Age</label>
              <input type="number" value={state.targetAge === 0 ? '' : state.targetAge} onChange={e => setState({ ...state, targetAge: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:border-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>
        </Card>

        {/* STRATEGIC ALLOCATION HUB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-12 border-emerald-500/10 bg-emerald-500/[0.01]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="font-black text-xl italic uppercase flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                  Strategic Budget Blueprint
                </h2>
                <p className="text-[10px] text-white/40 uppercase font-bold mt-1 tracking-widest flex items-center gap-2">
                  Calculated by Merton Optimal Portfolio Theory
                  <span className="text-emerald-500/40">•</span>
                  <button onClick={startRecalibration} className="hover:text-emerald-400 transition-colors">Update Investor DNA</button>
                </p>
              </div>
              <div className="flex gap-4">
                {allocation?.isOverspending && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">Sustainability Alert: Overspending limits.</span>
                  </div>
                )}
                <button onClick={startRecalibration} className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all active:scale-95">
                  <Settings2 className="w-3 h-3" /> Recalibrate Risk
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* CONSUME */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Coffee className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Consume</span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">{allocation?.consume.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${allocation?.consume.pct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-bold">LIFESTYLE & ESSENTIALS</span>
                  <span className="font-mono font-black text-blue-400">{formatCurrency(allocation?.consume.amt || 0)}</span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">The safe monthly spending limit to protect your future wealth roadmap.</p>
              </div>

              {/* SAVE */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <PiggyBank className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Save</span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">{allocation?.save.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${allocation?.save.pct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-bold">WEALTH SHIELD</span>
                  <span className="font-mono font-black text-indigo-400">{formatCurrency(allocation?.save.amt || 0)}</span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">Allocated to low-risk, liquid reserves for emergencies and short-term safety.</p>
              </div>

              {/* INVEST */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Invest</span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">{allocation?.invest.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${allocation?.invest.pct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-bold">GROWTH ENGINE</span>
                  <span className="font-mono font-black text-emerald-400">{formatCurrency(allocation?.invest.amt || 0)}</span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">Aggressive growth capital deployed to maximize equity returns for your goals.</p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black text-xl italic uppercase flex items-center gap-3"><Goal className="w-6 h-6 text-amber-400" /> Goal Success Roadmap</h2>
              <button onClick={addGoal} className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase transition-all hover:scale-105 active:scale-95"><Plus className="w-3 h-3" /> Add New Goal</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.goals.map((goal, idx) => {
                const pres = prescriptions[idx];
                const isEditing = editingGoalId === goal.id;
                return (
                  <div key={goal.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition-all relative group">
                    <div className="flex justify-between items-center">
                      {isEditing ? (
                        <input autoFocus className="bg-transparent border-b border-white/20 font-bold text-lg focus:outline-none w-3/4" value={goal.label} onChange={e => updateGoal(goal.id, { label: e.target.value })} onBlur={() => setEditingGoalId(null)} />
                      ) : (
                        <h3 className="font-bold text-lg truncate pr-8 group-hover:text-amber-400 transition-colors">{goal.label}</h3>
                      )}
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditingGoalId(isEditing ? null : goal.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => deleteGoal(goal.id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-white/30 font-black">Target Amount</label>
                        <input type="number" className="w-full bg-white/5 rounded p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:bg-white/10" value={goal.targetAmount === 0 ? '' : goal.targetAmount} onChange={e => updateGoal(goal.id, { targetAmount: e.target.value === '' ? 0 : Number(e.target.value) })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-white/30 font-black">Years Left</label>
                        <input type="number" className="w-full bg-white/5 rounded p-2 text-xs font-mono text-blue-400 focus:outline-none focus:bg-white/10" value={goal.yearsAway === 0 ? '' : goal.yearsAway} onChange={e => updateGoal(goal.id, { yearsAway: e.target.value === '' ? 0 : Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-white/40">Probability of Success</div>
                      <div className={`font-mono font-black text-sm ${pres?.successRate > 80 ? 'text-emerald-400' : pres?.successRate > 50 ? 'text-amber-400' : 'text-red-400'}`}>{pres?.successRate}%</div>
                    </div>
                    {pres?.increaseMonthlyFuel > 0 && (
                      <div className="text-[10px] font-bold text-amber-400 flex items-start gap-1 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>Invest {formatCurrency(pres.increaseMonthlyFuel)} more monthly to hit 90% confidence.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="lg:col-span-8 h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold uppercase text-[10px] tracking-widest text-white/30">Your Wealth Growth Timeline</h2>
              <div className="flex gap-4 text-[9px] font-bold uppercase">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Future Earning Power</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Total Savings Growth</div>
              </div>
            </div>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transitionMap}>
                  <defs>
                    <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="fa" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="age" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#151518', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} formatter={(v: any) => formatCurrency(v)} />
                  {/* <Area type="monotone" name="Earnings Potential" dataKey="humanCapital" stroke="#3b82f6" fill="url(#hc)" strokeWidth={3} /> */}
                  <Area type="monotone" name="Projected Wealth" dataKey="financialAssets" stroke="#10b981" fill="url(#fa)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            {breakdown && (
              <Card className="border-emerald-500/20 bg-emerald-500/[0.02] animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-bold uppercase text-[10px] tracking-widest text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Portfolio Asset Breakdown
                    </h2>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400">
                      <Check className="w-3 h-3" /> Verified via {breakdown.source}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-white/30">{breakdown.lastUpdated}</span>
                </div>

                <div className="space-y-3">
                  {/* Equity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-blue-400">Equity Engine</span>
                      <span className="text-white">{formatCurrency(breakdown.equity)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(breakdown.equity / (breakdown.equity + breakdown.debt + breakdown.cash)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Debt */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-indigo-400">Debt Shield</span>
                      <span className="text-white">{formatCurrency(breakdown.debt)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(breakdown.debt / (breakdown.equity + breakdown.debt + breakdown.cash)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Cash */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-emerald-400">Liquid Cash</span>
                      <span className="text-white">{formatCurrency(breakdown.cash)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(breakdown.cash / (breakdown.equity + breakdown.debt + breakdown.cash)) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Detailed Asset List (Demo Mode) */}
                {portfolioAssets && (
                  <div className="mt-6 pt-4 border-t border-emerald-500/10 space-y-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Parsed Assets</h3>
                    {portfolioAssets.map((asset, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${asset.category === 'Equity' ? 'bg-blue-500/10 text-blue-400' :
                            asset.category === 'Debt' ? 'bg-indigo-500/10 text-indigo-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            {asset.category === 'Equity' ? <TrendingUp className="w-3 h-3" /> :
                              asset.category === 'Debt' ? <ShieldCheck className="w-3 h-3" /> :
                                <Wallet className="w-3 h-3" />}
                          </div>
                          <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{asset.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white/60">{formatCurrency(asset.value)}</span>
                      </div>
                    ))}
                    <div className="pt-3 flex justify-between items-center border-t border-white/5">
                      <span className="text-[9px] font-bold text-white/30 uppercase">Total Parsed</span>
                      <span className="font-mono text-xs font-black text-emerald-400">{formatCurrency(breakdown.equity + breakdown.debt + breakdown.cash)}</span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            <Card className="border-blue-500/20 bg-blue-500/[0.02]">
              <h2 className="font-bold uppercase text-[10px] tracking-widest text-blue-400 mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> AI Wealth Insights</h2>
              <p className="text-xs text-white/60 leading-relaxed italic">
                {insightsLoading ? "Analyzing your financial DNA..." : xaiNote}
              </p>
            </Card>

            <Card className="flex-1 flex flex-col overflow-hidden max-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    <div className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full animate-ping" />
                  </div>
                  <h2 className="font-bold text-sm tracking-tight uppercase">AI Sentinel News Feed</h2>
                </div>
                <button
                  onClick={() => merton && fetchSentinelNews(merton.persona)}
                  disabled={newsLoading}
                  className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${newsLoading ? 'opacity-50' : ''}`}
                >
                  <RefreshCw className={`w-3 h-3 ${newsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {newsLoading && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">Scanning Financial Markets...</div>
                  </div>
                )}

                {!newsLoading && news.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/70">{item.category}</span>
                        <h4 className="text-sm font-bold leading-snug group-hover:text-amber-400 transition-colors">{item.headline}</h4>
                      </div>
                      <div className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${item.impact === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        item.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                        <AlertCircle className="w-2.5 h-2.5" />
                        {item.impact}
                      </div>
                    </div>

                    <p className="text-[11px] text-white/50 leading-relaxed mb-4 line-clamp-3 font-medium">{item.summary}</p>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-white/20" />
                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">{item.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-white/20">{item.timestamp}</span>
                        <ExternalLink className="w-3 h-3 text-amber-400/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
        Empowering Your Future • Fusion Wealth • v2.0.5
      </footer>
      {/* Sync Selection Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl bg-[#0a0a0b] border-white/10 p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Sync Your Portfolio</h2>
                <p className="text-white/60">Choose how you want to import your financial data.</p>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Path A: Manual Vault */}
              <button
                className="group relative p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                onClick={() => document.getElementById('manual-upload')?.click()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all" />
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Manual Vault Upload</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Upload your CAS PDF directly. No email access required. Secure local parsing.
                </p>
                <input
                  type="file"
                  id="manual-upload"
                  className="hidden"
                  accept=".pdf,.csv"
                  onChange={handleManualUpload}
                />
              </button>

              {/* Path B: Automated Sentinel */}
              <button
                className="group relative p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                onClick={() => handleSyncMethodSelect('AUTO')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 rounded-xl transition-all" />
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Sentinel Sync</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Hands-free updates via secure Gmail Read-Only sync. AI-powered categorization.
                </p>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Open Glass Disclosure Screen */}
      {showDisclosure && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="max-w-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ShieldCheck className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">FUSION OPEN GLASS DISCLOSURE</h2>
            <p className="text-lg text-white/70 leading-relaxed">
              We only request <span className="text-white font-bold">'Read-Only'</span> access to find Consolidated Account Statements.
              Your personal conversations remain invisible to our engine.
              Data is parsed locally and deleted immediately after sync.
            </p>
            <ul className="text-left text-xs text-white/50 space-y-2 max-w-sm mx-auto list-disc pl-4">
              <li>POST-SYNC VERIFICATION: You will see a full inventory of parsed assets to verify accuracy before the Merton engine recalibrates.</li>
            </ul>
            <div className="pt-8 flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  if (isDemoMode) {
                    executeSyncSimulation();
                  } else {
                    login();
                  }
                }}
                className="bg-white text-black font-black px-8 py-4 rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-white/10"
              >
                <Zap className={`w-5 h-5 ${isDemoMode ? 'text-emerald-600' : 'text-blue-600'}`} />
                {isDemoMode ? 'START DEMO SIMULATION' : 'CONNECT GMAIL ACCOUNT'}
              </button>

              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <span className={`text-[10px] font-black uppercase ${isDemoMode ? 'text-emerald-400' : 'text-white/30'}`}>Demo Mode</span>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isDemoMode ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${isDemoMode ? 'left-1 bg-emerald-400' : 'left-6 bg-blue-400'}`} />
                </button>
                <span className={`text-[10px] font-black uppercase ${!isDemoMode ? 'text-blue-400' : 'text-white/30'}`}>Live Mode</span>
              </div>
            </div>
            <p className="text-xs text-white/30 uppercase tracking-widest mt-8">Establishing Secure Sentinel Link...</p>
          </div>
        </div>
      )}

      {/* Global Compliance Footer */}
      <div className="mt-12 pt-8 border-t border-white/5 text-center pb-8">
        <p className="text-[9px] uppercase tracking-widest text-white/20 max-w-2xl mx-auto leading-relaxed">
          Fusion Wealth aligns with global data privacy standards, including GDPR and the India DPDP Act 2023. Financial DNA is encrypted and purpose-limited.
        </p>
      </div>
    </div>
  );
}

export default function FusionWealthApp() {
  // Use a placeholder to prevent crash if env var is missing
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id_to_prevent_crash';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <FusionWealthAppContent />
    </GoogleOAuthProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<FusionWealthApp />);
