import { createGraphRAGTool, createVectorQueryTool } from "@mastra/rag";
import { openai } from "@ai-sdk/openai";

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
