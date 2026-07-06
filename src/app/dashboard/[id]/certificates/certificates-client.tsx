"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCertificate, updateCertificate, deleteCertificate, type CertificateDraft } from "./actions";
import { OverflowMenu } from "@/components/dashboard/overflow-menu";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

type CertificateRow = {
  id: string;
  title: string;
  issuer: string | null;
  issueDate: string | null; // ISO date
  credentialUrl: string | null;
};

function CertificateForm({
  initial,
  onCancel,
  onSubmit,
  isPending,
}: {
  initial: CertificateDraft;
  onCancel: () => void;
  onSubmit: (data: CertificateDraft) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial.title);
  const [issuer, setIssuer] = useState(initial.issuer);
  const [issueDate, setIssueDate] = useState(initial.issueDate);
  const [credentialUrl, setCredentialUrl] = useState(initial.credentialUrl);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, issuer, issueDate, credentialUrl });
      }}
      className="flex flex-col gap-3 rounded-xl border border-ember-soft/40 bg-ground-raised/20 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AutoCAD Certified Professional"
            className="w-full rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Issuer</label>
          <input
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. Autodesk"
            className="w-full rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Issue date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Credential URL</label>
          <input
            type="url"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="rounded-lg bg-gradient-to-r from-ember-soft to-ember px-4 py-2 text-sm font-semibold text-[#1a1208] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-ground-line px-4 py-2 text-sm text-ink-dim hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CertificatesClient({
  portfolioId,
  initialCertificates,
}: {
  portfolioId: string;
  initialCertificates: CertificateRow[];
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertificateRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(data: CertificateDraft) {
    startTransition(async () => {
      await createCertificate(portfolioId, data);
      setIsAdding(false);
      router.refresh();
    });
  }

  function handleUpdate(certificateId: string, data: CertificateDraft) {
    startTransition(async () => {
      await updateCertificate(certificateId, data);
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      await deleteCertificate(target.id);
      router.refresh();
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {!isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="self-start rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
        >
          + Add certificate
        </button>
      )}
      {isAdding && (
        <CertificateForm
          initial={{ title: "", issuer: "", issueDate: "", credentialUrl: "" }}
          onCancel={() => setIsAdding(false)}
          onSubmit={handleCreate}
          isPending={isPending}
        />
      )}

      {initialCertificates.length === 0 && !isAdding ? (
        <p className="text-sm text-ink-faint">No certificates added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {initialCertificates.map((cert) =>
            editingId === cert.id ? (
              <CertificateForm
                key={cert.id}
                initial={{
                  title: cert.title,
                  issuer: cert.issuer ?? "",
                  issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : "",
                  credentialUrl: cert.credentialUrl ?? "",
                }}
                onCancel={() => setEditingId(null)}
                onSubmit={(data) => handleUpdate(cert.id, data)}
                isPending={isPending}
              />
            ) : (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/40 to-transparent px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-editorial text-ink">{cert.title}</p>
                  <p className="font-meta text-[0.62rem] tracking-[0.04em] text-ink-faint uppercase">
                    {[cert.issuer, cert.issueDate ? new Date(cert.issueDate).getFullYear() : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      className="font-meta text-[0.65rem] tracking-[0.06em] text-ember uppercase hover:underline"
                    >
                      View →
                    </a>
                  )}
                  <OverflowMenu
                    actions={[
                      { label: "Edit", onClick: () => setEditingId(cert.id) },
                      { label: "Delete", onClick: () => setDeleteTarget(cert), danger: true },
                    ]}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        body="This removes the certificate from your portfolio. This can't be undone."
        confirmLabel="Delete"
        danger
        isPending={isPending}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
