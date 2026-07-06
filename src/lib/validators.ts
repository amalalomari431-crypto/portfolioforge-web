// Mirrors lib/core/utils/validators.dart in the Flutter app — same limits,
// same parsing rules, so both apps behave identically.

export const MAX_PROJECT_TITLE_LENGTH = 200;
export const MAX_PROJECT_DESCRIPTION_LENGTH = 5000;
export const MAX_PROJECT_ROLE_LENGTH = 128;
export const MAX_PROJECT_TAG_LENGTH = 40;
export const MAX_PROJECT_TAG_COUNT = 20;
export const MAX_WEBSITE_LENGTH = 2048;

export const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
export const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);
export const PDF_EXTENSION = "pdf";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

// Sections — a project's ordered stack of pages.
export const MAX_SECTION_TITLE_LENGTH = 120;
export const MAX_SECTION_CONTENT_LENGTH = 50_000; // Tiptap HTML is verbose
export const MAX_SECTION_AI_NOTES_LENGTH = 2000;
export const SUGGESTED_SECTION_TITLES = [
  "Cover",
  "Introduction",
  "Concept",
  "Site Analysis",
  "Plans",
  "Renderings",
  "Conclusion",
];

// Skills / Certificates
export const MAX_SKILL_NAME_LENGTH = 60;
export const MAX_CERTIFICATE_TITLE_LENGTH = 150;
export const MAX_CERTIFICATE_ISSUER_LENGTH = 120;

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim();
    if (!tag || tag.length > MAX_PROJECT_TAG_LENGTH) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= MAX_PROJECT_TAG_COUNT) break;
  }
  return out;
}

export function validateRequiredText(value: string, maxLength: number): string | null {
  if (!value.trim()) return "required";
  if (value.length > maxLength) return "tooLong";
  return null;
}

export function validateOptionalText(value: string, maxLength: number): string | null {
  if (!value) return null;
  if (value.length > maxLength) return "tooLong";
  return null;
}

export function validateWebsite(value: string): string | null {
  if (!value) return null;
  if (value.length > MAX_WEBSITE_LENGTH) return "tooLong";
  try {
    const url = new URL(value);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
      return "invalid";
    }
    return null;
  } catch {
    return "invalid";
  }
}

export type MediaValidationError =
  | "unsupportedType"
  | "imageTooLarge"
  | "pdfTooLarge"
  | "videoTooLarge"
  | null;

export function validateMediaFile(fileName: string, sizeBytes: number): MediaValidationError {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === PDF_EXTENSION) {
    return sizeBytes > MAX_PDF_BYTES ? "pdfTooLarge" : null;
  }
  if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return sizeBytes > MAX_IMAGE_BYTES ? "imageTooLarge" : null;
  }
  if (ALLOWED_VIDEO_EXTENSIONS.has(ext)) {
    return sizeBytes > MAX_VIDEO_BYTES ? "videoTooLarge" : null;
  }
  return "unsupportedType";
}

export function assetKindForExtension(fileName: string): "IMAGE" | "PDF" | "VIDEO" | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === PDF_EXTENSION) return "PDF";
  if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) return "IMAGE";
  if (ALLOWED_VIDEO_EXTENSIONS.has(ext)) return "VIDEO";
  return null;
}
