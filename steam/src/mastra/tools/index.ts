import { createGraphRAGTool, createVectorQueryTool } from "@mastra/rag";
import { createTool } from "@mastra/core/tools";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

export const queryKnowledgeBase = createVectorQueryTool({
  id: "queryKnowledgeBase",
  description:
    "Queries the knowledge base to answer questions about specific subjects.",
  vectorStoreName: "postgres",
  indexName: "knowledge_points",
  model: openai.embedding("text-embedding-3-small"),
});

export const graphRagTool = createGraphRAGTool({
  id: "graphRagTool",
  description:
    "Uses the knowledge graph to answer questions by exploring connections between concepts.",
  vectorStoreName: "postgres",
  indexName: "knowledge_graph_nodes",
  model: openai.embedding("text-embedding-3-small"),
  graphOptions: {
    dimension: 1536,
  },
});

export const queryKnowledgeScenarios = createVectorQueryTool({
    id: "queryKnowledgeScenarios",
    description: "Query for knowledge points based on scenarios, locations, or other contextual information.",
    vectorStoreName: "postgres",
    indexName: "knowledge_scenarios",
    model: openai.embedding("text-embedding-3-small"),
});

export const webSearchTool = createTool({
    id: "webSearch",
    description:
    "Performs a web search to find up-to-date information, such as points of interest, opening hours, or ticket prices.",
  inputSchema: z.object({
    query: z.string().describe("The search query."),
  }),
  outputSchema: z
    .array(
      z.object({
        title: z.string(),
        link: z.string(),
        snippet: z.string(),
      })
    )
    .describe("A list of search results."),
  execute: async ({ context }: { context: { query: string } }) => {
    console.log(`Performing web search for: ${context.query}`);
    const response = await axios.request({
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/search',
      headers: {
        'X-API-KEY': '4e646463c170a8ac3b9c7b57b99a6646015b60d8',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ q: context.query })
    });
    const organicResults = response.data.organic;
    if (Array.isArray(organicResults)) {
      return organicResults.map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));
    }
    return [];
  },
});

type ViewType = "rich" | "markdown" | "raw";

export const viewContentByURL = createTool({
  id: "viewContentByURL",
  description: "Fetches and summarizes the content of a given URL. Supports HTML, images, and other text-based files.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to fetch content from."),
    viewType: z.enum(["rich", "markdown", "raw"]).optional().default("rich").describe("The type of content to return when the target is a webpage."),
  }),
  outputSchema: z.object({
    content: z.string().describe("The summarized content of the URL."),
    contentType: z.string().describe("The content type of the URL."),
    viewType: z.string().optional().describe("The view type used to process the content."),
  }),
  execute: async ({ context }: { context: { url: string, viewType?: ViewType } }) => {
    try {
      console.log(`Fetching content for URL: ${context.url} with viewType: ${context.viewType}`);
      const response = await axios.get(context.url, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      if (contentType.startsWith('image/')) {
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return {
          content: `data:${contentType};base64,${base64}`,
          contentType: contentType,
        };
      } else if (contentType.startsWith('text/html')) {
        const html = response.data.toString('utf-8');
        const $ = cheerio.load(html);
        $("script, style, nav, footer, header").remove();
        
        if (context.viewType === 'raw') {
            return {
                content: $("body").html() || "",
                contentType: contentType,
                viewType: context.viewType,
            }
        }
        
        if (context.viewType === 'markdown' || context.viewType === 'rich') {
            const turndownService = new TurndownService();
            const markdown = turndownService.turndown($("body").html() || '');
            return {
                content: markdown.slice(0, 4000),
                contentType: contentType,
                viewType: context.viewType,
            };
        }

        const text = $("body").text().replace(/\s+/g, " ").trim();
        return { 
            content: text.slice(0, 2000),
            contentType: contentType,
        };

      } else if (contentType.startsWith('text/')) {
        return {
          content: response.data.toString('utf-8').slice(0, 4000),
          contentType: contentType,
        };
      } else {
        return {
          content: `Unsupported content type: ${contentType}`,
          contentType: contentType,
        };
      }
    } catch (error) {
      console.error(`Error fetching URL ${context.url}:`, error);
      return {
        content: "Could not fetch content from the URL.",
        contentType: "error",
      };
    }
  },
});
