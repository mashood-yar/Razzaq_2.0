/** Shared limit for admin product image uploads (must match route handler). */
export const ADMIN_PRODUCT_IMAGE_MAX_BYTES = 15 * 1024 * 1024;

export function formatImageUploadFetchError(error: unknown, fileName: string): string {
  const isAbort =
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError");
  if (isAbort) {
    return (
      "Upload was interrupted (timeout or connection closed). " +
      "If you're running locally, the dev server may have restarted—refresh the admin page and try again."
    );
  }
  if (
    (error instanceof TypeError &&
      /failed to fetch|load failed|networkerror|failed to load/i.test(
        error.message
      )) ||
    (error instanceof Error && /failed to fetch/i.test(error.message))
  ) {
    return (
      "Couldn't reach the upload API (network error). " +
      "On localhost this often happens when the Next.js dev server restarts or the connection drops—refresh and retry."
    );
  }
  if (error instanceof Error && error.message) return error.message;
  return `Failed to upload ${fileName}`;
}
