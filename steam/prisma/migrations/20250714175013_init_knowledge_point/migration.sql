-- CreateTable
CREATE TABLE "KnowledgePoint" (
    "id" SERIAL NOT NULL,
    "content" TEXT,
    "embedding" vector(1536),
    "metadata" JSONB,

    CONSTRAINT "KnowledgePoint_pkey" PRIMARY KEY ("id")
);
