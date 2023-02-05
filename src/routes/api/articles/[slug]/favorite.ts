import { type APIEvent, json } from "solid-start";

import { requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { selectDbUser, userToProfile } from "~/server/transform/profile";
import type { ErrorResponse, Article } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#favorite-article
export async function POST({ params, request }: APIEvent) {
  const user = await requireUser(request);

  const { slug } = params;

  const article = await prisma.article.update({
    where: {
      slug,
    },
    data: {
      favorited: {
        connect: {
          username: user.username,
        },
      },
    },
    include: {
      tagList: true,
      author: {
        select: selectDbUser(user.username),
      },
      _count: {
        select: {
          favorited: true,
        },
      },
    },
  });

  if (!article)
    return json<ErrorResponse>(
      { errors: "Article not found" },
      { status: 404 }
    );

  const result: Article = {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList.map((tag) => tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    favorited: true,
    favoritesCount: article._count.favorited,
    author: userToProfile(article.author),
  };

  return json(result);
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#unfavorite-article
export async function DELETE({ params, request }: APIEvent) {
  const user = await requireUser(request);

  const { slug } = params;

  const article = await prisma.article.update({
    where: {
      slug,
    },
    data: {
      favorited: {
        disconnect: {
          username: user.username,
        },
      },
    },
    include: {
      tagList: true,
      author: {
        select: selectDbUser(user.username),
      },
      _count: {
        select: {
          favorited: true,
        },
      },
    },
  });

  if (!article)
    return json<ErrorResponse>(
      { errors: "Article not found" },
      { status: 404 }
    );

  const result: Article = {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList.map((tag) => tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    favorited: false,
    favoritesCount: article._count.favorited,
    author: userToProfile(article.author),
  };

  return json(result);
}
