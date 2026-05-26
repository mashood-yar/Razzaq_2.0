import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Client Care | Razzaq Luxe",
  description:
    "Reach Razzaq Luxe — bespoke client care, order enquiries, and flagship boutique appointments.",
};

export default function ContactPage() {
  return (
    <div className="bg-obsidian min-h-screen text-ivory">
      {/* Editorial Header */}
      <section className="pt-32 pb-24 px-6 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-[1200px] border-b border-graphite pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold mb-6">
            Client Care
          </p>
          <h1 className="font-display text-[clamp(3rem,6vw,6rem)] leading-none italic font-light">
            At Your Service
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-[1200px] px-6 pb-32 sm:px-12 lg:px-0">
        <div className="grid gap-24 lg:grid-cols-5">
          {/* Contact Details (2 cols) */}
          <div className="lg:col-span-2">
            <p className="leading-loose text-smoke text-lg font-light mb-16 max-w-md">
              Whether you are enquiring about a bespoke order or require assistance with your current selection, our Client Care team is dedicated to providing an impeccable experience.
            </p>

            <div className="space-y-12">
              <div>
                <h3 className="font-display text-2xl italic text-gold mb-4">
                  Boutique Concierge
                </h3>
                <div className="space-y-2 text-smoke font-light tracking-wide">
                  <p>sultanbarak77@gmail.com</p>
                  <p>Sat–Thu, 10:00 – 20:00 PKT</p>
                </div>
              </div>

              <div>
                <h3 className="font-display text-2xl italic text-gold mb-4">
                  The Flagship
                </h3>
                <div className="space-y-2 text-smoke font-light tracking-wide">
                  <p>Quetta, Balochistan</p>
                  <p>Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (3 cols) */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
