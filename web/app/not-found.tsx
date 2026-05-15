import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">404</p>
      <h1 className="mt-6 font-serif text-4xl sm:text-5xl">This page has faded</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The scent trail ends here — let us guide you back to the shop.
      </p>
      <Button asChild className="mt-10" size="lg">
        <Link href="/shop">Browse the shop</Link>
      </Button>
    </div>
  );
}
