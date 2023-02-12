import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { getUser, requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { selectDbComment, toApiComment } from "~/server/transform/comment";
import type { ErrorResponse, MultipleComments, Comment } from "~/types/api";

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
        orderBy: {
          // sort by newest first
          createdAt: "desc",
        },
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
const createCommentSchema = z.object({
  comment: z.object({
    body: z.string().trim().min(1),
  }),
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>;

export async function POST({ params, request }: APIEvent) {
  const user = await requireUser(request);

  const { slug } = params;

  const isValid = createCommentSchema.safeParse(await request.json());

  if (!isValid.success)
    return json<ErrorResponse>(
      { errors: isValid.error.issues },
      { status: 422 }
    );

  const { body } = isValid.data.comment;

  const comment = await prisma.comment.create({
    data: {
      body,
      author: {
        connect: {
          username: user.username,
        },
      },
      article: {
        connect: {
          slug,
        },
      },
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
        },
      },
    },
  });

  return json<Comment>({
    id: comment.id,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    body: comment.body,
    author: {
      ...comment.author,
      following: false,
    },
  });
}
