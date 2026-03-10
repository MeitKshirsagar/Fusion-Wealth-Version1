import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import dotenv from 'dotenv';

dotenv.config();

export async function fetchMarketData(symbol: string) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    if (!apiKey) throw new Error('API Key configuration missing');

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
    const response = await axios.get(url);

    if (response.data['Error Message'])
        throw new Error(response.data['Error Message']);
    if (!response.data['Time Series (Daily)']) return null;

    return response.data;
}

export async function fetchLiveNews(persona: string) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;

    // Map persona to relevant search topics for Alpha Vantage
    const topicMap: Record<string, string> = {
        'Balanced Guardian': 'financial_markets,economy_fiscal',
        'Aggressive Growth': 'technology,ipo,earnings',
        'Conservative Shield': 'finance,economy_monetary',
        default: 'financial_markets,economy_fiscal',
    };
    const topics = topicMap[persona] || topicMap['default'];

    // Try live Alpha Vantage News Sentiment API
    if (apiKey) {
        try {
            const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&sort=LATEST&limit=6&apikey=${apiKey}`;
            const response = await axios.get(url, { timeout: 8000 });
            const feed = response.data?.feed;

            if (feed && Array.isArray(feed) && feed.length > 0) {
                console.log(`[News] Fetched ${feed.length} live articles from Alpha Vantage`);
                return feed.slice(0, 5).map((article: any) => {
                    // Map Alpha Vantage sentiment score to our labels
                    const score = parseFloat(article.overall_sentiment_score || '0');
                    const sentiment = score >= 0.15 ? 'positive' : score <= -0.15 ? 'negative' : 'neutral';

                    // Map sentiment to impact level
                    const absScore = Math.abs(score);
                    const impact = absScore >= 0.25 ? 'High' : absScore >= 0.1 ? 'Medium' : 'Low';

                    // Format timestamp as relative time
                    const publishedDate = article.time_published
                        ? formatRelativeTime(article.time_published)
                        : 'Recently';

                    // Extract category from topics
                    const category = article.topics?.[0]?.topic
                        ?.replace(/_/g, ' ')
                        ?.replace(/\b\w/g, (c: string) => c.toUpperCase())
                        || 'Markets';

                    return {
                        headline: article.title || 'Breaking News',
                        source: article.source || 'Alpha Vantage',
                        sentiment,
                        impact,
                        summary: article.summary || '',
                        url: article.url || '#',
                        timestamp: publishedDate,
                        category,
                    };
                });
            }
        } catch (err: any) {
            console.warn(`[News] Alpha Vantage API failed, using fallback:`, err.message);
        }
    }

    // Fallback: return simulated news from the pool
    return getSimulatedNewsFallback(persona);
}

function formatRelativeTime(avTimestamp: string): string {
    try {
        // Alpha Vantage format: "20250215T120000"
        const year = avTimestamp.substring(0, 4);
        const month = avTimestamp.substring(4, 6);
        const day = avTimestamp.substring(6, 8);
        const hour = avTimestamp.substring(9, 11);
        const minute = avTimestamp.substring(11, 13);
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
        return 'Recently';
    }
}

function getSimulatedNewsFallback(persona: string) {
    const pickRandom = (arr: any[], count: number) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, arr.length));
    };
    const dynamicTimestamp = () => {
        const opts = ['Just now', '2 mins ago', '8 mins ago', '15 mins ago', '27 mins ago', '42 mins ago', '1 hour ago', '2 hours ago', '3 hours ago'];
        return opts[Math.floor(Math.random() * opts.length)];
    };
    const pool: any = {
        default: [
            { headline: 'RBI Holds Key Repo Rate Steady at 6.5%', source: 'Mint', sentiment: 'neutral', impact: 'High', summary: 'Central bank maintains status quo citing balanced inflation outlook.', url: 'https://www.livemint.com/market', category: 'Monetary Policy' },
            { headline: 'Nifty 50 Hits Fresh All-Time High', source: 'Economic Times', sentiment: 'positive', impact: 'High', summary: 'Broad-based rally led by banking and IT heavyweights.', url: 'https://economictimes.indiatimes.com/', category: 'Markets' },
            { headline: 'India GDP Growth Accelerates to 7.2%', source: 'Reuters', sentiment: 'positive', impact: 'High', summary: 'Manufacturing and services PMI data confirms robust expansion.', url: 'https://www.reuters.com/finance', category: 'Economy' },
            { headline: 'FII Outflows Hit ₹12,000 Cr in February', source: 'MoneyControl', sentiment: 'negative', impact: 'Medium', summary: 'Foreign institutional investors continue selling amid risk-off sentiment.', url: 'https://www.moneycontrol.com/', category: 'Capital Flows' },
            { headline: 'Gold Rallies to Record ₹72,500 Per 10g', source: 'Bloomberg', sentiment: 'positive', impact: 'Medium', summary: 'Safe-haven demand drives gold to new highs.', url: 'https://www.bloomberg.com/asia', category: 'Commodities' },
            { headline: 'US Fed Signals Two Rate Cuts in 2025', source: 'Reuters', sentiment: 'positive', impact: 'High', summary: 'Dovish pivot boosts global equity sentiment.', url: 'https://www.reuters.com/finance', category: 'Global Policy' },
        ],
    };
    const items = pool[persona] || pool['default'];
    return pickRandom(items, 4).map((item: any) => ({ ...item, timestamp: dynamicTimestamp() }));
}

export async function generateWealthInsights(profile: any) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return 'Configuration Error: Google API Key missing in server.';

    try {
        const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
        const prompt = `Act as an elite private wealth manager for a high-net-worth individual in India.
        User Profile:
        - Persona: ${profile.persona}
        - Monthly Income: ${profile.monthlyIncome}
        - Total Savings: ${profile.totalSavings}
        - Monthly Burn: ${profile.monthlyBurn}
        - Financial Health Score: ${profile.healthScore}/100

        Task: Analyze the user's financial situation and provide a structured response in Markdown.
        
        Output Format:
        ### 🩺 Diagnosis
        [One sentence summary of their current status]

        ### 🚀 Actionable Step
        [One punchy, direct action to take]

        ### 💡 Why this matters
        [One sentence explanation of the impact]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: prompt,
        });

        return (
            response.text?.trim() || 'Keep up the good work on your financial journey.'
        );
    } catch (e: any) {
        console.error('GenAI Error:', e);
        return 'Insight currently unavailable. Please check back later.';
    }
}

