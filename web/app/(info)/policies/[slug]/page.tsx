import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupportEmail } from "@/lib/support";

const VALID_SLUGS = [
  "privacy-policy",
  "return-policy",
  "shipping-policy",
  "terms-of-service",
] as const;

type Slug = (typeof VALID_SLUGS)[number];

const POLICIES: Record<Slug, { title: string; content: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    content: `
**Effective date:** May 2026

## Information We Collect
We collect information you provide directly — name, email, shipping address, phone number — when you place an order or create an account. We also collect browsing data and device information automatically via cookies.

## How We Use It
Your information is used to process orders, send order confirmations and shipping updates, provide customer support, and improve our services. We never sell your personal data.

## Cookies
We use essential cookies for session management and cart persistence. Analytics cookies help us understand how our store is used. You may opt out of non-essential cookies.

## Third-Party Services
We share order data with shipping carriers (TCS, Leopards, DHL) and payment processors (LemonSqueezy) only as necessary to fulfil your order.

## Data Retention
We retain order records for 7 years for tax and legal compliance. Account data is retained while your account is active or until you request deletion.

## Your Rights
You may request access to, correction of, or deletion of your personal data by emailing privacy@razzaqluxe.com.

## Contact
Razzaq Luxe — Lahore, Pakistan · privacy@razzaqluxe.com
    `,
  },
  "return-policy": {
    title: "Return Policy",
    content: `
**Last updated:** May 2026

## Returns window
We accept returns within **7 days** of delivery.

## Condition
Items must be **unused** and returned in **original packaging** (fragrances must remain sealed).

## How to start a return
Email **__SUPPORT__** with your **order ID** and the **reason** for your return.

## Refunds
Approved refunds are processed within **5–7 business days** to your original payment path (bank transfer for COD orders where applicable).

## Questions
Contact **__SUPPORT__** any time — we reply as quickly as we can.
    `,
  },
  "shipping-policy": {
    title: "Shipping Policy",
    content: `
**Last updated:** May 2026

## Delivery Within Pakistan

| Method | Carrier | Timeline | Cost |
|--------|---------|----------|------|
| Standard | TCS / Leopards | 3–5 business days | PKR 250 |
| Express | TCS | 1–2 business days | PKR 500 |
| Free Standard | — | 3–5 business days | Free on orders ≥ PKR 5,000 |

## Processing Time
Orders are processed Monday–Saturday. Orders placed before 2:00 PM PKT are dispatched the same day. Orders placed after 2:00 PM are dispatched the following business day.

## International Shipping
We ship internationally via DHL Economy (7–14 days, PKR 2,500) and DHL Express (3–5 days, PKR 4,500).

## Tracking
Once your order is dispatched, you will receive a tracking number via email. Use it on the carrier's website or view your order in your Razzaq Luxe account.

## Issues
If your package is delayed, damaged, or lost, contact us at sultanbarak77@gmail.com within 10 days of the expected delivery date.
    `,
  },
  "terms-of-service": {
    title: "Terms of Service",
    content: `
**Effective date:** May 2026

## Agreement
By accessing and purchasing from Razzaq Luxe, you agree to these Terms of Service. Please read them carefully.

## Products and Pricing
All prices are listed in Pakistani Rupees (PKR) inclusive of applicable taxes. We reserve the right to update prices without notice. Price changes do not affect orders already confirmed.

## Orders
We reserve the right to cancel or refuse any order. In the event of cancellation after payment, we will issue a full refund within 5 business days.

## Cash on Delivery
COD orders are subject to verification. We reserve the right to cancel COD orders if we cannot verify the customer's details.

## Intellectual Property
All content on this website — including product images, text, and branding — belongs to Razzaq Luxe and may not be reproduced without written permission.

## Limitation of Liability
To the extent permitted by law, Razzaq Luxe is not liable for indirect or consequential damages. Our maximum liability is limited to the value of your order.

## Governing Law
These terms are governed by the laws of Pakistan.

## Contact
legal@razzaqluxe.com
    `,
  },
};

function policyBodyHtml(body: string): string {
  return body
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/Razzaq Luxe/g, '<span style="color:#C9A84C">Razzaq Luxe</span>')
    .replace(/\n/g, "<br />");
}

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug as Slug];
  return { title: policy?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;

  if (!VALID_SLUGS.includes(slug as Slug)) notFound();

  const policyRaw = POLICIES[slug as Slug];
  const support = getSupportEmail();
  const policy = {
    ...policyRaw,
    content: policyRaw.content.replace(/__SUPPORT__/g, support),
  };

  const sections = policy.content
    .trim()
    .split("\n## ")
    .map((block, i) => {
      if (i === 0) return { heading: null, body: block.trim() };
      const [heading, ...rest] = block.split("\n");
      return { heading: heading.trim(), body: rest.join("\n").trim() };
    });

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <p className="text-xs uppercase tracking-widest text-luxe-gold">Razzaq Luxe</p>
      <h1 className="mt-3 font-display text-5xl text-ivory">{policy.title}</h1>
      <p className="mt-3 text-sm text-ash">Last updated: May 2026</p>

      <nav className="my-10 space-y-1 border-l-2 border-gold/40 pl-4">
        {sections.map(
          (s, i) =>
            s.heading && (
              <a
                key={i}
                href={`#sec-${i}`}
                className="block text-sm text-smoke transition-colors hover:text-gold"
              >
                {s.heading}
              </a>
            ),
        )}
      </nav>

      <div className="space-y-10 text-sm leading-relaxed text-smoke">
        {sections.map((s, i) => (
          <section key={i} id={`sec-${i}`} className="scroll-mt-24">
            {s.heading && (
              <h2 className="mb-3 font-display text-2xl text-ivory">
                {s.heading}
              </h2>
            )}
            <div
              className="prose prose-sm prose-invert max-w-none prose-headings:font-display prose-a:text-gold prose-strong:text-ivory"
              dangerouslySetInnerHTML={{
                __html: policyBodyHtml(s.body),
              }}
            />
          </section>
        ))}
      </div>

      <p className="mt-16">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-gold hover:underline"
        >
          ← Back to Home
        </Link>
      </p>
    </div>
  );
}
