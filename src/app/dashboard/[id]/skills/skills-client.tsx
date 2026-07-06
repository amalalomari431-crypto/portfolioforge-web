"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSkill, updateSkill, deleteSkill } from "./actions";
import { OverflowMenu } from "@/components/dashboard/overflow-menu";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

type SkillRow = {
  id: string;
  name: string;
  level: string | null;
};

function SkillForm({
  initial,
  onCancel,
  onSubmit,
  isPending,
}: {
  initial: { name: string; level: string };
  onCancel: () => void;
  onSubmit: (data: { name: string; level: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const [level, setLevel] = useState(initial.level);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, level });
      }}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-ember-soft/40 bg-ground-raised/20 p-4"
    >
      <div className="flex-1">
        <label className="mb-1.5 block font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Skill</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Blender"
          className="w-full rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-meta text-[0.62rem] tracking-[0.06em] text-ink-faint uppercase">Level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-lg border border-ground-line bg-ground-raised/30 px-3 py-2 text-sm text-ink focus:border-ember focus:outline-none"
        >
          <option value="">—</option>
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
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

export function SkillsClient({ portfolioId, initialSkills }: { portfolioId: string; initialSkills: SkillRow[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SkillRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(data: { name: string; level: string }) {
    startTransition(async () => {
      await createSkill(portfolioId, { name: data.name, level: data.level || null });
      setIsAdding(false);
      router.refresh();
    });
  }

  function handleUpdate(skillId: string, data: { name: string; level: string }) {
    startTransition(async () => {
      await updateSkill(skillId, { name: data.name, level: data.level || null });
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      await deleteSkill(target.id);
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
          + Add skill
        </button>
      )}
      {isAdding && (
        <SkillForm
          initial={{ name: "", level: "" }}
          onCancel={() => setIsAdding(false)}
          onSubmit={handleCreate}
          isPending={isPending}
        />
      )}

      {initialSkills.length === 0 && !isAdding ? (
        <p className="text-sm text-ink-faint">No skills added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {initialSkills.map((skill) =>
            editingId === skill.id ? (
              <SkillForm
                key={skill.id}
                initial={{ name: skill.name, level: skill.level ?? "" }}
                onCancel={() => setEditingId(null)}
                onSubmit={(data) => handleUpdate(skill.id, data)}
                isPending={isPending}
              />
            ) : (
              <div
                key={skill.id}
                className="flex items-center justify-between rounded-xl border border-ground-line bg-gradient-to-b from-ground-raised/40 to-transparent px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-editorial text-ink">{skill.name}</span>
                  {skill.level && (
                    <span className="rounded-full border border-ground-line px-2.5 py-0.5 text-xs text-ink-dim">
                      {skill.level}
                    </span>
                  )}
                </div>
                <OverflowMenu
                  actions={[
                    { label: "Edit", onClick: () => setEditingId(skill.id) },
                    { label: "Delete", onClick: () => setDeleteTarget(skill), danger: true },
                  ]}
                />
              </div>
            )
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        body="This removes the skill from your portfolio. This can't be undone."
        confirmLabel="Delete"
        danger
        isPending={isPending}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
