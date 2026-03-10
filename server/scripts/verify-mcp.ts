import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function main() {
    console.log('--- Verifying Fusion Wealth MCP Server (SSE Mode) ---');

    console.log('Connecting to http://localhost:3003/sse...');
    const transport = new SSEClientTransport(new URL('http://localhost:3003/sse'));

    const client = new Client(
        {
            name: 'Fusion-Wealth-Verifier',
            version: '1.0.0',
        },
        {
            capabilities: {},
        },
    );

    try {
        console.log('Establishing connection...');
        await client.connect(transport);
        console.log('✅ Connected via SSE!');

        console.log('Listing tools...');
        const result = await client.listTools();

        console.log(`\nFound ${result.tools.length} tools:`);
        result.tools.forEach((tool) => {
            console.log(`- ${tool.name}: ${tool.description || 'No description'}`);
        });

        console.log('\n✅ Verification Successful: Server is responding to MCP protocol over SSE.');
    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        try {
            await client.close();
        } catch (e) {
            // Ignore invalid state errors on close
        }
    }
}

main();
