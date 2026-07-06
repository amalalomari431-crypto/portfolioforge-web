import Link from "next/link";

export function Nav({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ground-line/80 bg-ground/75 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8"
      >
        <Link href="/" className="font-display text-base italic text-ink">
          Portfolio<span className="text-ember">Forge</span>
        </Link>

        <div className="hidden items-center gap-8 font-meta text-[0.72rem] tracking-[0.08em] text-ink-dim uppercase md:flex">
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#philosophy" className="transition-colors hover:text-ink">
            Philosophy
          </a>
          <a href="#showcase" className="transition-colors hover:text-ink">
            Showcase
          </a>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-sm border border-ember-soft px-4 py-2 font-meta text-[0.72rem] tracking-[0.06em] text-ember uppercase transition-colors hover:bg-ember/10"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden font-meta text-[0.72rem] tracking-[0.06em] text-ink-dim uppercase transition-colors hover:text-ink sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm bg-gradient-to-r from-ember-soft to-ember px-4 py-2 font-editorial text-[0.8rem] font-medium text-[#1a1208] transition-transform hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
