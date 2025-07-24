import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";


// This is the output schema the agent will adhere to.
export const intentAnalysisOutputSchema = z.object({
  intent: z.enum(["scenario_driven", "knowledge_driven", "unclear"]).describe("The classified intent of the user's query."),
  extracted_entity: z.string().describe("The core location or subject extracted from the query. For example, 'Yangzhou' or 'High School Physics'."),
});

export const intentAnalysisAgent = new Agent({
  name: "Intent Analysis Agent",
  description: "Analyzes a user's query about a study tour to classify their intent and extract the key entity.",
  instructions: `
    You are an expert at analyzing user requests for study tours.
    Your task is to classify the user's intent and extract the key entity from their query.

    The intent can be one of three types:
    1. 'scenario_driven': The user wants to plan a tour based on a specific location, city, or place. (e.g., "我想去扬州研学", "Can we plan a trip to Beijing?")
    2. 'knowledge_driven': The user wants to plan a tour based on a specific subject, topic, or knowledge point. (e.g., "我想学习关于高中物理的知识", "Plan a tour about ancient history.")
    3. 'unclear': The intent cannot be determined from the query.

    The extracted_entity is the primary location or subject mentioned.
    - For 'scenario_driven' intent, this will be the place name (e.g., "扬州", "Beijing").
    - For 'knowledge_driven' intent, this will be the subject or topic (e.g., "高中物理", "ancient history").
    - If the intent is 'unclear', the entity can be an empty string.

    You must respond with a JSON object that strictly follows the provided schema.
  `,
  model: openai("gpt-4o-mini"),
  defaultGenerateOptions: {
    output: intentAnalysisOutputSchema,
  },
}); 