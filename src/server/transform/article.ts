import type { Prisma } from "@prisma/client";

import type { Article } from "~/types/api";
import { selectDbUser, userToProfile } from "./profile";

export function selectDbArticle(signedInUsername: string) {
  return {
    slug: true,
    title: true,
    description: true,
    body: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: selectDbUser(signedInUsername),
    },
    tagList: true,
    favorited: {
      // using to check if logged in user has favorited
      where: {
        username: signedInUsername,
      },
      select: {
        username: true,
      },
    },
    // using to get the number of favorites
    _count: {
      select: {
        favorited: true,
      },
    },
  } satisfies Prisma.ArticleSelect;
}

export type DbArticle = Prisma.ArticleGetPayload<{
  select: ReturnType<typeof selectDbArticle>;
}>;

export function toApiArticle<TArticle extends DbArticle>(
  article: TArticle
): Article {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList.map((tag) => tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    favorited: article.favorited.length > 0,
    favoritesCount: article.favorited.length,
    author: userToProfile(article.author),
  };
}
