import { type APIEvent, json } from "solid-start";

import { requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import type { ErrorResponse, Profile } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#follow-user
export async function POST({ params, request }: APIEvent) {
  const { username } = params;

  const signedInUser = await requireUser(request);
  const signedInUsername = signedInUser.username;

  if (username === signedInUsername)
    return json<ErrorResponse>({ errors: "You cannot follow yourself" }, 422);

  const user = await prisma.user.update({
    where: {
      username,
    },
    data: {
      followers: {
        connect: {
          username: signedInUsername,
        },
      },
    },
    select: {
      username: true,
      bio: true,
      image: true,
    },
  });

  if (!user) return json({ errors: "User not found" }, 404);

  return json<Profile>({
    ...user,
    following: true,
  });
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#unfollow-user
export async function DELETE({ params, request }: APIEvent) {
  const { username } = params;

  const signedInUser = await requireUser(request);
  const signedInUsername = signedInUser.username;

  if (username === signedInUsername)
    return json<ErrorResponse>({ errors: "You cannot unfollow yourself" }, 422);

  const user = await prisma.user.update({
    where: {
      username,
    },
    data: {
      followers: {
        disconnect: {
          username: signedInUsername,
        },
      },
    },
    select: {
      username: true,
      bio: true,
      image: true,
    },
  });

  if (!user) return json({ errors: "User not found" }, 404);

  return json<Profile>({
    ...user,
    following: false,
  });
}
