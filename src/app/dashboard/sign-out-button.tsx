"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="font-meta text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase hover:text-ember"
    >
      Sign out
    </button>
  );
}