export async function getMacroData() {
    // Simulated live data for India (would use AlphaVantage/FRED in prod)
    return {
        inflation: 5.5,
        gdpGrowth: 6.8,
        bondYield10Y: 7.1, // Risk-free rate proxy
        unemployment: 7.2,
        lastUpdated: new Date().toISOString(),
    };
}

export async function executeTrade(trade: any) {
    try {
        const tradesFile = path.join(__dirname, '../trades.json');
        let trades = [];
        if (fs.existsSync(tradesFile)) {
            const content = fs.readFileSync(tradesFile, 'utf-8');
            trades = JSON.parse(content || '[]');
        }
        trades.push(trade);
        fs.writeFileSync(tradesFile, JSON.stringify(trades, null, 2));
        return {
            success: true,
            message: `Executed ${trade.action} ${trade.quantity} ${trade.symbol} @ ${trade.price}`,
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getHoldings() {
    try {
        const tradesFile = path.join(__dirname, '../trades.json');
        if (!fs.existsSync(tradesFile)) return [];

        const trades = JSON.parse(fs.readFileSync(tradesFile, 'utf-8') || '[]');
        const holdings: any = {};

        trades.forEach((t: any) => {
            if (!holdings[t.symbol])
                holdings[t.symbol] = { symbol: t.symbol, quantity: 0, avgPrice: 0 };

            if (t.action === 'BUY') {
                const totalCost =
                    holdings[t.symbol].quantity * holdings[t.symbol].avgPrice +
                    t.quantity * t.price;
                holdings[t.symbol].quantity += t.quantity;
                holdings[t.symbol].avgPrice = totalCost / holdings[t.symbol].quantity;
            } else if (t.action === 'SELL') {
                holdings[t.symbol].quantity -= t.quantity;
            }
        });

        return Object.values(holdings).filter((h: any) => h.quantity > 0);
    } catch (e: any) {
        return [];
    }
}

export async function scanDocumentsForInsights() {
    try {
        const docsDir = path.join(__dirname, '../documents');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
            return 'Created documents directory. Please drop PDFs there.';
        }

        const files = fs
            .readdirSync(docsDir)
            .filter((f) => f.toLowerCase().endsWith('.pdf'));
        if (files.length === 0) {
            return 'No PDF documents found in server/documents/';
        }

        let combinedText = '';
        for (const file of files) {
            const dataBuffer = fs.readFileSync(path.join(docsDir, file));
            const data = await (pdf as any)(dataBuffer);
            combinedText += `\n--- DOCUMENT: ${file} ---\n${data.text}\n`;
        }

        // Analyze with Gemini
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return 'Configuration Error: Google API Key missing.';

        const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

        const prompt = `
        Analyze the following financial documents text and extract a consolidated net worth summary.
        Return ONLY a valid JSON object with this structure:
        {
            "totalSavings": number,
            "breakdown": { "equity": number, "debt": number, "cash": number },
            "holdings": [ { "name": string, "value": number, "category": "Equity" | "Debt" | "Cash" } ]
        }
        If data is missing, make best reasonable estimates or use 0.
        
        TEXT DATA:
        ${combinedText.substring(0, 30000)} // Truncate to avoid context limits
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: prompt,
        });
        const responseText = result.text?.trim() || '{}';

        // Clean JSON
        const jsonMatch = responseText ? responseText.match(/\{[\s\S]*\}/) : null;
        const cleanJson = jsonMatch ? jsonMatch[0] : '{}';

        return cleanJson;
    } catch (e: any) {
        return JSON.stringify({ error: e.message });
    }
}

export async function simulateMarketShock(shockType: '2008_CRASH' | 'COVID_19' | 'TECH_BUBBLE' | 'INFLATION_SPIKE') {
    try {
        const holdings = (await getHoldings()) as any[];
        if (holdings.length === 0) return "No holdings found to simulate shock.";

        // Define Shock Scenarios (Impact multipliers)
        const SCENARIOS = {
            '2008_CRASH': { equity: -0.55, debt: -0.05, gold: +0.25, description: "Global Financial Crisis (Deflationary Bust)" },
            'COVID_19': { equity: -0.35, debt: +0.02, gold: +0.10, description: "Pandemic Induced Flash Crash (Quick Recovery)" },
            'TECH_BUBBLE': { equity: -0.45, debt: +0.05, gold: 0.0, description: "Dot-com Bubble Burst (Sector Specific)" },
            'INFLATION_SPIKE': { equity: -0.15, debt: -0.10, gold: +0.15, description: "High Inflation & Rate Hikes (Stagflation)" }
        };

        const shock = SCENARIOS[shockType];
        let totalValueBefore = 0;
        let totalValueAfter = 0;
        const breakdown = [];

        for (const h of holdings) {
            // Simple heuristic for asset class
            let category = 'equity';
            const sym = h.symbol.toUpperCase();
            if (sym.includes('GOLD') || sym.includes('GLD')) category = 'gold';
            else if (sym.includes('LIQUID') || sym.includes('BOND') || sym.includes('GILT')) category = 'debt';

            // Explicitly cast to any to avoid TS union with 'description' string
            const impact = (shock as any)[category] || shock.equity;
            const currentValue = h.quantity * h.avgPrice; // using avgPrice as proxy for current price if live not avail
            const afterValue = currentValue * (1 + impact);

            totalValueBefore += currentValue;
            totalValueAfter += afterValue;

            breakdown.push({
                symbol: h.symbol,
                category,
                before: Math.round(currentValue),
                after: Math.round(afterValue),
                change: `${(impact * 100).toFixed(0)}%`
            });
        }

        const dropPercent = ((totalValueAfter - totalValueBefore) / totalValueBefore) * 100;

        // Formatted Markdown Response
        return `### 📉 Simulation: ${shock.description}
        
| Metric | Pre-Shock | Post-Shock | Change |
|---|---|---|---|
| **Portfolio Value** | ₹${totalValueBefore.toLocaleString()} | ₹${totalValueAfter.toLocaleString()} | **${dropPercent.toFixed(2)}%** |

### Breakdown by Asset
| Symbol | Category | Impact | Value Change |
|---|---|---|---|
${breakdown.map(b => `| ${b.symbol} | ${b.category.toUpperCase()} | ${b.change} | ₹${b.before.toLocaleString()} ➝ ₹${b.after.toLocaleString()} |`).join('\n')}

### 🤖 Agent Assessment
${dropPercent < -30 ? "⚠️ **CRITICAL RISK:** Your portfolio fails this stress test. Consider increasing Gold/Debt allocation." : "✅ **RESILIENT:** Your portfolio survives this scenario with manageable losses."}`;

    } catch (e: any) {
        return `Simulation Error: ${e.message}`;
    }
}
