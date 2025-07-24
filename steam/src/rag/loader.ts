import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the dataset directory, resolved from the current file's location.
const dataDirectory = path.resolve(__dirname, "../../../dataset/knowledge-graph");

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

export interface KnowledgeScenario {
  province_city: string;
  scenic_spot: string;
  name: string;
  stage: string;
  subject: string;
  knowledge_point: string;
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

export async function loadKnowledgeScenarios(): Promise<KnowledgeScenario[]> {
  const scenariosFilePath = path.resolve(
    __dirname,
    "../../../dataset/knowledge-scenarios/knowledge_scenarios.json"
  );
  try {
    const fileContent = await fs.readFile(scenariosFilePath, "utf-8");
    const scenarios = JSON.parse(fileContent) as KnowledgeScenario[];
    return scenarios.filter(
      (scenario) => scenario.knowledge_point !== "暂无收集整理相关知识点"
    );
  } catch (error) {
    console.error(`Error reading knowledge scenarios from ${scenariosFilePath}:`, error);
    throw new Error("Failed to load knowledge scenarios.");
  }
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