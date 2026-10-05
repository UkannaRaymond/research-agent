/**
 * History Page  (/history)
 *
 * The current browser's past research, newest first.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RunSummary } from "../types";
import Header from "../components/Header";
import ErrorBanner from "../components/ErrorBanner";
import RunListItem from "../components/RunListItem";
import Footer from "../components/Footer";

export default function History() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/runs", { cache: "no-store" });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error ?? "Could not load history.");
        }

        if (!cancelled) setRuns(data.runs as RunSummary[]);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load history.");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this research?")) return;

    try {
      const response = await fetch(`/api/runs/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Could not delete this research.");

      setRuns((current) => current?.filter((run) => run.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  return (
    <div className="dot-grid relative flex min-h-screen flex-col overflow-hidden bg-canvas font-sans text-ink">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">History</h2>
          <Link
            href="/"
            className="rounded-md border border-cyan-500 bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
          >
            New research
          </Link>
        </div>

        {error && <ErrorBanner error={error} />}

        {runs === null && !error ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-sm bg-fill" />
            ))}
          </div>
        ) : runs && runs.length > 0 ? (
          <ul className="space-y-3">
            {runs.map((run) => (
              <RunListItem key={run.id} run={run} onDelete={handleDelete} />
            ))}
          </ul>
        ) : runs ? (
          <div className="rounded-sm border border-line bg-white p-8 text-center text-sm text-ink-faint">
            No research yet. Your past research will appear here.
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
