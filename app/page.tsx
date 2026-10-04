/**
 * Home Page
 *
 * Landing page with the search interface. Starts research and
 * navigates to /results.
 */

"use client";

import { useRouter } from "next/navigation";
import { useResearch } from "./context/ResearchContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import ExampleQueries from "./components/ExampleQueries";
import Footer from "./components/Footer";

export default function Home() {
  const router = useRouter();
  const { query, setQuery, isResearching, startResearch } = useResearch();

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;

    // State is set synchronously, so /results never sees an empty query.
    void startResearch(q);
    router.push("/results");
  };

  return (
    <div className="dot-grid relative flex min-h-screen flex-col overflow-hidden bg-canvas font-sans text-ink">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute right-20 top-40 h-96 w-96 rounded-full bg-azure/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-leaf/5 blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-[12vh] sm:px-6 sm:pt-[20vh]">
        <Hero />

        <div className="hero-search">
          <SearchBar
            query={query}
            setQuery={setQuery}
            isResearching={isResearching}
            onSearch={() => handleSearch()}
          />
          <ExampleQueries onSelect={(example) => handleSearch(example)} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
