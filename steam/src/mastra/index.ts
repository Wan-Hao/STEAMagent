import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";

import { generalAgent } from "./agents";
import { generalWorkflow } from "./workflows";
import { queryKnowledgeBase, graphRagTool } from "./tools";
import { vectorStore } from "../rag/vector-store";

export const mastra = new Mastra({
  agents: {
    generalAgent,
  },
  workflows: {
    generalWorkflow,
  },
  vectors: {
    postgres: vectorStore,
  },
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
