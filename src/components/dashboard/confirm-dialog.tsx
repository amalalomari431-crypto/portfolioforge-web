"use client";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger = false,
  isPending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ground/80 px-6 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-ground-line bg-ground-raised p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <h2 id="confirm-dialog-title" className="font-display text-xl font-medium text-ink italic">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-dim">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-ground-line px-4 py-2 text-sm text-ink transition-colors hover:border-ember-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={
              danger
                ? "rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                : "rounded-lg bg-gradient-to-r from-ember-soft to-ember px-4 py-2 text-sm font-semibold text-[#1a1208] disabled:opacity-60"
            }
          >
            {isPending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
