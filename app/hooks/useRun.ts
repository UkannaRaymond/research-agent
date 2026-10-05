"use client";

import { useEffect, useState } from "react";
import type { Run } from "../types";

const POLL_MS = 2500;
const MAX_CONSECUTIVE_FAILURES = 5;

/**
 * Loads a run and keeps it up to date while it is running.
 * Progress lives in the database, so this also works after a page refresh.
 */
export function useRun(id: string) {
  const [run, setRun] = useState<Run | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let paused = false;

    // Poll only while the tab is visible.
    function schedule(ms: number) {
      timer = setTimeout(() => {
        if (document.hidden) {
          paused = true;
        } else {
          void load();
        }
      }, ms);
    }

    function onVisibilityChange() {
      if (paused && !document.hidden && !cancelled) {
        paused = false;
        void load();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    async function load() {
      try {
        const response = await fetch(`/api/runs/${id}`, { cache: "no-store" });

        if (cancelled) return;

        if (response.status === 404) {
          setLoadError("This research could not be found.");
          return;
        }

        if (!response.ok) throw new Error("Request failed");

        const data = (await response.json()) as Run;

        if (cancelled) return;

        failures = 0;
        setRun(data);
        setFetchedAt(Date.now());

        if (data.status === "running") {
          schedule(POLL_MS);
        }
      } catch {
        if (cancelled) return;

        failures += 1;

        if (failures >= MAX_CONSECUTIVE_FAILURES) {
          setLoadError("Lost connection to the server. Refresh to try again.");
          return;
        }

        schedule(POLL_MS * 2);
      }
    }

    void load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [id]);

  // Tick every second while running so the timer moves between polls.
  const isRunning = run?.status === "running";

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const sessionTime = run
    ? run.elapsedSeconds +
      (isRunning && now > fetchedAt ? Math.floor((now - fetchedAt) / 1000) : 0)
    : 0;

  return { run, loadError, sessionTime };
}
