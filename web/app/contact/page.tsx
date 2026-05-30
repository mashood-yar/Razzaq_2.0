import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact RazzaqLuxe",
  description:
    "Reach RazzaqLuxe for customer support, order enquiries, boutique visits, and business partnerships across Pakistan.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <h1 className="font-display text-5xl text-foreground">Contact</h1>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Our customer support team is available Saturday–Thursday, 10 AM – 8 PM PKT. We typically respond within a few hours.
          </p>

          <div className="mt-12 space-y-8 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Customer Support
              </p>
              <p className="mt-2 text-muted-foreground">sultanbarak77@gmail.com</p>
              <p className="text-muted-foreground">Sat–Thu, 10 AM – 8 PM PKT</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Flagship boutique
              </p>
              <p className="mt-2 text-muted-foreground">
                Quetta, Balochistan
                <br />
                Pakistan
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Business enquiries
              </p>
              <p className="mt-2 text-muted-foreground">sultanbarak77@gmail.com</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
