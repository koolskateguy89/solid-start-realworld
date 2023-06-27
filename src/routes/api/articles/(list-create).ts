import { type APIEvent, json } from "solid-start";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { getUser, requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { generateSlug } from "~/server/lib/slug";
import { selectDbArticle, toApiArticle } from "~/server/transform/article";
import type { ErrorResponse, MultipleArticles } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#list-articles
const queryParamsSchema = z.object({
  tag: z.string().optional(),
  author: z.string().optional(),
  favorited: z.string().optional(),
  // https://github.com/colinhacks/zod#coercion-for-primitives
  limit: z.string().default("20").pipe(z.coerce.number().int().min(0)),
  offset: z.string().default("0").pipe(z.coerce.number().int().min(0)),
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
  console.log("GET /api/articles queryParams =", queryParams);

  const user = await getUser(request);
  const username = user?.username ?? "";

  const where = toArticleWhereInput(queryParams);

  const articlesData = prisma.article.findMany({
    where,
    orderBy: {
      // most recent articles first
      createdAt: "desc",
    },
    skip: queryParams.offset,
    take: queryParams.limit,
    select: selectDbArticle(username),
  });

  const articlesCountData = prisma.article.count({
    where,
  });

  const [articles, articlesCount] = await Promise.all([
    articlesData,
    articlesCountData,
  ]);

  return json<MultipleArticles>({
    articles: articles.map(toApiArticle),
    articlesCount,
  });
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#create-article
const createArticleSchema = z.object({
  article: z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-zA-Z0-9 ]+$/), // only allow alphanumeric characters and spaces
    description: z.string().trim().min(1),
    body: z.string().trim().min(1),
    tagList: z.array(z.string().trim().min(1)).optional(),
  }),
});

export type CreateArticleBody = z.infer<typeof createArticleSchema>;

export type CreateArticleError = ErrorResponse<"slug-taken">;

export async function POST({ request }: APIEvent) {
  const user = await requireUser(request);

  const isValid = createArticleSchema.safeParse(await request.json());

  if (!isValid.success)
    return json<ErrorResponse>({ errors: { body: isValid.error } }, 422);

  const { article: data } = isValid.data;

  const slug = generateSlug(data.title);

  const slugIsTaken =
    (await prisma.article.count({
      where: {
        slug,
      },
    })) > 0;

  if (slugIsTaken)
    return json<CreateArticleError>({ errors: "slug-taken" }, 422);

  const article = await prisma.article.create({
    data: {
      ...data,
      slug,
      tagList: {
        connectOrCreate: data.tagList?.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      author: {
        connect: {
          username: user.username,
        },
      },
    },
    // could manually select fields here, but this is easier
    select: selectDbArticle(user.username),
  });

  return json(toApiArticle(article));
}
