import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  generalAgent,
  intentAnalysisAgent,
  intentAnalysisOutputSchema,
} from "../agents";
import {
  queryKnowledgeBase,
  queryKnowledgeScenarios,
  graphRagTool,
} from "../tools";
import { RuntimeContext } from "@mastra/core/di";
import {
  itineraryPlannerPrompt,
} from "../prompts/study-tour";

// --- Step Definitions ---

// Step 1: Analyze User Intent (using an Agent)
const analyzeIntentStep = createStep({
  id: "analyzeIntent",
  description:
    "Analyzes the user's initial query to determine if it's scenario-driven or knowledge-driven.",
  inputSchema: z.object({
    prompt: z.string().describe("User's initial request for a study tour."),
  }),
  outputSchema: intentAnalysisOutputSchema,
  execute: async ({ inputData }) => {
    const { prompt } = inputData;
    const { object } = await intentAnalysisAgent.generate(
      [{ role: "user", content: prompt }],
      { output: intentAnalysisOutputSchema }
    );

    if (!object) {
      throw new Error(
        "Intent analysis agent did not return a structured output."
      );
    }

    return object;
  },
});

// Step 2: Gather and Synthesize Information
const gatherAndSynthesizeInfoStep = createStep({
  id: "gatherAndSynthesizeInfo",
  description:
    "Gathers and synthesizes information from knowledge scenarios, knowledge base, and knowledge graph.",
  inputSchema: z.object({
    intent: z.string(),
    entity: z.string(),
    original_query: z.string(),
  }),
  outputSchema: z.object({
    synthesized_info: z
      .string()
      .describe("A synthesized summary of all gathered information."),
  }),
  execute: async ({ inputData }) => {
    const { intent, entity, original_query } = inputData;
    let current_query = entity;
    let context_info = "";

    // 1. Query Scenarios
    const scenarios = await queryKnowledgeScenarios.execute({
      context: { queryText: current_query, topK: 5 },
      runtimeContext: new RuntimeContext(),
    });
    
    if (Array.isArray(scenarios) && scenarios.length > 0) {
      context_info += `\n\nRelevant Scenarios for ${entity}:\n${scenarios
        .map((s: any) => s.content)
        .join("\n")}`;
      
      // Summarize scenarios to feed into next query
      const scenariosSummaryPrompt = `
        Based on these scenarios about "${entity}":
        ${scenarios.map((s: any) => s.content).join("\n")}
        
        Provide a concise summary focusing on the key concepts and relationships.
      `;
      
      const { object: scenariosSummaryObject } = await generalAgent.generate(
        [{ role: "user", content: scenariosSummaryPrompt }],
        {
          output: z.object({
            summary: z.string().describe("A concise summary of the scenarios"),
          }),
        }
      );
      
      if (scenariosSummaryObject) {
        current_query = scenariosSummaryObject.summary;
      }
    }

    // 2. Query Knowledge Base with updated query
    const knowledgePoints = await queryKnowledgeBase.execute({
      context: { queryText: current_query, topK: 5 },
      runtimeContext: new RuntimeContext(),
    });
    
    if (Array.isArray(knowledgePoints) && knowledgePoints.length > 0) {
      context_info += `\n\nCore Knowledge Points for ${entity}:\n${knowledgePoints
        .map((k: any) => k.content)
        .join("\n")}`;
      
      // Summarize knowledge points to feed into graph query
      const knowledgePointsSummaryPrompt = `
        Based on these knowledge points:
        ${knowledgePoints.map((k: any) => k.content).join("\n")}
        
        And considering what we know about "${entity}" from scenarios,
        provide a concise summary highlighting the main concepts and their relationships.
      `;
      
      const { object: knowledgeSummaryObject } = await generalAgent.generate(
        [{ role: "user", content: knowledgePointsSummaryPrompt }],
        {
          output: z.object({
            summary: z.string().describe("A concise summary of the knowledge points"),
          }),
        }
      );
      
      if (knowledgeSummaryObject) {
        current_query = knowledgeSummaryObject.summary;
      }
    }

    // 3. Query Knowledge Graph with further refined query
    if (Array.isArray(knowledgePoints) && knowledgePoints.length > 0) {
      const graphResult = await graphRagTool.execute({
        context: { queryText: `Connections for: ${current_query}`, topK: 5 },
        runtimeContext: new RuntimeContext(),
      });
      
      if (graphResult.response) {
        context_info += `\n\nKnowledge Graph Connections:\n${graphResult.response}`;
      }
    }

    // 4. Synthesize with General Model
    const synthesisPrompt = `
      Original User Query: "${original_query}"
      Based on the following collected information, please provide a comprehensive summary that can be used to create a study tour plan.
      Information:
      ${context_info}
      
      Synthesize the above into a clear, structured background material document.
    `;

    const { object } = await generalAgent.generate(
      [{ role: "user", content: synthesisPrompt }],
      {
        output: z.object({
          synthesized_info: z
            .string()
            .describe(
              "A synthesized summary of all gathered information in markdown format."
            ),
        }),
      }
    );

    if (!object) {
      throw new Error("Synthesis agent did not return a structured output.");
    }

    return object;
  },
});

