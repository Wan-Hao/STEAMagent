import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";

import { steamAgent } from "./agents";
import { studyTourWorkflow } from "./workflows/study-tour";
import { vectorStore } from "../rag/vector-store";

export const mastra = new Mastra({
  agents: {
    steamAgent,
  },
  workflows: {
    studyTourWorkflow,
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
