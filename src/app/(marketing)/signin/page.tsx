"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/auth-shell";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Continue forging your portfolio."
      sub="Your work is exactly where you left it."
    >
      <h1 className="mb-8 font-display text-2xl font-medium italic text-ink lg:hidden">
        Sign in
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input w-full rounded-sm border-b border-ground-line bg-transparent py-2 text-ink transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input w-full rounded-sm border-b border-ground-line bg-transparent py-2 text-ink transition-colors"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-amber-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-sm bg-gradient-to-r from-ember-soft to-ember px-4 py-3 font-editorial text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-dim">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-ink underline underline-offset-4">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
