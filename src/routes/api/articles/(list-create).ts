import { type APIEvent, json } from "solid-start";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { getUser, requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { selectDbArticle, toApiArticle } from "~/server/transform/article";
import type { Article, ErrorResponse, MultipleArticles } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#list-articles
const queryParamsSchema = z.object({
  tag: z.string().optional(),
  author: z.string().optional(),
  favorited: z.string().optional(),
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

const toArticleWhereInput = (
  params: z.infer<typeof queryParamsSchema>
): Prisma.ArticleWhereInput => ({
  ...(params.tag && {
    tagList: {
      some: {
        name: params.tag,
      },
    },
  }),
  ...(params.author && {
    authorUsername: params.author,
  }),
  ...(params.favorited && {
    favorited: {
      some: {
        username: params.favorited,
      },
    },
  }),
});

export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const isValid = queryParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!isValid.success) {
    return json<ErrorResponse>(
      { errors: { body: isValid.error } },
      { status: 422 }
    );
  }

  const queryParams = isValid.data;
  console.log("GET /api/articles queryParams=", queryParams);

  const user = await getUser(request);
  const username = user?.username ?? "";

  const articles = await prisma.article.findMany({
    orderBy: {
      // most recent articles first
      createdAt: "desc",
    },
    skip: queryParams.offset,
    take: queryParams.limit,
    where: {
      ...toArticleWhereInput(queryParams),
    },
    select: selectDbArticle(username),
  });

  const result: MultipleArticles = {
    articles: articles.map(toApiArticle),
    articlesCount: articles.length,
  };

  return json(result);
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#create-article
const createArticleSchema = z.object({
  article: z.object({
    title: z.string(),
    description: z.string(),
    body: z.string(),
    tagList: z.array(z.string()).optional(),
  }),
});

// auth required, user is author
export async function POST({ request }: APIEvent) {
  // TODO
  const user = await requireUser(request);
}
