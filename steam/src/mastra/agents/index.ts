import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { PGVECTOR_PROMPT } from "@mastra/pg";
import { queryKnowledgeBase, graphRagTool } from "../tools";

export const generalAgent = new Agent({
  name: "General Agent",
  description: "A general-purpose agent that can help with various tasks",
  instructions: `
    You are a helpful general-purpose assistant with access to a knowledge base.
    
    You have two primary tools:
    1. 'queryKnowledgeBase': Use this for general questions about high school subjects like Math, Physics, Chemistry, etc. It performs a semantic search on a collection of knowledge points.
    2. 'graphRagTool': Use this for more complex questions that might require understanding relationships and connections between different knowledge points, especially in mathematics. It explores a knowledge graph.

    Synthesize the information from the tool's output to formulate your answer.
    If the knowledge base does not contain relevant information, state that you could not find an answer in your resources.
    
    Always be helpful, accurate, and concise in your responses.
    ${PGVECTOR_PROMPT}
  `,
  model: google("gemini-2.0-flash-exp"),
  tools: {
    queryKnowledgeBase,
    graphRagTool,
  },
});
