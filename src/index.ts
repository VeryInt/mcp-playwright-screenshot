import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import playwright from 'playwright';

const NWS_API_BASE = 'https://api.weather.gov';

// Create server instance
const server = new McpServer({
	name: 'playwright-screenshot',
	version: '1.0.0',
	capabilities: {
		resources: {},
		tools: {},
	},
});

server.tool(
    "get-screenshot",
    "Get a screenshot of a webpage",
    {
        url: z.string().url().describe("URL of the webpage to screenshot"),
    },
    async ({ url }) => {
        // const browser = await playwright.chromium.launch();
        const browser = await playwright.chromium.connectOverCDP(
            "wss://cloud.lightpanda.io/ws?token=TOKEN",
        );
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(url);
        const screenshot = await page.screenshot();
        await browser.close();
        return {
            content: [
                {
                    type: "text",
                    text: screenshot.toString("base64"),
                },
            ],
        };
    }
)


async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('playwright screenshot MCP Server running on stdio');
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
