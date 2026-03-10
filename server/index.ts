import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  fetchMarketData,
  fetchLiveNews,
  generateWealthInsights,
  scanDocumentsForInsights,
  executeTrade,
  getHoldings,
  getMacroData,
} from './src/logic';
import { startMcpServer } from './src/mcp-server';
import { MertonEngine } from './src/engines/MertonEngine';
import { GoalEngine } from './src/engines/GoalEngine';
import { SentimentEngine } from './src/engines/SentimentEngine';
import { FactorEngine } from './src/engines/FactorEngine';
import { PortfolioState, PortfolioAsset } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
  const isMcpMode = process.argv.includes('--mcp');

  if (isMcpMode) {
    await startMcpServer();
  } else {
    // Start Express for App
    app.use(cors());
    app.use(express.json());

    app.get('/market-data', async (req, res) => {
      try {
        const symbol = (req.query.symbol as string) || 'RELIANCE.BSE';
        const data = await fetchMarketData(symbol);
        res.json(data || { error: 'No data' });
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    app.get('/news', async (req, res) => {
      const persona = (req.query.persona as string) || 'General';
      res.json(await fetchLiveNews(persona));
    });

    app.post('/insights', async (req, res) => {
      const insight = await generateWealthInsights(req.body);
      res.json({ insight });
    });

    app.post('/scan-documents', async (req, res) => {
      const result = await scanDocumentsForInsights();
      try {
        const parsed = JSON.parse(result);
        res.json(parsed);
      } catch {
        res.json({ message: result });
      }
    });

    app.post('/trade/execute', async (req, res) => {
      const result = await executeTrade(req.body);
      res.json(result);
    });

    app.get('/trade/holdings', async (req, res) => {
      const holdings = await getHoldings();
      res.json(holdings);
    });

    app.post('/strategy', async (req, res) => {
      try {
        const { state, portfolioAssets } = req.body;
        const parsedState = state;
        const parsedAssets = portfolioAssets || [];

        // 1. Market & News
        const mu = 0.1;
        const sigma = 0.18;
        const news = await fetchLiveNews(
          parsedState.goals.length > 0 ? 'Balanced Guardian' : 'General',
        );
        const sentimentTilt = SentimentEngine.calculate(news);
        const muTilt = sentimentTilt * 0.02;
        const adjustedMu = Math.max(0.05, mu + muTilt);

        // 3. Fetch Macro Data
        const macro = await getMacroData();
        const riskFreeRate = macro.bondYield10Y / 100;

        // 4. Engines
        const mRes = MertonEngine.calculate(
          parsedState,
          adjustedMu,
          sigma,
          riskFreeRate,
        );
        const yearsLeft = Math.max(1, parsedState.targetAge - parsedState.age);
        const mc = MertonEngine.runMonteCarlo(
          parsedState.savings,
          yearsLeft,
          adjustedMu,
          sigma,
          parsedState.behavioral.lastContributionAmount,
        );

        const goalAllocatedSip =
          parsedState.goals.length > 0
            ? parsedState.behavioral.lastContributionAmount /
            parsedState.goals.length
            : 0;
        const goalResults = parsedState.goals.map((g: any) =>
          GoalEngine.calculateGoalGap(g, goalAllocatedSip, adjustedMu),
        );

        const r = riskFreeRate;
        const mapData = [];
        for (let i = 0; i <= yearsLeft; i++) {
          const curAge = parsedState.age + i;
          const hc =
            mRes.netMonthlyIncome *
            12 *
            ((1 - Math.pow(1 + r, -(parsedState.targetAge - curAge))) / r);
          const fa = mc[i * 12]?.median || 0;
          mapData.push({
            age: curAge,
            humanCapital: Math.max(0, hc),
            financialAssets: fa,
          });
        }

        const qualityScore = FactorEngine.calculate(mRes.persona, parsedAssets);
        const avgGoalSuccess =
          goalResults.length > 0
            ? goalResults.reduce(
              (acc: number, curr: any) => acc + curr.successRate,
              0,
            ) / goalResults.length
            : 100;
        const finalHealthScore = Math.round(
          mRes.mertonFraction * 40 + avgGoalSuccess * 0.4 + qualityScore * 0.2,
        );

        res.json({
          merton: mRes,
          transitionMap: mapData,
          prescriptions: goalResults,
          healthScore: finalHealthScore,
          marketMetrics: { mu, sigma, sentimentTilt },
          macroMetrics: macro,
        });
      } catch (e: any) {
        console.error('Strategy Calc Error', e);
        res.status(500).json({ error: e.message });
      }
    });

    app.listen(PORT, () => {
      console.log(`Fusion Wealth Backend running on http://localhost:${PORT}`);
      console.log(`- Market Data: http://localhost:${PORT}/market-data`);
      console.log(`- News: http://localhost:${PORT}/news`);
      console.log(`- Insights: POST http://localhost:${PORT}/insights`);
    });
  }
}

startServer();
