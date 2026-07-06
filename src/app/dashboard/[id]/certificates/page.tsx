import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CertificatesClient } from "./certificates-client";

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: portfolioId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  const certificates = await prisma.certificate.findMany({
    where: { portfolioId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 xl:px-16">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink italic">Certificates</h1>
        <p className="mt-1 text-sm text-ink-dim">Credentials and certifications that back up your work.</p>
      </div>
      <CertificatesClient
        portfolioId={portfolioId}
        initialCertificates={certificates.map((c) => ({
          id: c.id,
          title: c.title,
          issuer: c.issuer,
          issueDate: c.issueDate ? c.issueDate.toISOString() : null,
          credentialUrl: c.credentialUrl,
        }))}
      />
    </main>
  );
}
