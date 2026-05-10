import { defineField, defineType } from "sanity";

export default defineType({
  name: "about",
  title: "About Page",
  type: "document",
  fields: [
    defineField({ name: "heroHeadline", type: "string" }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "storyHeading", type: "string" }),
    defineField({
      name: "storyContent",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "values",
      title: "Founding Values",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "icon",
              type: "string",
              title: "Icon name (Phosphor)",
            }),
            defineField({ name: "heading", type: "string" }),
            defineField({ name: "body", type: "text" }),
          ],
        },
      ],
    }),
    defineField({
      name: "team",
      title: "Team Members",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({ name: "role", type: "string" }),
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
        },
      ],
    }),
    defineField({ name: "seoTitle", type: "string" }),
    defineField({ name: "seoDescription", type: "text", rows: 2 }),
  ],
});
