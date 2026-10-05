/**
 * Results Page  (/results/[id])
 *
 * Shows one stored research run: live progress while it is running,
 * then the report. Works for past runs and shared links too.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useResearch } from "../../context/ResearchContext";
import { useRun } from "../../hooks/useRun";
import { parseReport } from "../../lib/report";
import { stageMessage, toResearchResult } from "../../lib/run";
import type { ResultsTab } from "../../types";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import ErrorBanner from "../../components/ErrorBanner";
import LiveSessionsGrid from "../../components/LiveSessionsGrid";
import StatusBanner from "../../components/StatusBanner";
import ResearchResults from "../../components/ResearchResults";
import Footer from "../../components/Footer";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const { query, setQuery, isStarting, startError, startResearch } =
    useResearch();
  const { run, loadError, sessionTime } = useRun(id);

  // null = follow the default (Sources while running, Summary once done)
  const [selectedTab, setSelectedTab] = useState<ResultsTab | null>(null);

  const result = useMemo(() => toResearchResult(run), [run]);
  const report = useMemo(
    () => (result ? parseReport(result) : null),
    [result],
  );

  const activeTab = selectedTab ?? (report ? "summary" : "sources");
  const isRunning = run?.status === "running";

  // Show this run's question in the search box.
  const runQuestion = run?.question;

  useEffect(() => {
    if (runQuestion !== undefined) setQuery(runQuestion);
  }, [runQuestion, setQuery]);

  const errorMessage = loadError ?? startError ?? run?.error ?? null;

  return (
    <div className="dot-grid relative flex min-h-screen flex-col overflow-hidden bg-canvas font-sans text-ink">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-8">
          <SearchBar
            query={query}
            setQuery={setQuery}
            isResearching={isRunning || isStarting}
            onSearch={() => startResearch()}
          />
        </div>

        {errorMessage && <ErrorBanner error={errorMessage} />}

        {run && (
          <LiveSessionsGrid
            status={run.status}
            sessionTime={sessionTime}
            questions={run.plan?.questions ?? null}
            queryProgress={run.queryProgress}
          />
        )}

        {run && isRunning && (
          <StatusBanner phase="loading" message={stageMessage(run)} />
        )}
        {run?.status === "done" && (
          <StatusBanner phase="done" message="Research complete!" />
        )}

        {(run || !loadError) && (
          <ResearchResults
            activeTab={activeTab}
            setActiveTab={setSelectedTab}
            report={report}
            query={run?.question ?? ""}
            isResearching={!run || isRunning}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
