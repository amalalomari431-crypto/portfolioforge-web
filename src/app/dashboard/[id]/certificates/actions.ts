"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortfolioOwner, requireCertificateOwner } from "@/lib/authz";
import {
  validateRequiredText,
  validateOptionalText,
  validateWebsite,
  MAX_CERTIFICATE_TITLE_LENGTH,
  MAX_CERTIFICATE_ISSUER_LENGTH,
} from "@/lib/validators";

export type CertificateDraft = {
  title: string;
  issuer: string;
  issueDate: string; // ISO date, "" for unset
  credentialUrl: string;
};

function validateDraft(draft: CertificateDraft) {
  const titleError = validateRequiredText(draft.title, MAX_CERTIFICATE_TITLE_LENGTH);
  if (titleError) throw new Error(titleError);
  const issuerError = validateOptionalText(draft.issuer, MAX_CERTIFICATE_ISSUER_LENGTH);
  if (issuerError) throw new Error(issuerError);
  const urlError = validateWebsite(draft.credentialUrl);
  if (urlError) throw new Error(urlError);
}

export async function createCertificate(portfolioId: string, draft: CertificateDraft) {
  await requirePortfolioOwner(portfolioId);
  validateDraft(draft);

  const existingCount = await prisma.certificate.count({ where: { portfolioId } });
  await prisma.certificate.create({
    data: {
      portfolioId,
      title: draft.title.trim(),
      issuer: draft.issuer.trim() || null,
      issueDate: draft.issueDate ? new Date(draft.issueDate) : null,
      credentialUrl: draft.credentialUrl.trim() || null,
      sortOrder: existingCount,
    },
  });

  revalidatePath(`/dashboard/${portfolioId}/certificates`);
}

export async function updateCertificate(certificateId: string, draft: CertificateDraft) {
  const { certificate } = await requireCertificateOwner(certificateId);
  validateDraft(draft);

  await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      title: draft.title.trim(),
      issuer: draft.issuer.trim() || null,
      issueDate: draft.issueDate ? new Date(draft.issueDate) : null,
      credentialUrl: draft.credentialUrl.trim() || null,
    },
  });

  revalidatePath(`/dashboard/${certificate.portfolioId}/certificates`);
}

export async function deleteCertificate(certificateId: string) {
  const { certificate } = await requireCertificateOwner(certificateId);

  await prisma.certificate.delete({ where: { id: certificateId } });

  revalidatePath(`/dashboard/${certificate.portfolioId}/certificates`);
}
