"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/auth-shell";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but sign-in failed. Try signing in manually.");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Begin the forge"
      headline="Bring the raw material. We'll do the forging."
      sub="One account, and your portfolio is ready to build."
    >
      <h1 className="mb-8 font-display text-2xl font-medium italic text-ink lg:hidden">
        Create your account
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block font-meta text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input w-full rounded-sm border-b border-ground-line bg-transparent py-2 text-ink transition-colors"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input w-full rounded-sm border-b border-ground-line bg-transparent py-2 text-ink transition-colors"
          />
          <p className="mt-1.5 text-xs text-ink-faint">At least 8 characters.</p>
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-dim">
        Already have an account?{" "}
        <Link href="/signin" className="text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
