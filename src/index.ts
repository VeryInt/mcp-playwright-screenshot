#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import playwright from 'playwright';
import fs from 'fs'
import path from 'path'

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
        // return {
        //     content: [{
        //         type: "text",
        //         text: "Hello, World!",
        //     }]
        // }
        // const browser = await playwright.chromium.launch();
        const token = process.env.LIGHTPANDA_TOKEN;
        const saveFolderPath = process.env.SAVE_FOLDER_PATH;
        if(!token){
            return {
                content: [
                    {
                        type: "text",
                        text: "Please provide LIGHTPANDA_TOKEN in the environment variable",
                    },
                ],
            }
        }

        if(!saveFolderPath){
            return {
                content: [
                    {
                        type: "text",
                        text: "Please provide SAVE_FOLDER_PATH in the environment variable",
                    },
                ],
            }
        }
        const browser = await playwright.chromium.connectOverCDP(
            `wss://cloud.lightpanda.io/ws?token=${token}`,
        );
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(url);
        const screenshot = await page.screenshot();
        const now = Date.now()
        
        const screenshotPath = path.join(saveFolderPath, `screenshot_${now}.png`);
        const dirPath = path.dirname(saveFolderPath); 
        fs.mkdirSync(dirPath, { recursive: true }); // create folder if not exist
        // save screenshot to local
        fs.writeFileSync(screenshotPath, screenshot);
        // get the file path
        // const filePath = fs.realpathSync('screenshot.png');

        await browser.close();
        return {
            content: [
                {
                    type: "text",
                    text: `the screenshot is saved to local folder, the path is: ${screenshotPath}`
                },
            ],
        };
    }
)


async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.info('playwright screenshot MCP Server running on stdio');
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
