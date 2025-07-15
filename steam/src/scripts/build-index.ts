import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { MDocument } from "@mastra/rag";
import "dotenv/config";
import {
  loadKnowledgePoints,
  KnowledgePoint,
  loadKnowledgeGraph,
} from "../rag/loader";
import { vectorStore } from "../rag/vector-store";

const KNOWLEDGE_POINT_INDEX_NAME = "knowledge_points";
const KNOWLEDGE_GRAPH_INDEX_NAME = "knowledge_graph_nodes";
const MATH_GRAPH_FILE = "math_knowledge_graph_new.json";
const PHYSICS_GRAPH_FILE = "physics_knowledge_graph_new.json";

async function main() {
  console.log("Starting knowledge point indexing process...");
  
  // --- Section 1: Indexing discrete knowledge points ---
  const knowledgePoints = await loadKnowledgePoints();
  if (knowledgePoints.length > 0) {
    console.log(`Loaded ${knowledgePoints.length} knowledge points.`);
    const documents = knowledgePoints.map((kp) => {
      const content = `Knowledge Point: ${kp.knowledge_point}\\nDescription: ${kp.content_description}`;
      const metadata = {
        knowledge_point: kp.knowledge_point,
        subject: kp.subject,
        category: kp.category,
        theme: kp.theme,
        course_nature: kp.course_nature,
      };
      return new MDocument({
        docs: [{ text: content, metadata }],
        type: "text",
      });
    });

    const chunks = documents.flatMap((doc) => doc.getDocs());
    const chunkTexts = chunks.map((chunk) => chunk.text);

    console.log(`Generating embeddings for ${chunkTexts.length} knowledge point chunks...`);
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunkTexts,
    });
    
    await vectorStore.createIndex({
      indexName: KNOWLEDGE_POINT_INDEX_NAME,
      dimension: 1536,
      metric: "cosine",
    });

    await vectorStore.upsert({
      indexName: KNOWLEDGE_POINT_INDEX_NAME,
      vectors: embeddings,
      metadata: chunks.map((chunk) => chunk.metadata),
    });
    console.log(`Successfully indexed ${knowledgePoints.length} knowledge points.`);
  } else {
    console.log("No discrete knowledge points found to index.");
  }

  // --- Section 2: Indexing knowledge graph nodes ---
  console.log("\\nStarting knowledge graph indexing process...");
  const mathGraph = await loadKnowledgeGraph(MATH_GRAPH_FILE);
  if (mathGraph.nodes.length > 0) {
    console.log(`Loaded ${mathGraph.nodes.length} nodes from ${MATH_GRAPH_FILE}.`);
    
    const graphDocuments = mathGraph.nodes.map((node) => {
      const content = `Graph Node: ${node.label}\\nDescription: ${node.properties.description}`;
      return new MDocument({
        docs: [{ text: content, metadata: { ...node.properties, id: node.id, label: node.label } }],
        type: "text",
      });
    });

    const graphChunks = graphDocuments.flatMap((doc) => doc.getDocs());
    const graphChunkTexts = graphChunks.map((chunk) => chunk.text);

    console.log(`Generating embeddings for ${graphChunkTexts.length} graph node chunks...`);
    const { embeddings: graphEmbeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: graphChunkTexts,
    });

    await vectorStore.createIndex({
      indexName: KNOWLEDGE_GRAPH_INDEX_NAME,
      dimension: 1536,
      metric: "cosine",
    });

    await vectorStore.upsert({
      indexName: KNOWLEDGE_GRAPH_INDEX_NAME,
      vectors: graphEmbeddings,
      metadata: graphChunks.map((chunk) => chunk.metadata),
    });
    console.log(`Successfully indexed ${mathGraph.nodes.length} graph nodes from ${MATH_GRAPH_FILE}.`);
  } else {
    console.log(`No graph nodes found in ${MATH_GRAPH_FILE} to index.`);
  }

  const physicsGraph = await loadKnowledgeGraph(PHYSICS_GRAPH_FILE);
  if (physicsGraph.nodes.length > 0) {
    console.log(`Loaded ${physicsGraph.nodes.length} nodes from ${PHYSICS_GRAPH_FILE}.`);

    const graphDocuments = physicsGraph.nodes.map((node) => {
      const content = `Graph Node: ${node.label}\\nDescription: ${node.properties.description}`;
      return new MDocument({
        docs: [
          {
            text: content,
            metadata: { ...node.properties, id: node.id, label: node.label },
          },
        ],
        type: "text",
      });
    });

    const graphChunks = graphDocuments.flatMap((doc) => doc.getDocs());
    const graphChunkTexts = graphChunks.map((chunk) => chunk.text);

    console.log(
      `Generating embeddings for ${graphChunkTexts.length} graph node chunks...`
    );
    const { embeddings: graphEmbeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: graphChunkTexts,
    });

    await vectorStore.createIndex({
      indexName: KNOWLEDGE_GRAPH_INDEX_NAME,
      dimension: 1536,
      metric: "cosine",
    });

    await vectorStore.upsert({
      indexName: KNOWLEDGE_GRAPH_INDEX_NAME,
      vectors: graphEmbeddings,
      metadata: graphChunks.map((chunk) => chunk.metadata),
    });
    console.log(
      `Successfully indexed ${physicsGraph.nodes.length} graph nodes from ${PHYSICS_GRAPH_FILE}.`
    );
  } else {
    console.log(`No graph nodes found in ${PHYSICS_GRAPH_FILE} to index.`);
  }

  console.log("\\nIndexing process complete!");
}

main().catch((error) => {
  console.error("An error occurred during the indexing process:", error);
  process.exit(1);
}); 