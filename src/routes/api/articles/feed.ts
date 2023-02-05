import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { selectDbArticle, toApiArticle } from "~/server/transform/article";
import type { ErrorResponse, MultipleArticles } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#feed-articles
const queryParamsSchema = z.object({
  // https://github.com/colinhacks/zod/discussions/330#discussioncomment-1625947
  limit: z.preprocess(
    (a) => parseInt(z.string().optional().default("20").parse(a)),
    z.number().int().min(0)
  ),
  offset: z.preprocess(
    (a) => parseInt(z.string().optional().default("0").parse(a)),
    z.number().int().min(0)
  ),
});

export async function GET({ request }: APIEvent) {
  const user = await requireUser(request);

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const isValid = queryParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!isValid.success) {
    return json<ErrorResponse>(
      { errors: { queryParams: isValid.error } },
      { status: 422 }
    );
  }

  const queryParams = isValid.data;

  const articles = await prisma.article.findMany({
    where: {
      author: {
        followers: {
          some: {
            username: user.username,
          },
        },
      },
    },
    orderBy: {
      // most recent articles first
      createdAt: "desc",
    },
    skip: queryParams.offset,
    take: queryParams.limit,
    select: selectDbArticle(user.username),
  });

  return json<MultipleArticles>({
    articles: articles.map(toApiArticle),
    articlesCount: 0,
  });
}
