import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import type { ErrorResponse } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#delete-comment
const paramsSchema = z.object({
  slug: z.string(),
  // https://github.com/colinhacks/zod/discussions/330#discussioncomment-1625947
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a)),
    z.number().int().min(0)
  ),
});

export async function DELETE({ params, request }: APIEvent) {
  const user = await requireUser(request);

  const isValid = paramsSchema.safeParse(params);
  if (!isValid.success)
    return json<ErrorResponse>(
      { errors: "Invalid parameters" },
      { status: 422 }
    );

  const { slug, id } = isValid.data;

  const comment = await prisma.comment.findUnique({
    where: {
      id,
    },
    select: {
      authorUsername: true,
      articleSlug: true,
    },
  });

  if (!comment)
    return json<ErrorResponse>(
      { errors: "Comment not found" },
      { status: 404 }
    );

  if (comment.articleSlug !== slug)
    return json<ErrorResponse>(
      {
        errors: "This comment does not belong to this article",
      },
      { status: 404 }
    );

  if (comment.authorUsername !== user.username)
    return json<ErrorResponse>(
      {
        errors: "You can only delete your own comments",
      },
      { status: 403 }
    );

  await prisma.comment.delete({
    where: {
      id,
    },
  });

  return new Response(null, { status: 204 });
}
