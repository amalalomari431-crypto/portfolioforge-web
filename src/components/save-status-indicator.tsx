"use client";

// Mirrors lib/shared/widgets/save_status_indicator.dart — there is no Save
// button anywhere in the product; every field change autosaves, and this
// is the only feedback the user gets about it.
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-700">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
        Saved
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-sm text-red-700">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M18 10A8 8 0 112 10a8 8 0 0116 0zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z"
          clipRule="evenodd"
        />
      </svg>
      Not saved — check connection
    </span>
  );
}
