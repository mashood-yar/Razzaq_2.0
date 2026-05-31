import type { Metadata } from "next";
import Image from "next/image";
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
    <div>
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-noir pt-[100px]">
        <div className="absolute inset-0" aria-hidden>
          <div className="relative h-full w-full">
            <Image
              src="/images/contact-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0A0A08] via-[#0A0A08]/65 to-[#0A0A08]/15"
              aria-hidden
            />
          </div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-16 pt-8 sm:px-6 md:pb-20">
          <span className="eyebrow mb-5 block">Reach Out</span>
          <h1 className="font-display text-[clamp(2.5rem,10vw,5rem)] font-light leading-[0.95] tracking-tight text-foreground">
            Let&apos;s <em className="text-gold-bright">Talk</em>
          </h1>
          <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-text-secondary">
            Whether it&apos;s an order inquiry, a bespoke gifting request, or simply a love letter —
            we read every message personally.
          </p>
        </div>
      </section>

      <div className="section-nocturne mx-auto max-w-4xl px-5 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="font-display text-2xl font-light text-foreground">Get in touch</h2>
            <div className="mt-10 space-y-8 text-sm">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold-warm">
                  Customer Support
                </p>
                <p className="mt-2 font-light text-muted-foreground">sultanbarak77@gmail.com</p>
                <p className="font-light text-muted-foreground">Sat–Thu, 10 AM – 8 PM PKT</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold-warm">
                  Flagship boutique
                </p>
                <p className="mt-2 font-light text-muted-foreground">
                  Quetta, Balochistan
                  <br />
                  Pakistan
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold-warm">
                  Business enquiries
                </p>
                <p className="mt-2 font-light text-muted-foreground">sultanbarak77@gmail.com</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-light text-foreground">Send Us a Message</h2>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
