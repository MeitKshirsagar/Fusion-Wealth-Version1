export interface NewsItem {
  headline: string;
  source: string;
  url: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'Low' | 'Medium' | 'High';
  summary: string;
  timestamp: string;
}

export interface FinancialGoal {
  id: string;
  label: string;
  type: 'Housing' | 'Education' | 'Legacy' | 'Retirement';
  targetAmount: number;
  yearsAway: number;
  inflationRate: number;
}

export interface RiskAnswers {
  midnightTest: 'A' | 'B' | 'C' | 'D' | null;
  choiceOfPaths: 'A' | 'B' | 'C' | null;
  safetyNet: 'A' | 'B' | 'C' | 'D' | null;
  goalHorizon: 'A' | 'B' | 'C' | null;
}

export interface BehavioralStats {
  streak: number;
  lastContributionAmount: number;
  monthlyExpenses: number;
  contributionConsistency: number;
}

export interface PortfolioState {
  age: number;
  salary: number; // Monthly Gross
  savings: number;
  riskAnswers: RiskAnswers;
  targetAge: number;
  monthlyExpenses: number;
  behavioral: BehavioralStats;
  goals: FinancialGoal[];
}

export interface PortfolioBreakdown {
  equity: number;
  debt: number;
  cash: number;
  lastUpdated: string;
  source: 'Manual' | 'Sentinel Sync';
}

export interface TransitionPoint {
  age: number;
  humanCapital: number;
  financialAssets: number;
}

export interface PortfolioAsset {
  name: string;
  value: number;
  category: 'Equity' | 'Debt' | 'Cash';
}

export interface MertonOutput {
  humanCapital: number;
  mertonFraction: number;
  safeMonthlyConsumption: number;
  savingsRequirement: number;
  persona: string;
  netMonthlyIncome: number;
  taxLeakage: number;
}

export interface Prescription {
  goalId: string;
  successRate: number;
  increaseMonthlyFuel: number;
  adjustTimelineMonths: number;
  futureTarget: number;
}

export interface MonteCarloPoint {
  month: number;
  median: number;
  p10: number;
  p90: number;
}
