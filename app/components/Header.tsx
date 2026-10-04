import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[rgba(19,19,19,0.08)] px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="text-xl font-semibold">
          <Link href="/">AI Research Agent</Link>
        </h1>
      </div>
    </header>
  );
}
