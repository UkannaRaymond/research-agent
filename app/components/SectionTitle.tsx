import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  /** Tailwind background class for the small accent bar, e.g. "bg-cyan-500". */
  barClassName: string;
}

export default function SectionTitle({
  children,
  barClassName,
}: SectionTitleProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className={`h-5 w-1 rounded-full ${barClassName}`} />
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
        {children}
      </h2>
    </div>
  );
}
