import { PortfolioAsset } from '../types';

export class FactorEngine {
  static calculate(
    persona: string,
    portfolioAssets: PortfolioAsset[] | null,
  ): number {
    // Fama-French 5-Factor Proxy
    let rmw = 50;
    let hml = 50;
    let cma = 50;

    // Base scores from Persona
    switch (persona) {
      case 'Conservative Defender':
        rmw = 90;
        hml = 60;
        cma = 80;
        break;
      case 'Balanced Guardian':
        rmw = 75;
        hml = 70;
        cma = 60;
        break;
      case 'Growth Builder':
        rmw = 60;
        hml = 40;
        cma = 40;
        break;
      case 'Aggressive Explorer':
        rmw = 40;
        hml = 20;
        cma = 20;
        break;
    }

    // L3: Asset-Based Factor Vetting
    if (portfolioAssets && portfolioAssets.length > 0) {
      portfolioAssets.forEach((asset) => {
        const name = asset.name.toLowerCase();
        const cat = asset.category;

        if (
          name.includes('alpha') ||
          name.includes('bluechip') ||
          name.includes('quality')
        ) {
          rmw += 20;
        }
        if (
          cat === 'Debt' ||
          cat === 'Cash' ||
          name.includes('bond') ||
          name.includes('liquid')
        ) {
          cma += 20;
        }
        if (name.includes('index') || name.includes('nifty')) {
          hml += 10;
        }
        if (name.includes('midcap') || name.includes('smallcap')) {
          hml -= 10;
        }
      });
    }

    // Clamp values
    rmw = Math.min(100, Math.max(0, rmw));
    hml = Math.min(100, Math.max(0, hml));
    cma = Math.min(100, Math.max(0, cma));

    return Math.round(rmw * 0.4 + hml * 0.3 + cma * 0.3);
  }
}
