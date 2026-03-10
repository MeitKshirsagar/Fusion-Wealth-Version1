import { NewsItem } from '../types';

export class SentimentEngine {
  static calculate(newsItems: NewsItem[]): number {
    if (!newsItems || newsItems.length === 0) return 0;

    let weightedScore = 0;
    let totalWeight = 0;

    newsItems.forEach((item) => {
      let val = 0;
      if (item.sentiment === 'positive') val = 1;
      else if (item.sentiment === 'negative') val = -1;

      let weight = 1.0;
      if (item.impact === 'High') weight = 1.5;
      else if (item.impact === 'Low') weight = 0.5;

      weightedScore += val * weight;
      totalWeight += weight;
    });

    const rawSentiment = totalWeight > 0 ? weightedScore / totalWeight : 0;
    // Normalize to a View Vector (Q) between -0.15 and +0.15 (±15% tilt)
    return Math.max(-0.15, Math.min(0.15, rawSentiment * 0.15));
  }
}
