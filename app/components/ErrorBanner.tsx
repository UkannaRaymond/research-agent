interface ErrorBannerProps {
  error: string;
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <div className="mb-6 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600">
      <strong>Error:</strong> {error}
    </div>
  );
}
