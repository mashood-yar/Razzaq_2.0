import { defineField, defineType } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({ name: "heroEyebrow", type: "string", title: "Hero Eyebrow" }),
    defineField({
      name: "heroHeadline",
      type: "string",
      title: "Hero Headline",
    }),
    defineField({ name: "heroSubline", type: "string", title: "Hero Subline" }),
    defineField({
      name: "heroCtaLabel",
      type: "string",
      title: "Hero CTA Label",
      initialValue: "Explore Collection",
    }),
    defineField({
      name: "heroCtaHref",
      type: "string",
      title: "Hero CTA URL",
      initialValue: "/shop",
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt" }),
      ],
    }),
    defineField({
      name: "heroVideo",
      type: "file",
      options: { accept: "video/*" },
      title: "Hero Video (overrides image if set)",
    }),
    defineField({
      name: "brandStatement",
      type: "string",
      title: "Brand Statement Pull Quote",
    }),
    defineField({ name: "seoTitle", type: "string" }),
    defineField({ name: "seoDescription", type: "text", rows: 2 }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage Settings" };
    },
  },
});