// Step 3: Draft Itinerary
const draftItineraryStep = createStep({
  id: "draftItinerary",
  description:
    "Creates a draft itinerary based on the gathered information and user constraints.",
  inputSchema: z.object({
    synthesized_info: z
      .string()
      .describe("Combined info from previous steps."),
    constraints: z
      .object({
        days: z.number().optional(),
        budget: z.string().optional(),
      })
      .optional(),
  }),
  outputSchema: z.object({
    draft_plan: z
      .string()
      .describe("A high-level draft of the study tour plan."),
  }),
  execute: async ({ inputData }) => {
    const { synthesized_info, constraints } = inputData;
    const prompt = itineraryPlannerPrompt
      .replace("{gathered_info}", synthesized_info)
      .replace("{constraints}", JSON.stringify(constraints));
    const { object } = await generalAgent.generate(
      [{ role: "user", content: prompt }],
      {
        output: z.object({
          draft_plan: z
            .string()
            .describe(
              "A high-level draft of the study tour plan in markdown format."
            ),
        }),
      }
    );
    if (!object) {
      throw new Error(
        "Itinerary planner agent did not return a structured output."
      );
    }
    return object;
  },
});

// Step 4: Parse Draft Plan into Daily Segments
const parseDraftPlanStep = createStep({
  id: "parseDraftPlan",
  description: "Parses the draft plan into individual day segments for detailed planning.",
  inputSchema: z.object({
    draft_plan: z.string(),
  }),
  outputSchema: z.array(z.object({
    day_number: z.number(),
    daily_draft: z.string(),
    full_draft: z.string(),
  })),
  execute: async ({ inputData }) => {
    const { draft_plan } = inputData;
    
    // A simple heuristic to split the draft plan by days
    // This might need to be made more robust depending on the draft format
    const daySegments = draft_plan
      .split(/Day\s+\d+:/i)
      .map(segment => segment.trim())
      .filter(Boolean);
    
    return daySegments.map((segment, index) => ({
      day_number: index + 1,
      daily_draft: segment,
      full_draft: draft_plan,
    }));
  },
});

// Step 5: Refine Single Day Plan
const refineDailyPlanStep = createStep({
  id: "refineDailyPlan",
  description: "Refines a single day's draft plan into a detailed schedule.",
  inputSchema: z.object({
    day_number: z.number(),
    daily_draft: z.string(),
    full_draft: z.string(),
  }),
  outputSchema: z.object({
    detailed_day_plan: z.string().describe("The detailed plan for the specific day."),
    day_number: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { daily_draft, full_draft, day_number } = inputData;
    const prompt = `
      Based on the overall draft plan below:
      ---
      ${full_draft}
      ---
      Now, create a very detailed schedule for Day ${day_number}. The plan for this day is: "${daily_draft}".
      Include specific locations, activity times, and logistical details (e.g., transportation, booking information).
      If necessary, you can use web search to find practical information like opening hours or ticket prices.
    `;

    const { object } = await generalAgent.generate(
      [{ role: "user", content: prompt }],
      {
        output: z.object({
          detailed_day_plan: z
            .string()
            .describe("The detailed plan for the specific day in markdown."),
        }),
      }
    );

    if (!object) {
      throw new Error("Daily refinement agent failed to produce output.");
    }
    
    // Return both the detailed plan and the day number for later sorting
    return {
      detailed_day_plan: object.detailed_day_plan,
      day_number
    };
  },
});

// Step 6: Combine Detailed Daily Plans
const combinePlansStep = createStep({
  id: "combinePlans",
  description: "Combines all detailed daily plans into a final comprehensive plan.",
  inputSchema: z.array(z.object({
    detailed_day_plan: z.string(),
    day_number: z.number(),
  })),
  outputSchema: z.object({
    final_plan: z.string().describe("The final, detailed study tour plan."),
  }),
  execute: async ({ inputData }) => {
    // Sort plans by day number to ensure correct order
    const sortedPlans = [...inputData].sort((a, b) => a.day_number - b.day_number);
    
    const combinedPlan = sortedPlans.map(plan => 
      `## Day ${plan.day_number}:\n${plan.detailed_day_plan}`
    ).join("\n\n");
    
    return { 
      final_plan: `# Detailed Study Tour Plan\n\n${combinedPlan}` 
    };
  },
});

export const studyTourWorkflow = createWorkflow({
  id: "study-tour-planning-workflow",
  description:
    "A comprehensive workflow to plan a study tour from intent analysis to a final detailed plan.",
  inputSchema: z.object({
    query: z.string().describe("User's initial request for a study tour."),
    constraints: z
      .object({
        days: z.number().optional(),
        budget: z.string().optional(),
      })
      .optional(),
  }),
  outputSchema: z.object({
    final_plan: z.string().describe("The final, detailed study tour plan."),
  }),
})
  .map(async ({ getInitData }) => ({
    prompt: getInitData().query,
  }))
  .then(analyzeIntentStep)
  .map(async ({ getStepResult, getInitData }) => ({
    intent: getStepResult(analyzeIntentStep).intent,
    entity: getStepResult(analyzeIntentStep).extracted_entity,
    original_query: getInitData().query,
  }))
  .then(gatherAndSynthesizeInfoStep)
  .map(async ({ getStepResult, getInitData }) => ({
    synthesized_info: getStepResult(gatherAndSynthesizeInfoStep)
      .synthesized_info,
    constraints: getInitData().constraints,
  }))
  .then(draftItineraryStep)
  .map(async ({ getStepResult }) => ({
    draft_plan: getStepResult(draftItineraryStep).draft_plan,
  }))
  .then(parseDraftPlanStep)
  .foreach(refineDailyPlanStep)
  .then(combinePlansStep)
  .commit(); 