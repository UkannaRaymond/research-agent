"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface ResearchContextType {
  /** Text in the search box (shared by the landing and results pages). */
  query: string;
  setQuery: (query: string) => void;
  /** True while the request that creates a run is in flight. */
  isStarting: boolean;
  startError: string | null;
  /** Creates a run and opens its page, /results/[id]. */
  startResearch: (searchQuery?: string) => Promise<void>;
}

const ResearchContext = createContext<ResearchContextType | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  // State updates are async, so a fast double click would pass an isStarting check.
  const startingRef = useRef(false);

  const startResearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();

    if (!q || startingRef.current) return;

    startingRef.current = true;
    setQuery(q);
    setIsStarting(true);
    setStartError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.id) {
        throw new Error(data?.error ?? "Could not start the research");
      }

      router.push(`/results/${data.id}`);
    } catch (error) {
      setStartError(
        error instanceof Error ? error.message : "Could not start the research",
      );
    } finally {
      startingRef.current = false;
      setIsStarting(false);
    }
  };

  return (
    <ResearchContext.Provider
      value={{ query, setQuery, isStarting, startError, startResearch }}
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
