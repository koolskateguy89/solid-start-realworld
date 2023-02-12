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
const updateArticleSchema = z.object({
  article: z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    body: z.string().trim().min(1).optional(),
  }),
});

export type UpdateArticleBody = z.infer<typeof updateArticleSchema>;

export async function PUT({ params, request }: APIEvent) {
  const user = await requireUser(request);

  const { slug } = params;

  const isValid = updateArticleSchema.safeParse(await request.json());

  if (!isValid.success)
    return json<ErrorResponse>({ errors: { body: isValid.error } }, 422);

  const { article: data } = isValid.data;

  // TODO!: basically regenerate slug
  // slug seems to be lowercase and hyphenated
  // and unique
  // so we need to check if the slug is unique
  // though the title is not unique
  // will need to make lib function for generating slug

  const article = await prisma.article.update({
    where: {
      slug,
    },
    data: {
      ...data,
      // slug
    },
    select: selectDbArticle(user.username),
  });

  return json(toApiArticle(article));
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
