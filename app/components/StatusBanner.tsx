interface StatusBannerProps {
  phase: "loading" | "done";
  message: string;
}

export default function StatusBanner({ phase, message }: StatusBannerProps) {
  const done = phase === "done";

  return (
    <div
      role="status"
      className={`mb-6 flex items-center gap-3 rounded-sm px-4 py-3 ${
        done
          ? "border border-leaf/30 bg-leaf/20"
          : "border border-azure/30 bg-azure/10"
      }`}
    >
      {done ? (
        <svg
          className="h-5 w-5 text-leaf"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <div className="h-2 w-2 animate-pulse rounded-full bg-azure" />
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
}
