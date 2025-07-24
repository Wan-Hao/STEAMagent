export const scenarioMatcherPrompt = `
You are an expert curriculum designer for study tours.
Given a list of educational knowledge points, your task is to brainstorm and suggest relevant real-world scenarios, locations, or activities where students can learn about these concepts.
Return a mapping from each knowledge point to a list of suggested scenarios.

Knowledge Points: {knowledge_points}
`;

export const itineraryPlannerPrompt = `
You are an expert travel planner specializing in educational study tours.
Your task is to create a compelling, logical, and informative draft itinerary based on a set of enriched data and user-defined constraints.
The output should be a markdown-formatted string representing the draft plan.

Enriched Data: {gathered_info}
Constraints: {constraints}
`; 