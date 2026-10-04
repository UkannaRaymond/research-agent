"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ResearchResult, ResearchStatus } from "../types";

// A full run can take several minutes on slow models.
const REQUEST_TIMEOUT_MS = 10 * 60 * 1000;

interface ResearchContextType {
  query: string;
  setQuery: (query: string) => void;
  status: ResearchStatus;
  isResearching: boolean;
  result: ResearchResult | null;
  error: string | null;
  sessionTime: number;
  startResearch: (searchQuery?: string) => Promise<void>;
}

const ResearchContext = createContext<ResearchContextType | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ResearchStatus>("idle");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const isResearching = status === "loading";

  // Session timer: counts up while research runs, then holds its value.
  useEffect(() => {
    if (status !== "loading") return;

    const startedAt = Date.now();
    const id = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [status]);

  const startResearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;

    // A newer run replaces any run still in flight.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setQuery(q);
    setStatus("loading");
    setResult(null);
    setError(null);
    setSessionTime(0);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Research failed");
      }

      if (abortRef.current !== controller) return;

      setResult(data as ResearchResult);
      setStatus("done");
    } catch (err) {
      // Superseded by a newer run: ignore.
      if (abortRef.current !== controller) return;

      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Research timed out. Try again or use a faster model."
          : err instanceof Error
            ? err.message
            : "Research failed",
      );
      setStatus("error");
    } finally {
      clearTimeout(timeout);
    }
  };

  return (
    <ResearchContext.Provider
      value={{
        query,
        setQuery,
        status,
        isResearching,
        result,
        error,
        sessionTime,
        startResearch,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const context = useContext(ResearchContext);

  if (!context) {
    throw new Error("useResearch must be used within a ResearchProvider");
  }

  return context;
}
