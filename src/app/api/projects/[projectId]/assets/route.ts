import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAppwriteStorage, APPWRITE_BUCKET_ID, ID, appwriteFileViewUrl } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { Permission, Role } from "node-appwrite";
import { validateMediaFile, assetKindForExtension, MAX_IMAGE_BYTES, MAX_PDF_BYTES, MAX_VIDEO_BYTES } from "@/lib/validators";

// A plain API route (not a Server Action) specifically so the client can
// use XMLHttpRequest's upload.onprogress for real percentage feedback,
// matching MediaManagerScreen's "Uploading {percent}%" in Flutter — Server
// Actions don't expose upload progress to the client at all.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { portfolio: true },
  });
  if (!project || project.portfolio.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const validationError = validateMediaFile(file.name, file.size);
  if (validationError === "unsupportedType") {
    return NextResponse.json(
      { error: "Unsupported format — use JPG, PNG, WebP, or PDF." },
      { status: 400 }
    );
  }
  if (validationError === "imageTooLarge") {
    return NextResponse.json(
      { error: `Too large — images up to ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.` },
      { status: 400 }
    );
  }
  if (validationError === "pdfTooLarge") {
    return NextResponse.json(
      { error: `Too large — PDFs up to ${MAX_PDF_BYTES / (1024 * 1024)} MB.` },
      { status: 400 }
    );
  }
  if (validationError === "videoTooLarge") {
    return NextResponse.json(
      { error: `Too large — videos up to ${MAX_VIDEO_BYTES / (1024 * 1024)} MB.` },
      { status: 400 }
    );
  }

  // Uploads from a Section Editor scope the asset to that section; uploads
  // from the project-wide Media Library omit this and the asset stays a
  // plain, unattached project-level asset.
  const sectionIdRaw = formData.get("sectionId");
  let sectionId: string | null = null;
  if (typeof sectionIdRaw === "string" && sectionIdRaw.length > 0) {
    const section = await prisma.section.findUnique({ where: { id: sectionIdRaw } });
    if (!section || section.projectId !== projectId) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }
    sectionId = section.id;
  }

  const kind = assetKindForExtension(file.name)!;
  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getAppwriteStorage();
  const bucketId = APPWRITE_BUCKET_ID();

  let uploaded;
  try {
    uploaded = await storage.createFile(
      bucketId,
      ID.unique(),
      InputFile.fromBuffer(buffer, file.name),
      [Permission.read(Role.any())]
    );
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 502 });
  }

  const existingCount = await prisma.projectAsset.count({ where: { projectId } });

  const asset = await prisma.projectAsset.create({
    data: {
      projectId,
      sectionId,
      kind,
      appwriteBucketId: bucketId,
      appwriteFileId: uploaded.$id,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      sortOrder: existingCount,
    },
  });

  return NextResponse.json({
    id: asset.id,
    kind: asset.kind,
    fileName: asset.fileName,
    sizeBytes: asset.sizeBytes,
    sectionId: asset.sectionId,
    viewUrl: appwriteFileViewUrl(asset.appwriteFileId),
  });
}
