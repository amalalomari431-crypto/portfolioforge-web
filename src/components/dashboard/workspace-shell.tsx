"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type WorkspaceNavItem = {
  label: string;
  href: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function WorkspaceShell({
  backHref,
  backLabel,
  title,
  subtitle,
  navItems,
  children,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  navItems: WorkspaceNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col xl:flex-row">
      <aside className="flex w-full flex-none flex-col gap-6 border-b border-ground-line px-6 py-8 xl:sticky xl:top-[57px] xl:h-[calc(100vh-57px)] xl:w-60 xl:overflow-y-auto xl:border-r xl:border-b-0">
        <div>
          <Link
            href={backHref}
            className="font-meta text-[0.68rem] tracking-[0.06em] text-ink-faint uppercase hover:text-ember"
          >
            {backLabel}
          </Link>
          <p className="mt-3 truncate font-display text-lg font-medium text-ink italic">{title}</p>
          {subtitle && (
            <p className="mt-0.5 font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">
              {subtitle}
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            if (item.disabled) {
              return (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  aria-disabled="true"
                  title={item.disabledReason}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ink-faint"
                >
                  {item.label}
                  <span className="font-meta text-[0.55rem] tracking-[0.06em] uppercase">Soon</span>
                </button>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  isActive
                    ? "rounded-lg bg-ember/10 px-3 py-2 text-sm font-medium text-ember"
                    : "rounded-lg px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-ground-line/50 hover:text-ink"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
