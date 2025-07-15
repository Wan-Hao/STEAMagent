import fs from "fs/promises";
import path from "path";

// Correct path assuming script is run from 'steam-agent' directory
const dataDirectory = path.resolve(process.cwd(), "../dataset/knowledge-graph");

const dataSummeryDir = path.join(dataDirectory, "data-summery");
const graphDir = path.join(dataDirectory, "graph");

export interface KnowledgePoint {
  knowledge_point: string;
  course_nature: string;
  subject: string;
  category: string;
  theme: string;
  cultivated_abilities: string;
  content_description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  properties: {
    description: string;
    [key: string]: any;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  properties?: {
    description?: string;
  };
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function loadKnowledgePoints(): Promise<KnowledgePoint[]> {
  const allKnowledgePoints: KnowledgePoint[] = [];

  try {
    const files = await fs.readdir(dataSummeryDir);

    for (const file of files) {
      if (path.extname(file) === ".json") {
        const filePath = path.join(dataSummeryDir, file);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const knowledgePoints = JSON.parse(fileContent) as KnowledgePoint[];
        allKnowledgePoints.push(...knowledgePoints);
      }
    }
  } catch (error) {
    console.error(`Error reading knowledge points from ${dataSummeryDir}:`, error);
    // Depending on the use case, you might want to throw the error
    // or return an empty array.
    throw new Error("Failed to load knowledge points.");
  }


  return allKnowledgePoints;
}

export async function loadKnowledgeGraph(
  fileName: string
): Promise<KnowledgeGraph> {
  const filePath = path.join(graphDir, fileName);
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const graphData = JSON.parse(fileContent) as KnowledgeGraph;
    return graphData;
  } catch (error) {
    console.error(`Error reading knowledge graph from ${filePath}:`, error);
    throw new Error(`Failed to load knowledge graph ${fileName}.`);
  }
} 