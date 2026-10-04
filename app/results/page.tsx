/**
 * Results Page
 *
 * Shows the research queries, status, and the report.
 * Reads state from ResearchContext.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useResearch } from "../context/ResearchContext";
import { parseReport } from "../lib/report";
import type { ResultsTab } from "../types";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ErrorBanner from "../components/ErrorBanner";
import LiveSessionsGrid from "../components/LiveSessionsGrid";
import StatusBanner from "../components/StatusBanner";
import ResearchResults from "../components/ResearchResults";
import Footer from "../components/Footer";

export default function Results() {
  const router = useRouter();
  const {
    query,
    setQuery,
    status,
    isResearching,
    result,
    error,
    sessionTime,
    startResearch,
  } = useResearch();

  // null = follow the default (Sources while researching, Summary once done)
  const [selectedTab, setSelectedTab] = useState<ResultsTab | null>(null);

  const report = useMemo(
    () => (result ? parseReport(result) : null),
    [result],
  );

  const activeTab = selectedTab ?? (report ? "summary" : "sources");

  // Nothing to show (e.g. page reloaded): go back to the landing page.
  useEffect(() => {
    if (status === "idle" && !query) {
      router.replace("/");
    }
  }, [status, query, router]);

  const handleSearch = () => {
    setSelectedTab(null);
    void startResearch();
  };

  return (
    <div className="dot-grid relative flex min-h-screen flex-col overflow-hidden bg-canvas font-sans text-ink">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-8">
          <SearchBar
            query={query}
            setQuery={setQuery}
            isResearching={isResearching}
            onSearch={handleSearch}
          />
        </div>

        {error && <ErrorBanner error={error} />}

        {status !== "idle" && (
          <LiveSessionsGrid
            status={status}
            sessionTime={sessionTime}
            result={result}
          />
        )}

        {status === "loading" && (
          <StatusBanner
            phase="loading"
            message="Researching across multiple sources…"
          />
        )}
        {status === "done" && (
          <StatusBanner phase="done" message="Research complete!" />
        )}

        <ResearchResults
          activeTab={activeTab}
          setActiveTab={setSelectedTab}
          report={report}
          query={query}
          isResearching={isResearching}
        />
      </main>

      <Footer />
    </div>
  );
}
