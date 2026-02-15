import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  Settings2,
} from 'lucide-react';

/**
 * CONFIGURATION
 */
// AI Client removed in favor of Server-Side MCP Tools

// Core Logic Imports

import { PortfolioImporter } from './src/components/PortfolioImporter';

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
  TransitionPoint,
} from './src/core/types';

/**
 * TYPES & INTERFACES
 */

// Types removed

/**
 * UI COMPONENTS
 */

const Card = ({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#151518] border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);

const TradingTerminal = () => {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(2500);
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [holdings, setHoldings] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [agentToast, setAgentToast] = useState('');
  const [flashActive, setFlashActive] = useState(false);
  const prevHoldingsRef = useRef<string>('');
  const isLocalTradeRef = useRef(false);

  const fetchHoldings = async () => {
    try {
      const res = await fetch('http://localhost:3001/trade/holdings');
      const data = await res.json();
      const newFingerprint = JSON.stringify(data);

      // Detect external (agent) trade: holdings changed but NOT from local UI action
      if (prevHoldingsRef.current && newFingerprint !== prevHoldingsRef.current && !isLocalTradeRef.current) {
        // Find new or changed holdings
        const prevHoldings: any[] = JSON.parse(prevHoldingsRef.current || '[]');
        const newSymbols = data.filter((h: any) => {
          const prev = prevHoldings.find((p: any) => p.symbol === h.symbol);
          return !prev || prev.quantity !== h.quantity;
        });
        if (newSymbols.length > 0) {
          const desc = newSymbols.map((h: any) => h.symbol).join(', ');
          setAgentToast(`🤖 Agent Trade Detected: ${desc}`);
          setFlashActive(true);
          setTimeout(() => setAgentToast(''), 5000);
          setTimeout(() => setFlashActive(false), 1500);
        }
      }
      isLocalTradeRef.current = false;
      prevHoldingsRef.current = newFingerprint;
      setHoldings(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHoldings();
    const interval = setInterval(fetchHoldings, 3000); // Fast sync for demo
    return () => clearInterval(interval);
  }, []);

  const executeTrade = async () => {
    try {
      isLocalTradeRef.current = true; // Mark as local trade to suppress agent toast
      const res = await fetch('http://localhost:3001/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, quantity, price, action }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.success) fetchHoldings();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Trade Failed');
    }
  };

  return (
    <Card className={`border-purple-500/20 bg-purple-500/[0.02] transition-all duration-500 ${flashActive ? 'ring-2 ring-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.3)]' : ''}`}>
      {/* Agent Trade Toast */}
      {agentToast && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-2 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          {agentToast}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold uppercase text-[10px] tracking-widest text-purple-400 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Paper Trading Agent
        </h2>
        <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase text-purple-400">
          Simulated
        </div>
        <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
          <select
            className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50"
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
          >
            <option value="BUY" className="bg-[#151518]">
              BUY
            </option>
            <option value="SELL" className="bg-[#151518]">
              SELL
            </option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <input
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <button
          onClick={executeTrade}
          className={`w-full py-2 rounded-lg font-bold text-xs ${action === 'BUY' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors shadow-lg`}
        >
          EXECUTE {action}
        </button>
        {message && (
          <p className="text-[10px] text-white/50 text-center animate-pulse">
            {message}
          </p>
        )}

        <div className="border-t border-white/5 pt-4">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
            Current Holdings
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
            {holdings.length === 0 && (
              <p className="text-[10px] text-white/20 italic text-center">
                No open positions.
              </p>
            )}
            {holdings.map((h: any, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5"
              >
                <span className="text-[10px] font-bold text-white">
                  {h.symbol}
                </span>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-400 font-mono">
                    {h.quantity} Q
                  </div>
                  <div className="text-[8px] text-white/30 font-mono">
                    Avg: {h.avgPrice.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

function FusionWealthAppContent() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskStep, setRiskStep] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPhase, setSyncPhase] = useState<string>('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [syncMethod, setSyncMethod] = useState<'MANUAL' | 'AUTO' | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [breakdown, setBreakdown] = useState<PortfolioBreakdown | null>(null);
  const [portfolioAssets, setPortfolioAssets] = useState<
    PortfolioAsset[] | null
  >(null);
  // Default to demo mode implicitly, no toggle needed anymore

  const lastPersonaRef = useRef<string | null>(null);
  const calcIdRef = useRef<number>(0);

  const [state, setState] = useState<PortfolioState>({
    age: 0,
    salary: 0,
    savings: 0,
    riskAnswers: {
      midnightTest: null,
      choiceOfPaths: null,
      safetyNet: null,
      goalHorizon: null,
    },
    targetAge: 0,
    monthlyExpenses: 0,
    behavioral: {
      streak: 0,
      lastContributionAmount: 0,
      monthlyExpenses: 0,
      contributionConsistency: 0,
    },
    goals: [
      {
        id: '1',
        label: 'Dream Home',
        type: 'Housing',
        targetAmount: 25000000,
        yearsAway: 12,
        inflationRate: 0.06,
      },
      {
        id: '2',
        label: "Kid's Education",
        type: 'Education',
        targetAmount: 12000000,
        yearsAway: 15,
        inflationRate: 0.1,
      },
    ],
  });

  const [marketMetrics, setMarketMetrics] = useState<{
    mu: number;
    sigma: number;
  }>({ mu: 0.1, sigma: 0.18 });
  const [macroMetrics, setMacroMetrics] = useState<any>(null);

  // Derived state is now calculated via useMemo, not useState
  // const [merton, setMerton] = useState<MertonOutput | null>(null);
  // const [transitionMap, setTransitionMap] = useState<TransitionPoint[]>([]);
  // const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  // const [healthScore, setHealthScore] = useState(0);

  const [xaiNote, setXaiNote] = useState<string>('');
  // const [loading, setLoading] = useState(false); // No longer needed for sync calc
  const [newsLoading, setNewsLoading] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  // SERVER-SIDE STRATEGY CALCULATION
  const [strategyResult, setStrategyResult] = useState<any>(null); // Use loose typing for now or define interface

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const response = await fetch('http://localhost:3001/strategy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state,
            portfolioAssets,
          }),
        });
        const data = await response.json();
        if (data.error) {
          console.error('Strategy Error:', data.error);
          return;
        }
        setStrategyResult(data);
        // Update local market metrics if returned
        if (data.marketMetrics) {
          setMarketMetrics(data.marketMetrics);
        }
        if (data.macroMetrics) {
          setMacroMetrics(data.macroMetrics);
        }
      } catch (e) {
        console.error('Failed to fetch strategy:', e);
      }
    };

    // Debounce logic could be added here
    const timeoutId = setTimeout(() => fetchStrategy(), 500);
    return () => clearTimeout(timeoutId);
  }, [state, portfolioAssets]);
  const fetchWealthInsights = async (
    currentState: PortfolioState,
    mertonOutput: MertonOutput,
    score: number,
  ) => {
    if (insightsLoading) return;
    setInsightsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: mertonOutput.persona,
          monthlyIncome: formatCurrency(currentState.salary),
          totalSavings: formatCurrency(currentState.savings),
          monthlyBurn: formatCurrency(currentState.monthlyExpenses),
          healthScore: score,
        }),
      });

      const data = await response.json();
      if (data.insight) setXaiNote(data.insight);
    } catch (e) {
      console.error('Insights Error (MCP):', e);
      setXaiNote(
        `Financial Roadmap Updated. Based on your "${mertonOutput.persona}" profile, your savings plan is looking healthy.`,
      );
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchSentinelNews = async (persona: string) => {
    if (newsLoading) return;
    setNewsLoading(true);
    try {
      // Connect to MCP Server (HTTP Bridge)
      const response = await fetch(
        `http://localhost:3001/news?persona=${encodeURIComponent(persona)}`,
      );
      const items = await response.json();

      if (items && items.length > 0) {
        setNews(items);
        lastPersonaRef.current = persona;
      }
    } catch (e) {
      console.error('Sentinel Feed Error (MCP):', e);
      // Fallback
      if (news.length === 0) {
        setNews([
          {
            headline: 'MCP Server Disconnected',
            source: 'System',
            url: '#',
            category: 'Error',
            sentiment: 'neutral',
            impact: 'High',
            summary:
              'Could not fetch live news. Please ensure the Fusion Wealth MCP Server is running on port 3001.',
            timestamp: 'Now',
          },
        ]);
      }
    } finally {
      setNewsLoading(false);
    }
  };

  const { merton, transitionMap, prescriptions, healthScore } =
    strategyResult || {
      merton: {
        humanCapital: 0,
        mertonFraction: 0.5,
        safeMonthlyConsumption: 0,
        savingsRequirement: 0,
        persona: 'Initializing...',
        netMonthlyIncome: 0,
        taxLeakage: 0,
      },
      transitionMap: [],
      prescriptions: [],
      healthScore: 0,
    };

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
    setSyncPhase('CONNECTING_BANK_ACCOUNTS');
    await new Promise((r) => setTimeout(r, 1000));
    setSyncPhase('AGGREGATING_BROKERAGE_DATA');
    await new Promise((r) => setTimeout(r, 1200));
    setSyncPhase('ANALYZING_STOCKS_AND_BONDS');
    await new Promise((r) => setTimeout(r, 800));
    setSyncPhase('FINALIZING_CONSOLIDATED_NW');
    await new Promise((r) => setTimeout(r, 1500));

    const newSavings = 4200000;
    const nextState = { ...state, savings: newSavings };
    setState(nextState);

    setState(nextState);

    // Always run demo assets simulation
    const demoAssets: PortfolioAsset[] = [
      { name: 'Nifty 50 Index Fund', value: 1850000, category: 'Equity' },
      { name: 'Bluechip Alpha Stocks', value: 964000, category: 'Equity' },
      { name: 'Corporate Bond Fund', value: 1092000, category: 'Debt' },
      { name: 'Liquid Savings', value: 294000, category: 'Cash' },
    ];
    setPortfolioAssets(demoAssets);

    setBreakdown({
      equity: 2814000,
      debt: 1092000,
      cash: 294000,
      lastUpdated: new Date().toLocaleDateString(),
      source: 'Sentinel Sync',
    });

    setSyncPhase('MAPPING_FUTURE');
    // No need to call calculateEverything, state update triggers useMemo
    // await calculateEverything(nextState);

    setXaiNote(
      `[Sync Successful] Investment data updated. Your total savings & investments now reflect ${formatCurrency(newSavings)}.`,
    );
    setIsSyncing(false);
    setSyncPhase('');
    setShowSyncModal(false);
    setShowDisclosure(false);
    setSyncMethod(null);
    setManualFile(null);
  };

  const handleSyncClick = () => {
    setShowSyncModal(true);
  };

  const handleSyncMethodSelect = (method: 'MANUAL' | 'AUTO') => {
    setSyncMethod(method);
    if (method === 'AUTO') {
      setShowSyncModal(false);
      // Auto now just triggers simulation directly
      executeSyncSimulation();
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
      inflationRate: 0.07,
    };
    setState((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
    setEditingGoalId(newGoal.id);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
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
        title: 'Financial Health',
        subtitle: "Let's establish your baseline cash flow.",
        fields: [
          {
            label: 'Monthly Income',
            value: state.salary,
            onChange: (v: number) => setState((s) => ({ ...s, salary: v })),
          },
          {
            label: 'Monthly Spending',
            value: state.monthlyExpenses,
            onChange: (v: number) =>
              setState((s) => ({ ...s, monthlyExpenses: v })),
          },
        ],
      },
      {
        type: 'inputs',
        id: 'assets',
        icon: <PiggyBank className="w-10 h-10 text-blue-400" />,
        title: 'Assets & Growth',
        subtitle: 'Your current wealth snapshot.',
        fields: [
          {
            label: 'Total Savings',
            value: state.savings,
            onChange: (v: number) => setState((s) => ({ ...s, savings: v })),
          },
          {
            label: 'Monthly SIP',
            value: state.behavioral.lastContributionAmount,
            onChange: (v: number) =>
              setState((s) => ({
                ...s,
                behavioral: { ...s.behavioral, lastContributionAmount: v },
              })),
          },
        ],
      },
      {
        type: 'inputs',
        id: 'timeline',
        icon: <Clock className="w-10 h-10 text-indigo-400" />,
        title: 'Your Timeline',
        subtitle: 'Time is the most critical factor.',
        fields: [
          {
            label: 'Current Age',
            value: state.age,
            onChange: (v: number) => setState((s) => ({ ...s, age: v })),
          },
          {
            label: 'Retirement Age',
            value: state.targetAge,
            onChange: (v: number) => setState((s) => ({ ...s, targetAge: v })),
          },
        ],
      },
      {
        type: 'choice',
        id: 'midnightTest',
        icon: <Moon className="w-10 h-10 text-indigo-400" />,
        title: 'The Sleep-at-Night Test',
        subtitle:
          'If your investments dropped 20% tomorrow, how would you feel?',
        options: [
          { key: 'A', text: "Very anxious—I'd want to withdraw immediately." },
          {
            key: 'B',
            text: "Concerned, but I'd wait and see for a few weeks.",
          },
          {
            key: 'C',
            text: 'Not worried; markets always bounce back eventually.',
          },
          {
            key: 'D',
            text: "Excited! It's a great time to buy more at a discount.",
          },
        ],
      },
      {
        type: 'choice',
        id: 'choiceOfPaths',
        icon: <Map className="w-10 h-10 text-emerald-400" />,
        title: 'Your Preferred Journey',
        subtitle: 'What kind of investment growth are you looking for?',
        options: [
          { key: 'A', text: 'Low risk: Slow but steady 5-6% growth.' },
          { key: 'B', text: 'Balanced: Moderate risk with 10-12% growth.' },
          { key: 'C', text: 'High growth: Higher risk with 15%+ potential.' },
        ],
      },
      {
        type: 'choice',
        id: 'safetyNet',
        icon: <ShieldAlert className="w-10 h-10 text-amber-400" />,
        title: 'Your Emergency Fund',
        subtitle:
          'How many months could you support yourself if you lost your job today?',
        options: [
          { key: 'A', text: 'Less than 1 month' },
          { key: 'B', text: '1 to 3 months' },
          { key: 'C', text: '3 to 6 months' },
          { key: 'D', text: 'More than 6 months' },
        ],
      },
      {
        type: 'choice',
        id: 'goalHorizon',
        icon: <Clock className="w-10 h-10 text-blue-400" />,
        title: 'Your Time Horizon',
        subtitle: 'How soon do you need to start using your primary savings?',
        options: [
          { key: 'A', text: 'Within the next 3 years' },
          { key: 'B', text: 'In 3 to 10 years' },
          { key: 'C', text: 'More than 10 years from now' },
        ],
      },
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
          <button
            onClick={() => setShowRiskModal(false)}
            className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center">{currentStep.icon}</div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight italic">
              {currentStep.title}
            </h3>
            <p className="text-white/50 text-sm font-medium">
              {currentStep.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {currentStep.type === 'inputs' ? (
              <div className="space-y-4">
                {/* @ts-ignore */}
                {currentStep.fields.map((field, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-white/30 uppercase pl-2">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? 0 : Number(e.target.value),
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ))}
                <button
                  onClick={handleNext}
                  className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20 mt-4"
                >
                  NEXT STEP
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* @ts-ignore */}
                {currentStep.options.map((opt) => (
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
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === riskStep ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`}
              />
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
      isOverspending: state.monthlyExpenses > safeConsume,
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
                <h2 className="text-4xl font-black tracking-tight uppercase italic">
                  Welcome to Fusion
                </h2>
                <p className="text-white/50 leading-relaxed italic">
                  Tell us about your current finances to build your custom
                  roadmap.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2">
                    Total Monthly Income
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2,50,000"
                    value={state.salary === 0 ? '' : state.salary}
                    onChange={(e) =>
                      setState({
                        ...state,
                        salary:
                          e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-mono focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2 flex items-center gap-2">
                    Total Savings & Investments{' '}
                    <Info
                      className="w-2.5 h-2.5 opacity-50"
                      title="Includes Cash, Stocks, Bonds, Mutual Funds, etc."
                    />
                  </label>
                  <input
                    type="number"
                    placeholder="Cash + Stocks + Bonds"
                    value={state.savings === 0 ? '' : state.savings}
                    onChange={(e) =>
                      setState({
                        ...state,
                        savings:
                          e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-blue-400 font-mono focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2">
                    Your Age
                  </label>
                  <input
                    type="number"
                    placeholder="28"
                    value={state.age === 0 ? '' : state.age}
                    onChange={(e) =>
                      setState({
                        ...state,
                        age: e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-indigo-400 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase pl-2">
                    Retirement Age Goal
                  </label>
                  <input
                    type="number"
                    placeholder="55"
                    value={state.targetAge === 0 ? '' : state.targetAge}
                    onChange={(e) =>
                      setState({
                        ...state,
                        targetAge:
                          e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setOnboardingStep(1)}
                className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-2xl"
              >
                CONTINUE <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight uppercase">
                  Welcome to Fusion
                </h2>
                <p className="text-white/50 leading-relaxed italic">
                  Let's build your custom financial roadmap. We'll start with
                  your basics and then define your strategy.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowRiskModal(true)}
                  className="bg-emerald-500 text-black font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-emerald-500/20"
                >
                  START CALIBRATION <BrainCircuit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowOnboarding(false);
                  }}
                  className="text-white/20 text-[10px] font-black uppercase hover:text-white transition-colors"
                >
                  SKIP & USE DEFAULTS
                </button>
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
            <h3 className="text-xl font-black uppercase tracking-widest">
              {syncPhase.replace(/_/g, ' ')}
            </h3>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Navigation2 className="w-8 h-8 text-emerald-500" />
          <h1 className="text-3xl font-bold tracking-tight italic">
            Fusion Wealth
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right flex flex-col items-end">
            <div className="text-[10px] uppercase font-black text-white/30 mb-1">
              Strategy Profile
            </div>
            <button
              onClick={startRecalibration}
              className="group flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-all active:scale-95"
            >
              {merton?.persona || 'Analyzing...'}
              <Edit2 className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div className="text-right border-l border-white/10 pl-6">
            <div className="text-[10px] uppercase font-black text-white/30 mb-1">
              Financial Fitness Score
            </div>
            <div className="text-2xl font-mono font-black text-emerald-400">
              {healthScore}
            </div>
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
              <p className="text-xs text-white/40 mt-1">
                Real-time holistic view of your wealth.
              </p>
            </div>
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync My Full Portfolio'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">
                Monthly Income
              </label>
              <input
                type="number"
                value={state.salary === 0 ? '' : state.salary}
                onChange={(e) =>
                  setState({
                    ...state,
                    salary: e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-emerald-400 font-mono text-sm focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center gap-1 whitespace-nowrap h-4">
                Total Savings{' '}
                <Info
                  className="w-2 h-2"
                  title="Includes Stocks, Bonds, etc."
                />
              </label>
              <input
                type="number"
                value={state.savings === 0 ? '' : state.savings}
                onChange={(e) =>
                  setState({
                    ...state,
                    savings: e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-blue-400 font-mono text-sm focus:border-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">
                Monthly Spending
              </label>
              <input
                type="number"
                value={state.monthlyExpenses === 0 ? '' : state.monthlyExpenses}
                onChange={(e) =>
                  setState({
                    ...state,
                    monthlyExpenses:
                      e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-red-400 font-mono text-sm focus:border-red-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">
                Monthly Investment (SIP)
              </label>
              <input
                type="number"
                value={
                  state.behavioral.lastContributionAmount === 0
                    ? ''
                    : state.behavioral.lastContributionAmount
                }
                onChange={(e) =>
                  setState({
                    ...state,
                    behavioral: {
                      ...state.behavioral,
                      lastContributionAmount:
                        e.target.value === '' ? 0 : Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-mono text-sm focus:border-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">
                Current Age
              </label>
              <input
                type="number"
                value={state.age === 0 ? '' : state.age}
                onChange={(e) =>
                  setState({
                    ...state,
                    age: e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:border-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-white/30 flex items-center h-4">
                Retirement Age
              </label>
              <input
                type="number"
                value={state.targetAge === 0 ? '' : state.targetAge}
                onChange={(e) =>
                  setState({
                    ...state,
                    targetAge:
                      e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:border-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
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
                  <button
                    onClick={startRecalibration}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Update Investor DNA
                  </button>
                </p>
              </div>
              <div className="flex gap-4">
                {allocation?.isOverspending && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">
                      Sustainability Alert: Overspending limits.
                    </span>
                  </div>
                )}
                <button
                  onClick={startRecalibration}
                  className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all active:scale-95"
                >
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
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Consume
                    </span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {allocation?.consume.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${allocation?.consume.pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-bold">
                    LIFESTYLE & ESSENTIALS
                  </span>
                  <span className="font-mono font-black text-blue-400">
                    {formatCurrency(allocation?.consume.amt || 0)}
                  </span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">
                  The safe monthly spending limit to protect your future wealth
                  roadmap.
                </p>
              </div>

              {/* SAVE */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <PiggyBank className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Save
                    </span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {allocation?.save.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${allocation?.save.pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-bold">WEALTH SHIELD</span>
                  <span className="font-mono font-black text-indigo-400">
                    {formatCurrency(allocation?.save.amt || 0)}
                  </span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">
                  Allocated to low-risk, liquid reserves for emergencies and
                  short-term safety.
                </p>
              </div>

              {/* INVEST */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Invest
                    </span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {allocation?.invest.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${allocation?.invest.pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-bold">GROWTH ENGINE</span>
                  <span className="font-mono font-black text-emerald-400">
                    {formatCurrency(allocation?.invest.amt || 0)}
                  </span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">
                  Aggressive growth capital deployed to maximize equity returns
                  for your goals.
                </p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black text-xl italic uppercase flex items-center gap-3">
                <Goal className="w-6 h-6 text-amber-400" /> Goal Success Roadmap
              </h2>
              <button
                onClick={addGoal}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-3 h-3" /> Add New Goal
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.goals.map((goal, idx) => {
                const pres = prescriptions[idx];
                const isEditing = editingGoalId === goal.id;
                return (
                  <div
                    key={goal.id}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition-all relative group"
                  >
                    <div className="flex justify-between items-center">
                      {isEditing ? (
                        <input
                          autoFocus
                          className="bg-transparent border-b border-white/20 font-bold text-lg focus:outline-none w-3/4"
                          value={goal.label}
                          onChange={(e) =>
                            updateGoal(goal.id, { label: e.target.value })
                          }
                          onBlur={() => setEditingGoalId(null)}
                        />
                      ) : (
                        <h3 className="font-bold text-lg truncate pr-8 group-hover:text-amber-400 transition-colors">
                          {goal.label}
                        </h3>
                      )}
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setEditingGoalId(isEditing ? null : goal.id)
                          }
                          className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-white/30 font-black">
                          Target Amount
                        </label>
                        <input
                          type="number"
                          className="w-full bg-white/5 rounded p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:bg-white/10"
                          value={
                            goal.targetAmount === 0 ? '' : goal.targetAmount
                          }
                          onChange={(e) =>
                            updateGoal(goal.id, {
                              targetAmount:
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-white/30 font-black">
                          Years Left
                        </label>
                        <input
                          type="number"
                          className="w-full bg-white/5 rounded p-2 text-xs font-mono text-blue-400 focus:outline-none focus:bg-white/10"
                          value={goal.yearsAway === 0 ? '' : goal.yearsAway}
                          onChange={(e) =>
                            updateGoal(goal.id, {
                              yearsAway:
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-white/40">
                        Probability of Success
                      </div>
                      <div
                        className={`font-mono font-black text-sm ${pres?.successRate > 80 ? 'text-emerald-400' : pres?.successRate > 50 ? 'text-amber-400' : 'text-red-400'}`}
                      >
                        {pres?.successRate}%
                      </div>
                    </div>
                    {pres?.increaseMonthlyFuel > 0 && (
                      <div className="text-[10px] font-bold text-amber-400 flex items-start gap-1 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>
                          Invest {formatCurrency(pres.increaseMonthlyFuel)} more
                          monthly to hit 90% confidence.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="lg:col-span-8 h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold uppercase text-[10px] tracking-widest text-white/30">
                Your Wealth Growth Timeline
              </h2>
              <div className="flex gap-4 text-[9px] font-bold uppercase">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Future
                  Earning Power
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Total
                  Savings Growth
                </div>
              </div>
            </div>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transitionMap}>
                  <defs>
                    <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff05"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="age"
                    stroke="#ffffff20"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151518',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                    }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  {/* <Area type="monotone" name="Earnings Potential" dataKey="humanCapital" stroke="#3b82f6" fill="url(#hc)" strokeWidth={3} /> */}
                  <Area
                    type="monotone"
                    name="Projected Wealth"
                    dataKey="financialAssets"
                    stroke="#10b981"
                    fill="url(#fa)"
                    strokeWidth={3}
                  />
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
                      <ShieldCheck className="w-4 h-4" /> Portfolio Asset
                      Breakdown
                    </h2>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400">
                      <Check className="w-3 h-3" /> Verified via{' '}
                      {breakdown.source}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-white/30">
                    {breakdown.lastUpdated}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Equity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-blue-400">Equity Engine</span>
                      <span className="text-white">
                        {formatCurrency(breakdown.equity)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(breakdown.equity / (breakdown.equity + breakdown.debt + breakdown.cash)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Debt */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-indigo-400">Debt Shield</span>
                      <span className="text-white">
                        {formatCurrency(breakdown.debt)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{
                          width: `${(breakdown.debt / (breakdown.equity + breakdown.debt + breakdown.cash)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cash */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-emerald-400">Liquid Cash</span>
                      <span className="text-white">
                        {formatCurrency(breakdown.cash)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${(breakdown.cash / (breakdown.equity + breakdown.debt + breakdown.cash)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detailed Asset List (Demo Mode) */}
                {portfolioAssets && (
                  <div className="mt-6 pt-4 border-t border-emerald-500/10 space-y-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">
                      Parsed Assets
                    </h3>
                    {portfolioAssets.map((asset, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${asset.category === 'Equity'
                              ? 'bg-blue-500/10 text-blue-400'
                              : asset.category === 'Debt'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                              }`}
                          >
                            {asset.category === 'Equity' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : asset.category === 'Debt' ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <Wallet className="w-3 h-3" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                            {asset.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white/60">
                          {formatCurrency(asset.value)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 flex justify-between items-center border-t border-white/5">
                      <span className="text-[9px] font-bold text-white/30 uppercase">
                        Total Parsed
                      </span>
                      <span className="font-mono text-xs font-black text-emerald-400">
                        {formatCurrency(
                          breakdown.equity + breakdown.debt + breakdown.cash,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {macroMetrics && (
              <Card className="border-pink-500/20 bg-pink-500/[0.02]">
                <h2 className="font-bold uppercase text-[10px] tracking-widest text-pink-400 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Real-Time Macro Analyst
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-[8px] uppercase text-white/40 font-bold">
                      Inflation
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      {macroMetrics.inflation}%
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-[8px] uppercase text-white/40 font-bold">
                      India GDP
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {macroMetrics.gdpGrowth}%
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-[8px] uppercase text-white/40 font-bold">
                      10Y Bond
                    </div>
                    <div className="text-sm font-mono font-bold text-amber-400">
                      {macroMetrics.bondYield10Y}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-white/20 uppercase tracking-widest text-right flex justify-between">
                  <span>Risk-Free Rate: {macroMetrics.bondYield10Y}%</span>
                  <span>Live from Fusion-MCP</span>
                </div>
              </Card>
            )}

            <Card className="border-blue-500/20 bg-blue-500/[0.02]">
              <h2 className="font-bold uppercase text-[10px] tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> AI Wealth Insights
              </h2>
              <p className="text-xs text-white/60 leading-relaxed italic">
                {insightsLoading ? 'Analyzing your financial DNA...' : xaiNote}
              </p>
            </Card>

            <TradingTerminal />

            <Card className="flex-1 flex flex-col overflow-hidden max-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    <div className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full animate-ping" />
                  </div>
                  <h2 className="font-bold text-sm tracking-tight uppercase">
                    AI Sentinel News Feed
                  </h2>
                </div>
                <button
                  onClick={() => merton && fetchSentinelNews(merton.persona)}
                  disabled={newsLoading}
                  className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${newsLoading ? 'opacity-50' : ''}`}
                >
                  <RefreshCw
                    className={`w-3 h-3 ${newsLoading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {newsLoading && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">
                      Scanning Financial Markets...
                    </div>
                  </div>
                )}

                {!newsLoading &&
                  news.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/70">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold leading-snug group-hover:text-amber-400 transition-colors">
                            {item.headline}
                          </h4>
                        </div>
                        <div
                          className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${item.impact === 'High'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : item.impact === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                        >
                          <AlertCircle className="w-2.5 h-2.5" />
                          {item.impact}
                        </div>
                      </div>

                      <p className="text-[11px] text-white/50 leading-relaxed mb-4 line-clamp-3 font-medium">
                        {item.summary}
                      </p>

                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-white/20" />
                          <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                            {item.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-white/20">
                            {item.timestamp}
                          </span>
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  Sync Your Portfolio
                </h2>
                <p className="text-white/60">
                  Choose how you want to import your financial data.
                </p>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Path A: Manual Vault */}
              <button
                className="group relative p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                onClick={() =>
                  document.getElementById('manual-upload')?.click()
                }
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all" />
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Manual Vault Upload
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Upload your CAS PDF directly. No email access required. Secure
                  local parsing.
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
                <h3 className="text-lg font-bold text-white mb-2">
                  Automated Sentinel Sync
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Hands-free updates via secure Gmail Read-Only sync. AI-powered
                  categorization.
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
            <h2 className="text-2xl font-bold text-white tracking-tight">
              FUSION OPEN GLASS DISCLOSURE
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              We only request{' '}
              <span className="text-white font-bold">'Read-Only'</span> access
              to find Consolidated Account Statements. Your personal
              conversations remain invisible to our engine. Data is parsed
              locally and deleted immediately after sync.
            </p>
            <ul className="text-left text-xs text-white/50 space-y-2 max-w-sm mx-auto list-disc pl-4">
              <li>
                POST-SYNC VERIFICATION: You will see a full inventory of parsed
                assets to verify accuracy before the Merton engine recalibrates.
              </li>
            </ul>
            <div className="pt-8 flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  executeSyncSimulation();
                }}
                className="bg-white text-black font-black px-8 py-4 rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-white/10"
              >
                <Zap className="w-5 h-5 text-emerald-600" />
                START SIMULATION
              </button>

              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <span className="text-[10px] font-black uppercase text-emerald-400">
                  Demo Mode
                </span>
              </div>
            </div>
            <p className="text-xs text-white/30 uppercase tracking-widest mt-8">
              Establishing Secure Sentinel Link...
            </p>
          </div>
        </div>
      )}

      {/* PORTFOLIO IMPORTER MODAL */}
      {showSyncModal && (
        <PortfolioImporter
          onClose={() => setShowSyncModal(false)}
          onImportSuccess={(assets, breakdown) => {
            setPortfolioAssets(assets);
            setBreakdown(breakdown);

            // Calculate total savings from assets
            const totalWealth =
              breakdown.equity + breakdown.debt + breakdown.cash;
            setState((prev) => ({ ...prev, savings: totalWealth }));

            // Trigger recalculation logic or state updates as needed
            setXaiNote(
              'Portfolio Imported Successfully. Wealth projection updated based on verified assets.',
            );
            setShowSyncModal(false);
          }}
        />
      )}
      <div className="mt-12 pt-8 border-t border-white/5 text-center pb-8">
        <p className="text-[9px] uppercase tracking-widest text-white/20 max-w-2xl mx-auto leading-relaxed">
          Fusion Wealth aligns with global data privacy standards, including
          GDPR and the India DPDP Act 2023. Financial DNA is encrypted and
          purpose-limited.
        </p>
      </div>
    </div>
  );
}

export default function FusionWealthApp() {
  return <FusionWealthAppContent />;
}

const root = createRoot(document.getElementById('root')!);
root.render(<FusionWealthApp />);
