/** Customer-facing support email — set in Vercel + .env.local */
export function getSupportEmail(): string {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    "sultanbarak77@gmail.com"
  );
}
