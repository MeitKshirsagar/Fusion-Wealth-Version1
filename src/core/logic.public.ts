import {
    MertonOutput,
    PortfolioState,
    RiskAnswers,
    NewsItem,
    PortfolioAsset,
    Prescription,
    FinancialGoal
} from './types';

export class TaxEngine {
    static calculate(monthlyGross: number): { netMonthly: number; taxMonthly: number } {
        // Mock Tax Calculation: ~30% tax assumed
        const annualGross = monthlyGross * 12;
        return { netMonthly: (monthlyGross * 0.7), taxMonthly: (monthlyGross * 0.3) };
    }
}

export class GoalEngine {
    static calculateGoalGap(goal: FinancialGoal, currentSipAllocated: number, expectedReturn: number): Prescription {
        // Mock Goal Calculation
        return {
            goalId: goal.id,
            successRate: 75, // Flat mock success rate
            increaseMonthlyFuel: 5000,
            adjustTimelineMonths: 0,
            futureTarget: goal.targetAmount * 1.5
        };
    }
}

export class MertonEngine {
    static calculate(state: PortfolioState, mu: number, sigma: number): MertonOutput {
        // Mock Merton Output
        return {
            humanCapital: state.salary * 12 * 20, // Simple multiplier
            mertonFraction: 0.6, // Balanced allocation
            safeMonthlyConsumption: state.salary * 0.5,
            savingsRequirement: state.salary * 0.2,
            persona: "Balanced Guardian",
            netMonthlyIncome: state.salary * 0.7,
            taxLeakage: state.salary * 0.3
        };
    }

    static calculateGamma(answers: RiskAnswers): number {
        return 5; // Default middle-risk score
    }

    static getPersona(gamma: number): string {
        return "Balanced Guardian";
    }
}

export class SentimentEngine {
    static calculate(newsItems: NewsItem[]): number {
        // Always neutral sentiment for public shell
        return 0;
    }
}

export class FactorEngine {
    static calculate(persona: string, portfolioAssets: PortfolioAsset[] | null): number {
        // Mock Quality Score
        return 85;
    }
}
