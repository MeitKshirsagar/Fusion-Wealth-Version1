import { FinancialGoal, Prescription } from '../types';

export class GoalEngine {
  static calculateGoalGap(
    goal: FinancialGoal,
    currentSipAllocated: number,
    expectedReturn: number,
  ): Prescription {
    const r = expectedReturn / 12;
    const n = Math.max(1, goal.yearsAway * 12);
    const futureTarget =
      goal.targetAmount * Math.pow(1 + goal.inflationRate, goal.yearsAway);

    const fvCurrent =
      currentSipAllocated > 0
        ? currentSipAllocated * ((Math.pow(1 + r, n) - 1) / r)
        : 0;

    const successRate = Math.min(
      100,
      Math.round((fvCurrent / futureTarget) * 100),
    );
    const target90 = futureTarget * 0.9;
    const requiredSip = (target90 * r) / (Math.pow(1 + r, n) - 1);

    let adjustTimelineMonths = 0;
    if (currentSipAllocated > 0) {
      const requiredN =
        Math.log((target90 * r) / currentSipAllocated + 1) / Math.log(1 + r);
      adjustTimelineMonths = Math.max(0, Math.round(requiredN - n));
    } else {
      adjustTimelineMonths = 999;
    }

    return {
      goalId: goal.id,
      successRate,
      increaseMonthlyFuel: Math.max(0, requiredSip - currentSipAllocated),
      adjustTimelineMonths,
      futureTarget,
    };
  }
}
