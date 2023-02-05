import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { getUser, requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { selectDbArticle, toApiArticle } from "~/server/transform/article";
import type { ErrorResponse } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#get-article
export async function GET({ params, request }: APIEvent) {
  const user = await getUser(request);
  const username = user?.username ?? "";

  const { slug } = params;

  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
    select: selectDbArticle(username),
  });

  if (!article) {
    return json<ErrorResponse>(
      { errors: "Article not found" },
      { status: 404 }
    );
  }

  return json(toApiArticle(article));
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#update-article
export function PUT() {
  // TODO
  return json<ErrorResponse>({ errors: "Not implemented" }, { status: 501 });
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#delete-article
export async function DELETE({ params, request }: APIEvent) {
  const user = await requireUser(request);

  const { slug } = params;

  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
    select: {
      authorUsername: true,
    },
  });

  if (!article)
    return json<ErrorResponse>(
      {
        errors: "Article not found",
      },
      { status: 404 }
    );

  if (article.authorUsername !== user.username)
    return json<ErrorResponse>(
      {
        errors: "You are not the author of this article",
      },
      { status: 403 }
    );

  await prisma.article.delete({
    where: {
      slug,
    },
  });

  return new Response(null, { status: 204 });
}
