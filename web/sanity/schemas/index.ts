import type { SchemaTypeDefinition } from "sanity";
import product from "./product";
import collection from "./collection";
import homepage from "./homepage";
import about from "./about";
import legalPage from "./legalPage";
import blogPost from "./blogPost";

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  collection,
  homepage,
  about,
  legalPage,
  blogPost,
];
