import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const generalAgent = new Agent({
  name: "General Purpose Agent",
  description: "A general-purpose agent that can perform various tasks based on dynamic instructions.",
  instructions: "You are a helpful and versatile AI assistant. You will be given specific instructions for each task.",
  model: openai("gpt-4o-mini"),
}); 