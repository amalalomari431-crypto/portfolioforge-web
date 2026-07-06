import Link from "next/link";
import { SignOutButton } from "@/app/dashboard/sign-out-button";

export function AppTopNav({ userLabel }: { userLabel: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ground-line bg-ground/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3.5 sm:px-8">
        <Link href="/dashboard" className="font-display text-base text-ink italic">
          Portfolio<span className="text-ember">Forge</span>
        </Link>
        <div className="flex items-center gap-5">
          <span className="hidden font-meta text-[0.68rem] tracking-[0.06em] text-ink-faint uppercase sm:inline">
            {userLabel}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
