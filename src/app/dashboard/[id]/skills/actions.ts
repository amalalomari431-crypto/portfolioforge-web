"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortfolioOwner, requireSkillOwner } from "@/lib/authz";
import { validateRequiredText, MAX_SKILL_NAME_LENGTH } from "@/lib/validators";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

export async function createSkill(
  portfolioId: string,
  data: { name: string; level: string | null }
) {
  await requirePortfolioOwner(portfolioId);

  const nameError = validateRequiredText(data.name, MAX_SKILL_NAME_LENGTH);
  if (nameError) throw new Error(nameError);

  const existingCount = await prisma.skill.count({ where: { portfolioId } });
  await prisma.skill.create({
    data: {
      portfolioId,
      name: data.name.trim(),
      level: data.level && SKILL_LEVELS.includes(data.level as (typeof SKILL_LEVELS)[number]) ? data.level : null,
      sortOrder: existingCount,
    },
  });

  revalidatePath(`/dashboard/${portfolioId}/skills`);
}

export async function updateSkill(
  skillId: string,
  data: { name: string; level: string | null }
) {
  const { skill } = await requireSkillOwner(skillId);

  const nameError = validateRequiredText(data.name, MAX_SKILL_NAME_LENGTH);
  if (nameError) throw new Error(nameError);

  await prisma.skill.update({
    where: { id: skillId },
    data: {
      name: data.name.trim(),
      level: data.level && SKILL_LEVELS.includes(data.level as (typeof SKILL_LEVELS)[number]) ? data.level : null,
    },
  });

  revalidatePath(`/dashboard/${skill.portfolioId}/skills`);
}

export async function deleteSkill(skillId: string) {
  const { skill } = await requireSkillOwner(skillId);

  await prisma.skill.delete({ where: { id: skillId } });

  revalidatePath(`/dashboard/${skill.portfolioId}/skills`);
}
