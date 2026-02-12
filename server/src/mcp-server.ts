import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import express from 'express';
import {
    fetchMarketData,
    getSimulatedNews,
    generateWealthInsights,
    getMacroData,
    executeTrade,
    getHoldings,
    scanDocumentsForInsights,
    simulateMarketShock,
} from './logic';
import { MertonEngine } from './engines/MertonEngine';
import { GoalEngine } from './engines/GoalEngine';
import { SentimentEngine } from './engines/SentimentEngine';
import { FactorEngine } from './engines/FactorEngine';
import { PortfolioState, PortfolioAsset, TransitionPoint } from './types';

// Helper to create a fresh MCP server instance with all tools registered
function createMcpServer() {
    const mcp = new McpServer({
        name: 'Fusion Wealth Data Server',
        version: '1.0.0',
    });

    // Tool 1: Market Data
    mcp.tool(
        'get_market_data',
        { symbol: z.string().describe('Stock symbol (e.g., RELIANCE.BSE)') },
        async ({ symbol }) => {
            try {
                const data = await fetchMarketData(symbol);
                if (!data)
                    return { content: [{ type: 'text', text: 'No data found.' }] };
                const timeSeries = data['Time Series (Daily)'];
                const recentDates = Object.keys(timeSeries).slice(0, 5);
                const summary = recentDates.map((date: string) => ({
                    date,
                    close: timeSeries[date]['4. close'],
                }));
                const tableHeader = `| Date | Close Price |\n|---|---|\n`;
                const tableRows = summary.map((s: any) => `| ${s.date} | ${parseFloat(s.close).toFixed(2)} |`).join('\n');
                const markdownTable = `### Market Data for ${symbol}\n\n${tableHeader}${tableRows}`;

                return {
                    content: [
                        {
                            type: 'text',
                            text: markdownTable,
                        },
                    ],
                };
            } catch (e: any) {
                return { content: [{ type: 'text', text: `Error: ${e.message}` }] };
            }
        },
    );

    // Tool 2: News
    mcp.tool(
        'get_financial_news',
        'get_financial_news',
        { persona: z.string().describe('[Advisor] The user persona to fetch news for') },
        async ({ persona }) => {
            const news = getSimulatedNews(persona);
            return {
                content: [{ type: 'text', text: JSON.stringify(news, null, 2) }],
            };
        },
    );

    // Tool 3: Wealth Insights
    mcp.tool(
        'get_wealth_insights',
        {
            persona: z.string().describe('[Advisor] User persona'),
            monthlyIncome: z.string(),
            totalSavings: z.string(),
            monthlyBurn: z.string(),
            healthScore: z.number(),
        },
        async (args) => {
            const insight = await generateWealthInsights(args);
            return { content: [{ type: 'text', text: insight }] };
        },
    );

    // Tool 4: Portfolio Strategy
    mcp.tool(
        'calculate_portfolio_strategy',
        {
            state: z.string().describe('[Quant] JSON stringified PortfolioState'),
            portfolioAssets: z
                .string()
                .optional()
                .describe('JSON stringified PortfolioAsset[]'),
        },
        async ({ state, portfolioAssets }) => {
            try {
                const parsedState: PortfolioState = JSON.parse(state);
                const parsedAssets: PortfolioAsset[] = portfolioAssets
                    ? JSON.parse(portfolioAssets)
                    : [];

                // 1. Fetch Market Data
                const mu = 0.1;
                const sigma = 0.18;
                try {
                    await fetchMarketData('RELIANCE.BSE');
                } catch (e) {
                    console.warn('Market fetch failed in strategy calc', e);
                }

                // 2. Fetch News
                const news = getSimulatedNews(
                    parsedState.goals.length > 0 ? 'Balanced Guardian' : 'General',
                );
                const sentimentTilt = SentimentEngine.calculate(news);
                const muTilt = sentimentTilt * 0.02;
                const adjustedMu = Math.max(0.05, mu + muTilt);

                // 3. Fetch Macro Data
                const macro = await getMacroData();
                const riskFreeRate = macro.bondYield10Y / 100;

                // 4. Run Engines
                const mRes = MertonEngine.calculate(
                    parsedState,
                    adjustedMu,
                    sigma,
                    riskFreeRate,
                );

                // Monte Carlo
                const yearsLeft = Math.max(1, parsedState.targetAge - parsedState.age);
                const mc = MertonEngine.runMonteCarlo(
                    parsedState.savings,
                    yearsLeft,
                    adjustedMu,
                    sigma,
                    parsedState.behavioral.lastContributionAmount,
                );

                // Goals
                const goalAllocatedSip =
                    parsedState.goals.length > 0
                        ? parsedState.behavioral.lastContributionAmount /
                        parsedState.goals.length
                        : 0;
                const goalResults = parsedState.goals.map((g) =>
                    GoalEngine.calculateGoalGap(g, goalAllocatedSip, adjustedMu),
                );

                // Transition Map
                const r = riskFreeRate;
                const mapData: TransitionPoint[] = [];
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

                // Factor Vetting
                const qualityScore = FactorEngine.calculate(mRes.persona, parsedAssets);

                // Health Score
                const avgGoalSuccess =
                    goalResults.length > 0
                        ? goalResults.reduce((acc, curr) => acc + curr.successRate, 0) /
                        goalResults.length
                        : 100;
                const finalHealthScore = Math.round(
                    mRes.mertonFraction * 40 + avgGoalSuccess * 0.4 + qualityScore * 0.2,
                );

                const result = {
                    merton: mRes,
                    transitionMap: mapData,
                    prescriptions: goalResults,
                    healthScore: finalHealthScore,
                    marketMetrics: { mu, sigma, sentimentTilt },
                };

                return { content: [{ type: 'text', text: JSON.stringify(result) }] };
            } catch (e: any) {
                return {
                    content: [
                        { type: 'text', text: JSON.stringify({ error: e.message }) },
                    ],
                };
            }
        },
    );

    // Tool 5: Document Processor
    mcp.tool('scan_financial_documents', {}, async () => {
        const result = await scanDocumentsForInsights();
        return { content: [{ type: 'text', text: result }] };
    });

    // Tool 6: Paper Trading (Execute Trade)
    mcp.tool(
        'execute_trade',
        {
            symbol: z.string(),
            action: z.enum(['BUY', 'SELL']),
            quantity: z.number(),
            price: z.number(),
        },
        async ({ symbol, action, quantity, price }) => {
            const trade = {
                symbol,
                action,
                quantity,
                price,
                timestamp: new Date().toISOString(),
            };
            const result = await executeTrade(trade);
            return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        },
    );

    // Tool 7: Paper Trading (Get Holdings)
    mcp.tool('get_holdings', {}, async () => {
        const holdings = await getHoldings();
        return { content: [{ type: 'text', text: JSON.stringify(holdings) }] };
    });

    // Tool 8: Real-Time Macro Analyst
    mcp.tool('get_macro_metrics', {}, async () => {
        const data = await getMacroData();
        return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    });

    // Tool 9: Scenario Simulator (Hackathon Feature)
    mcp.tool(
        'simulate_market_shock',
        {
            shockType: z.enum(['2008_CRASH', 'COVID_19', 'TECH_BUBBLE', 'INFLATION_SPIKE']).describe('[Quant] The historical scenario to simulate')
        },
        async ({ shockType }) => {
            const result = await simulateMarketShock(shockType);
            return { content: [{ type: 'text', text: result }] };
        }
    );

    return mcp;
}

