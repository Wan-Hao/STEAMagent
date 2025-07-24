import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { PGVECTOR_PROMPT } from "@mastra/pg";
import { queryKnowledgeBase, graphRagTool, queryKnowledgeScenarios } from "../tools";
import { openai } from "@ai-sdk/openai";
export * from "./intent-analysis";
export * from './general';

export const steamAgent = new Agent({
  name: "Steam Agent",
  description: "A general-purpose agent that can help with various tasks",
  instructions: `
    You are a helpful general-purpose assistant with access to a knowledge base.
    
    You have three primary tools:
    1. 'queryKnowledgeBase': Use this for general questions about high school subjects like Math, Physics, Chemistry, etc. It performs a semantic search on a collection of knowledge points.
    2. 'graphRagTool': Use this for more complex questions that might require understanding relationships and connections between different knowledge points, especially in mathematics. It explores a knowledge graph.
    3. 'queryKnowledgeScenarios': Use this to find knowledge points related to specific scenarios, locations (like tourist attractions), or other contextual information. This is useful for connecting abstract knowledge to real-world examples.

    Synthesize the information from the tool's output to formulate your answer.
    If the knowledge base does not contain relevant information, state that you could not find an answer in your resources.
    
    Always be helpful, accurate, and concise in your responses.
    ${PGVECTOR_PROMPT}
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    queryKnowledgeBase,
    graphRagTool,
    queryKnowledgeScenarios,
  },
});
