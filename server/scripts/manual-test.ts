import { simulateMarketShock, fetchMarketData } from '../src/logic';
import dotenv from 'dotenv';
import path from 'path';

// Load Env for API Keys
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
    console.log('🧪 Testing Visual Polish & Simulation Logic...\n');

    // 1. Test Market Data Table Formatting
    console.log('=== TEST 1: Market Data Table ===');
    try {
        const symbol = 'RELIANCE.BSE';
        const data = await fetchMarketData(symbol);
        if (data) {
            const timeSeries = data['Time Series (Daily)'];
            const recentDates = Object.keys(timeSeries).slice(0, 5);
            const summary = recentDates.map((date: string) => ({
                date,
                close: timeSeries[date]['4. close'],
            }));

            const tableHeader = `| Date | Close Price |\n|---|---|\n`;
            const tableRows = summary.map((s: any) => `| ${s.date} | ${parseFloat(s.close).toFixed(2)} |`).join('\n');
            const markdownTable = `### Market Data for ${symbol}\n\n${tableHeader}${tableRows}`;
            console.log(markdownTable);
        } else {
            console.log('Failed to fetch market data.');
        }
    } catch (e: any) {
        console.error('Error fetching market data:', e.message);
    }
    console.log('\n----------------------------------------\n');

    // 2. Test Simulation Logic
    console.log('=== TEST 2: Market Crash Simulation (2008_CRASH) ===');
    const scenarios = ['2008_CRASH', 'COVID_19'] as const;

    for (const scenario of scenarios) {
        console.log(`\n--- Simulating ${scenario} ---`);
        const result = await simulateMarketShock(scenario);
        console.log(result);
    }

    console.log('\n----------------------------------------\n');

    // 3. Test Paper Trading
    console.log('=== TEST 3: Paper Trading Execution ===');
    const { executeTrade } = await import('../src/logic');
    const tradeResult = await executeTrade({
        symbol: 'TATASTEEL.BSE',
        action: 'BUY',
        quantity: 10,
        price: 150.00,
        timestamp: new Date().toISOString()
    });
    console.log('Trade Result:', tradeResult);
}

main().catch(console.error);
