import {
  MertonOutput,
  PortfolioState,
  RiskAnswers,
  MonteCarloPoint,
} from '../types';
import { TaxEngine } from './TaxEngine';

export class MertonEngine {
  static runMonteCarlo(
    currentWealth: number,
    years: number,
    mu: number,
    sigma: number,
    monthlyContribution: number,
  ): MonteCarloPoint[] {
    const SIMULATIONS = 1000;
    const months = years * 12;
    const dt = 1 / 12;
    const results: number[][] = Array.from({ length: months }, () => []);

    for (let sim = 0; sim < SIMULATIONS; sim++) {
      let wealth = currentWealth;
      for (let i = 0; i < months; i++) {
        // Standard normal approximation
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        const growth = wealth * (mu * dt + sigma * z * Math.sqrt(dt));
        wealth += growth + monthlyContribution;
        results[i].push(wealth);
      }
    }

    return results.map((monthSims, idx) => {
      monthSims.sort((a, b) => a - b);
      return {
        month: idx + 1,
        median: monthSims[Math.floor(monthSims.length * 0.5)],
        p10: monthSims[Math.floor(monthSims.length * 0.1)],
        p90: monthSims[Math.floor(monthSims.length * 0.9)],
      };
    });
  }

  static calculate(
    state: PortfolioState,
    mu: number,
    sigma: number,
    r: number = 0.04,
  ): MertonOutput {
    const { netMonthly, taxMonthly } = TaxEngine.calculate(state.salary);
    const gamma = this.calculateGamma(state.riskAnswers);
    const yearsToRetirement = Math.max(1, state.targetAge - state.age);
    let safetyNetMultiplier = 1.0;
    if (state.riskAnswers.safetyNet === 'A') safetyNetMultiplier = 0.7;
    else if (state.riskAnswers.safetyNet === 'B') safetyNetMultiplier = 0.85;
    else if (state.riskAnswers.safetyNet === 'D') safetyNetMultiplier = 1.2;

    const humanCapital =
      netMonthly *
      12 *
      ((1 - Math.pow(1 + r, -yearsToRetirement)) / r) *
      safetyNetMultiplier;

    // L1: The Human Capital Multiplier
    const rawMerton = (mu - r) / (gamma * Math.pow(sigma, 2));
    const wealthRatio =
      state.savings > 0 ? (state.savings + humanCapital) / state.savings : 1;
    const mertonFraction = rawMerton * wealthRatio;

    const safeMonthlyConsumption = ((state.savings + humanCapital) * r) / 12;

    return {
      humanCapital,
      mertonFraction: Math.min(1.5, Math.max(0.1, mertonFraction)),
      safeMonthlyConsumption,
      savingsRequirement: Math.max(0, netMonthly - safeMonthlyConsumption),
      persona: this.getPersona(gamma),
      netMonthlyIncome: netMonthly,
      taxLeakage: taxMonthly,
    };
  }

  static calculateGamma(answers: RiskAnswers): number {
    let score = 5;
    if (answers.midnightTest === 'A') score += 3;
    if (answers.midnightTest === 'B') score += 1;
    if (answers.midnightTest === 'C') score -= 1;
    if (answers.midnightTest === 'D') score -= 3;
    if (answers.choiceOfPaths === 'A') score += 3;
    if (answers.choiceOfPaths === 'C') score -= 3;
    if (answers.safetyNet === 'A') score += 2;
    if (answers.safetyNet === 'D') score -= 1;
    if (answers.goalHorizon === 'A') score += 2;
    if (answers.goalHorizon === 'C') score -= 2;
    return Math.min(10, Math.max(1.5, score));
  }

  static getPersona(gamma: number): string {
    if (gamma > 7.5) return 'Conservative Defender';
    if (gamma > 5.5) return 'Balanced Guardian';
    if (gamma > 3.5) return 'Growth Builder';
    return 'Aggressive Explorer';
  }
}
