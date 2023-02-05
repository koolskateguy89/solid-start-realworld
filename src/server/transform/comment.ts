import type { Prisma } from "@prisma/client";

import type { Comment } from "~/types/api";
import { selectDbUser, userToProfile } from "./profile";

export function selectDbComment(signedInUsername: string) {
  return {
    id: true,
    createdAt: true,
    updatedAt: true,
    body: true,
    author: {
      select: selectDbUser(signedInUsername),
    },
  } satisfies Prisma.CommentSelect;
}

export type DbComment = Prisma.CommentGetPayload<{
  select: ReturnType<typeof selectDbComment>;
}>;

export function toApiComment<TComment extends DbComment>(
  comment: TComment
): Comment {
  return {
    id: comment.id,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    body: comment.body,
    author: userToProfile(comment.author),
  };
}
