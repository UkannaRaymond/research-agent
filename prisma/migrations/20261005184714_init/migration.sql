-- CreateTable
CREATE TABLE "research_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "visitor_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "stage" TEXT,
    "plan" JSONB,
    "query_progress" JSONB NOT NULL DEFAULT '{}',
    "research" JSONB,
    "findings" JSONB,
    "draft" TEXT,
    "citation_validation" JSONB,
    "critique" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "research_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "research_runs_visitor_created_idx" ON "research_runs"("visitor_id", "created_at");
