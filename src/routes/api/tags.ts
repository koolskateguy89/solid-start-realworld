import { json } from "solid-start";

import { prisma } from "~/server/db/client";
import type { ListOfTags } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#get-tags
export async function GET() {
  const tags = await prisma.tag.findMany();

  return json<ListOfTags>({
    tags: tags.map((tag) => tag.name),
  });
}
