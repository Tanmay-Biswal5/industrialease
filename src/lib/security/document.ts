/**
 * Document Security & Ingestion Guardrails
 *
 * Implements magic-byte verification, safe filename normalization to prevent
 * path traversal, and strict MIME type enforcement against Stored XSS.
 */

export type AllowedDocumentType = "application/pdf" | "image/png" | "image/jpeg";

export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const MAGIC_BYTES: Record<AllowedDocumentType, number[][]> = {
  "application/pdf": [
    [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  ],
  "image/jpeg": [
    [0xff, 0xd8, 0xff],
  ],
};

/**
 * Validates whether a given Uint8Array buffer matches the magic bytes
 * of the declared MIME type. Never trust user-provided extensions.
 */
export function verifyMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const allowed = MAGIC_BYTES[mimeType as AllowedDocumentType];
  if (!allowed) {
    return false;
  }

  return allowed.some((signature) => {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, index) => buffer[index] === byte);
  });
}

/**
 * Sanitizes a client-provided filename:
 * - Strips directory traversal (../, ..\)
 * - Strips null bytes and non-printable characters
 * - Generates an isolated storage key prefixed with tenant ID and UUID
 */
export function sanitizeDocumentKey(
  applicantId: string,
  originalFilename: string
): { safeFileName: string; storageKey: string } {
  // Strip path traversal and directory markers
  const baseName = originalFilename
    .replace(/[/\\]/g, "")
    .replace(/\.\./g, "")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();

  // Extract extension, fallback to .bin if missing or suspicious
  const parts = baseName.split(".");
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  const nameWithoutExt = parts.join(".").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);

  // Prohibit executable or dangerous script extensions
  const dangerousExtensions = ["html", "htm", "svg", "js", "mjs", "php", "sh", "exe", "bat", "cmd"];
  if (dangerousExtensions.includes(extension)) {
    throw new Error(`File type .${extension} is rejected for security reasons.`);
  }

  const uniqueId = crypto.randomUUID();
  const safeFileName = `${nameWithoutExt || "document"}.${extension}`;
  
  // Isolated multi-tenant storage key: tenantId/uniqueId/safeFileName
  const safeApplicantId = applicantId.replace(/[^a-zA-Z0-9_-]/g, "");
  const storageKey = `tenants/${safeApplicantId}/${uniqueId}/${safeFileName}`;

  return { safeFileName, storageKey };
}
