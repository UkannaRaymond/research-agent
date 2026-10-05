import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-[rgba(19,19,19,0.08)] px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="text-xl font-semibold">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-lg"
              priority
            />
            <span>AI Research Agent</span>
          </Link>
        </h1>
        <Link
          href="/history"
          className="text-sm text-ink-muted transition-colors hover:text-cyan-500"
        >
          History
        </Link>
      </div>
    </header>
  );
}
