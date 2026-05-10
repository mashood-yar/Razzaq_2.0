import { defineField, defineType } from "sanity";

export default defineType({
  name: "legalPage",
  title: "Legal Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "lastUpdated",
      type: "date",
      title: "Last Updated",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "heading",
              type: "string",
              title: "Section Heading",
            }),
            defineField({
              name: "content",
              type: "array",
              of: [{ type: "block" }],
              title: "Content",
            }),
          ],
        },
      ],
    }),
    defineField({ name: "seoTitle", type: "string" }),
  ],
});
