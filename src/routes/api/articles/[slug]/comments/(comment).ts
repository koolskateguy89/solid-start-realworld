import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { getUser, requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { selectDbComment, toApiComment } from "~/server/transform/comment";
import type { ErrorResponse, MultipleComments } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#get-comments-from-an-article
export async function GET({ params, request }: APIEvent) {
  const user = await getUser(request);
  const username = user?.username ?? "";

  const { slug } = params;

  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
    select: {
      comments: {
        select: selectDbComment(username),
      },
    },
  });

  if (!article)
    return json<ErrorResponse>(
      { errors: "Article not found" },
      { status: 404 }
    );

  return json<MultipleComments>({
    comments: article.comments.map(toApiComment),
  });
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#add-comments-to-an-article
// TODO: schema

export async function POST({ params, request }: APIEvent) {
  const user = await requireUser(request);

  // TODO

  return json<ErrorResponse>({ errors: "Not implemented" }, { status: 501 });
}
