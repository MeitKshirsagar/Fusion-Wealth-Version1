export class TaxEngine {
  static calculate(monthlyGross: number): {
    netMonthly: number;
    taxMonthly: number;
  } {
    const annualGross = monthlyGross * 12;
    const stdDeduction = 75000;
    const taxableIncome = Math.max(0, annualGross - stdDeduction);
    let tax = 0;
    if (taxableIncome > 1500000)
      tax += (taxableIncome - 1500000) * 0.3 + 150000;
    else if (taxableIncome > 1200000)
      tax += (taxableIncome - 1200000) * 0.2 + 90000;
    else if (taxableIncome > 1000000)
      tax += (taxableIncome - 1000000) * 0.15 + 60000;
    else if (taxableIncome > 700000)
      tax += (taxableIncome - 700000) * 0.1 + 30000;
    else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
    tax = tax * 1.04;
    if (taxableIncome <= 700000) tax = 0;
    return { netMonthly: (annualGross - tax) / 12, taxMonthly: tax / 12 };
  }
}
