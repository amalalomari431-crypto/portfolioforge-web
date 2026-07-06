"use client";

import { useRef, useState } from "react";
import { deleteAsset } from "../../actions";

type Asset = {
  id: string;
  kind: "IMAGE" | "PDF" | "VIDEO";
  fileName: string;
  sizeBytes: number;
  viewUrl: string;
  caption?: string | null;
};

type UploadTask = {
  key: string;
  fileName: string;
  status: "uploading" | "processing" | "failed";
  progress: number; // 0-1
  errorMessage?: string;
  file: File;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CaptionInput({
  assetId,
  initialCaption,
  onCommit,
}: {
  assetId: string;
  initialCaption: string;
  onCommit: (assetId: string, caption: string) => void;
}) {
  const [value, setValue] = useState(initialCaption);
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(assetId, value)}
      placeholder="Add a caption…"
      className="mt-2 w-full rounded border border-ground-line bg-ground-raised/20 px-2 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
    />
  );
}

// Mirrors MediaManagerScreen in Flutter: a real percentage while bytes are
// transferring ("Uploading {percent}%"), an indeterminate state once the
// transfer hits 100% but the row hasn't been created yet ("Processing…"),
// and the same failure copy. Drag-and-drop below is purely an additional
// trigger for the exact same uploadOne()/XHR path — no upload mechanics
// changed.
export function MediaManagerClient({
  projectId,
  initialAssets,
  sectionId,
  onCaptionChange,
}: {
  projectId: string;
  initialAssets: Asset[];
  // When set, uploads made from this instance attach to that Section, and
  // this instance is expected to already be showing a section-filtered
  // asset list (the caller does the filtering when fetching initialAssets).
  sectionId?: string;
  // Only meaningful in a Section context — captions have no purpose on
  // the project-wide Media Library page.
  onCaptionChange?: (assetId: string, caption: string) => void;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const images = assets.filter((a) => a.kind === "IMAGE");
  const pdfs = assets.filter((a) => a.kind === "PDF");
  const videos = assets.filter((a) => a.kind === "VIDEO");

  function uploadOne(file: File) {
    const key = `${file.name}-${Date.now()}-${Math.random()}`;
    setTasks((prev) => [...prev, { key, fileName: file.name, status: "uploading", progress: 0, file }]);

    const formData = new FormData();
    formData.set("file", file);
    if (sectionId) formData.set("sectionId", sectionId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/projects/${projectId}/assets`);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      setTasks((prev) =>
        prev.map((t) => (t.key === key ? { ...t, progress: e.loaded / e.total } : t))
      );
      if (e.loaded >= e.total) {
        setTasks((prev) =>
          prev.map((t) => (t.key === key ? { ...t, status: "processing" } : t))
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const asset = JSON.parse(xhr.responseText) as Asset;
        setAssets((prev) => [...prev, asset]);
        setTasks((prev) => prev.filter((t) => t.key !== key));
      } else {
        let message = "Upload failed";
        try {
          message = JSON.parse(xhr.responseText).error ?? message;
        } catch {}
        setTasks((prev) =>
          prev.map((t) => (t.key === key ? { ...t, status: "failed", errorMessage: message } : t))
        );
      }
    };

    xhr.onerror = () => {
      setTasks((prev) =>
        prev.map((t) => (t.key === key ? { ...t, status: "failed", errorMessage: "Upload failed" } : t))
      );
    };

    xhr.send(formData);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadOne);
  }

  function dismissTask(key: string) {
    setTasks((prev) => prev.filter((t) => t.key !== key));
  }

  function retryTask(key: string, file: File) {
    dismissTask(key);
    uploadOne(file);
  }

  function handleDelete(assetId: string) {
    setIsPending(true);
    deleteAsset(assetId)
      .then(() => setAssets((prev) => prev.filter((a) => a.id !== assetId)))
      .finally(() => setIsPending(false));
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes("Files")) setIsDraggingOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDraggingOver(false);
    }
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex flex-col gap-10"
    >
      {isDraggingOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-ground/90 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-ember px-16 py-12 text-center">
            <p className="font-display text-2xl text-ink italic">Drop to upload</p>
            <p className="mt-1 text-sm text-ink-dim">Images and PDFs, up to 10MB / 20MB</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-ground-line bg-ground-raised/20 px-6 py-5">
        <div>
          <p className="text-ink-dim">Drag files anywhere on this page, or</p>
          <p className="mt-0.5 font-meta text-[0.65rem] tracking-[0.04em] text-ink-faint uppercase">
            Images (JPG, PNG, WebP) up to 10 MB · PDFs up to 20 MB · Videos up to 100 MB
          </p>
        </div>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="rounded-lg bg-gradient-to-r from-ember-soft to-ember px-5 py-2.5 text-sm font-semibold text-[#1a1208] transition-transform hover:scale-[1.02]"
        >
          Choose files
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf,video/mp4,video/webm,video/quicktime"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <div key={task.key} className="rounded-lg border border-ground-line bg-ground-raised/30 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate text-ink">{task.fileName}</span>
                {task.status !== "failed" && (
                  <span className="font-meta text-[0.65rem] text-ink-faint uppercase">
                    {task.status === "uploading" ? `${Math.round(task.progress * 100)}%` : "Processing…"}
                  </span>
                )}
              </div>
              {task.status !== "failed" ? (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ground-line">
                  <div
                    className={
                      task.status === "processing"
                        ? "h-full w-1/3 animate-pulse rounded-full bg-ink-faint"
                        : "h-full rounded-full bg-gradient-to-r from-ember-soft to-ember transition-all"
                    }
                    style={task.status === "uploading" ? { width: `${task.progress * 100}%` } : undefined}
                  />
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm text-amber-500">{task.errorMessage}</span>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => retryTask(task.key, task.file)} className="text-ink hover:text-ember">
                      Retry
                    </button>
                    <button onClick={() => dismissTask(task.key)} className="text-ink-faint hover:text-ink">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {assets.length === 0 && tasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ground-line px-6 py-16 text-center">
          <p className="font-display text-xl text-ink italic">Show this project off</p>
          <p className="text-sm text-ink-dim">
            Add a render or photo of this project — visuals are what visitors remember.
          </p>
          <p className="mt-2 max-w-sm font-meta text-[0.65rem] text-ink-faint uppercase">
            e.g. an exterior render, a site photo, or the project&apos;s PDF drawing set
          </p>
        </div>
      )}

      {images.length > 0 && (
        <section>
          <h2 className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Gallery</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {images.map((asset) => (
              <div key={asset.id} className="flex flex-col">
                <div className="group relative aspect-square overflow-hidden rounded-xl border border-ground-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.viewUrl}
                    alt={asset.fileName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      disabled={isPending}
                      className="m-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-red-500/80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {onCaptionChange && (
                  <CaptionInput assetId={asset.id} initialCaption={asset.caption ?? ""} onCommit={onCaptionChange} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {pdfs.length > 0 && (
        <section>
          <h2 className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">PDF documents</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {pdfs.map((asset) => (
              <div key={asset.id} className="flex flex-col">
                <div className="group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-ground-line bg-ground-raised/30 p-4 text-center transition-colors hover:border-ember-soft">
                  <span className="font-meta text-xs text-ember uppercase">PDF</span>
                  <a href={asset.viewUrl} target="_blank" className="line-clamp-2 text-sm text-ink underline">
                    {asset.fileName}
                  </a>
                  <span className="font-meta text-[0.6rem] text-ink-faint uppercase">{formatSize(asset.sizeBytes)}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    disabled={isPending}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500/80"
                  >
                    Remove
                  </button>
                </div>
                {onCaptionChange && (
                  <CaptionInput assetId={asset.id} initialCaption={asset.caption ?? ""} onCommit={onCaptionChange} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="mb-4 font-meta text-[0.68rem] tracking-[0.1em] text-ink-faint uppercase">Videos</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {videos.map((asset) => (
              <div key={asset.id} className="flex flex-col">
                <div className="group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-ground-line bg-ground-raised/30 p-4 text-center transition-colors hover:border-ember-soft">
                  <span className="font-meta text-xs text-ember uppercase">Video</span>
                  <a href={asset.viewUrl} target="_blank" className="line-clamp-2 text-sm text-ink underline">
                    {asset.fileName}
                  </a>
                  <span className="font-meta text-[0.6rem] text-ink-faint uppercase">{formatSize(asset.sizeBytes)}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    disabled={isPending}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500/80"
                  >
                    Remove
                  </button>
                </div>
                {onCaptionChange && (
                  <CaptionInput assetId={asset.id} initialCaption={asset.caption ?? ""} onCommit={onCaptionChange} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
