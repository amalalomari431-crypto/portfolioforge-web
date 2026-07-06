"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type OverflowMenuAction = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

// Rendered through a portal into document.body rather than positioned
// relative to its own trigger. Card grids clip their cards with
// overflow-hidden (for rounded cover images) and Framer Motion's `transform`
// gives every card its own stacking context — either one alone is enough to
// clip or bury a plain absolutely-positioned dropdown behind/under a
// neighboring card. A portal escapes both problems at the source instead of
// patching each call site.
export function OverflowMenu({
  actions,
  isPending,
}: {
  actions: OverflowMenuAction[];
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Flip above the trigger when there isn't enough room below — with
      // longer action lists (this menu now runs up to 8 items on the
      // Portfolio Library) a trigger in a lower card row would otherwise
      // render a dropdown whose tail is off-screen.
      const estimatedMenuHeight = actions.length * 41 + 2;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < estimatedMenuHeight + 8 && rect.top > estimatedMenuHeight + 8;
      setPosition({
        top: openUpward ? rect.top - estimatedMenuHeight - 4 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    updatePosition();

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onDismiss() {
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    // capture: true — scroll on a nested scrollable ancestor doesn't bubble
    // to window, but it does fire in the capture phase.
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, actions.length]);

  function act(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isPending}
        className="rounded-lg px-2 py-1 text-lg text-ink-faint transition-colors hover:bg-ground-line hover:text-ink disabled:opacity-50"
      >
        ⋮
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: position.top, right: position.right }}
            className="z-50 w-48 overflow-hidden rounded-lg border border-ground-line bg-ground-raised shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
          >
            {actions.map((a) => (
              <button
                key={a.label}
                role="menuitem"
                onClick={() => act(a.onClick)}
                className={
                  a.danger
                    ? "block w-full border-t border-ground-line px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
                    : "block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-ground-line"
                }
              >
                {a.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