export async function startMcpServer() {
    const transportType = process.env.MCP_TRANSPORT || 'stdio';

    if (transportType === 'sse') {
        const app = express();

        // Add CORS support
        const cors = await import('cors').then(m => m.default);
        app.use(cors());

        const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3002;

        // Store active sessions: sessionId -> { transport, mcp }
        const sessions = new Map<string, { transport: SSEServerTransport, mcp: McpServer }>();

        app.use(express.json()); // Enable JSON body parsing

        app.use((req, res, next) => {
            // concise logging
            if (req.url === '/sse' && req.method === 'GET') {
                console.log(`[${new Date().toISOString()}] GET /sse - New Connection Request`);
            } else if (req.url.startsWith('/sse') && req.method === 'GET') {
                console.log(`[${new Date().toISOString()}] GET /sse (Keep-Alive/Ping)`);
            } else {
                console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
            }
            next();
        });

        app.get('/sse', async (req, res) => {
            console.log('Establishing new SSE connection...');
            const mcp = createMcpServer();
            const transport = new SSEServerTransport('/sse', res);

            try {
                await mcp.connect(transport);

                const sessionId = (transport as any).sessionId;
                if (sessionId) {
                    sessions.set(sessionId, { transport, mcp });
                    console.log(`SSE connection active (SessionID: ${sessionId})`);
                }

                res.write(`: ping\n\n`);
                const keepAlive = setInterval(() => res.write(`: ping\n\n`), 15000);

                res.on('close', async () => {
                    console.log(`SSE connection closed (SessionID: ${sessionId})`);
                    clearInterval(keepAlive);
                    if (sessionId) sessions.delete(sessionId);
                    try { await mcp.close(); } catch (e) { console.error('Error closing mcp server', e); }
                });
            } catch (err) {
                console.error('Error establishing SSE connection:', err);
                if (!res.headersSent) res.status(500).send(`Internal Server Error: ${err}`);
            }
        });

        app.post('/sse', async (req, res) => {
            const sessionId = req.query.sessionId as string;

            // SPECIAL HANDLING: Archestra/Stateless Probe
            // If no session ID is provided, we treat it as a stateless HTTP-RPC request.
            if (!sessionId) {
                const body = req.body;
                const method = body?.method || 'unknown';
                console.log(`📝 Handling stateless request: "${method}"`);

                const tempMcp = createMcpServer();

                // Custom Transport that sends the FIRST message back as HTTP response
                class HttpProbeTransport implements Transport {
                    private res: express.Response;
                    private hasReplied = false;

                    constructor(res: express.Response) {
                        this.res = res;
                    }

                    async start() { }

                    async send(message: JSONRPCMessage): Promise<void> {
                        if (this.hasReplied) return; // Only send the first response
                        this.hasReplied = true;
                        console.log('📤 Sending stateless response:', JSON.stringify(message).substring(0, 100));
                        this.res.json(message);
                    }

                    async close() { }

                    onmessage?: (message: JSONRPCMessage) => void;
                    onclose?: () => void;
                    onerror?: (error: Error) => void;
                }

                const probeTransport = new HttpProbeTransport(res);
                await tempMcp.connect(probeTransport);

                try {
                    // For notifications (like notifications/initialized), the server might not send a response
                    // back via 'send()'. We need to handle that case to avoid hanging the request.
                    if (method === 'notifications/initialized') {
                        res.status(200).send('OK');
                    } else if (probeTransport.onmessage) {
                        probeTransport.onmessage(body as JSONRPCMessage);
                    }
                } catch (err) {
                    console.error('Error processing stateless request:', err);
                    if (!res.headersSent) res.status(500).json({ error: String(err) });
                }

                // Note: We don't await/close right away because the response is sent async in send()
                // But since we are stateless, we can just let it be garbage collected or close after short delay?
                // Actually, standard MCP server keeps running.
                // ideally we close tempMcp after response.
                // But 'send' is called by MCP.

                // Let's add a safety timeout to close
                setTimeout(() => {
                    tempMcp.close().catch(() => { });
                }, 1000);

                return;
            }

            const session = sessions.get(sessionId);

            if (!session) {
                console.error(`❌ Session not found for ID: ${sessionId}`);
                res.status(404).send('Session not found or expired');
                return;
            }

            try {
                await session.transport.handlePostMessage(req, res);
                // console.log(`✅ Processed POST message for session ${sessionId}`);
            } catch (err) {
                console.error('Error handling POST message:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
                }
            }
        });

        app.post('/message', async (req, res) => {
            res.status(404).send('Not Found');
        });

        app.listen(port, '0.0.0.0', async () => {
            console.log(`MCP Server running on SSE transport at http://0.0.0.0:${port}/sse`);
        });
    } else {
        console.error('Starting Fusion Wealth MCP Server (Stdio Mode)...');
        const mcp = createMcpServer();
        const transport = new StdioServerTransport();
        await mcp.connect(transport);
    }
}
