import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-form";
import { getUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Account",
  description: "Your LUMINA account — orders and preferences.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-4xl">Account</h1>
      {user ? (
        <>
          <p className="mt-6 text-muted-foreground">
            Signed in as <span className="text-foreground">{user.email}</span>
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/account/orders">View orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/address">Saved address</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/profile">Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/wishlist">Wishlist</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Continue shopping</Link>
            </Button>
            <SignOutButton />
          </div>
        </>
      ) : (
        <>
          <p className="mt-6 text-muted-foreground">
            Sign in to view orders and saved details.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
