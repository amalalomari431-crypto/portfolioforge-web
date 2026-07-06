import { redirect } from "next/navigation";

// A project's primary content is its Sections now — the bare
// /projects/[projectId] URL (e.g. from an old bookmark) just forwards
// there.
export default async function ProjectRootPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: portfolioId, projectId } = await params;
  redirect(`/dashboard/${portfolioId}/projects/${projectId}/sections`);
}
