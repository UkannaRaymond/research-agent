import SourceBadges from "./SourceBadges";

export default function Hero() {
  return (
    <div className="mb-8 text-center">
      <h2 className="hero-title mb-3 text-3xl font-bold sm:text-4xl tracking-tight text-ink">
        Research anything in <span className="text-cyan-500">seconds</span>
      </h2>
      <p className="hero-subtitle mx-auto mb-6 max-w-xl text-base sm:text-lg text-ink-muted">
        Ask a question and let AI research multiple sources, analyze the
        findings, and produce a cited report.
      </p>
      <SourceBadges />
    </div>
  );
}
