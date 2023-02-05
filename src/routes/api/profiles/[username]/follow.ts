import { type APIEvent, json } from "solid-start";

import { requireUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import type { Profile } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#follow-user
export async function POST({ params, request }: APIEvent) {
  const { username } = params;

  const signedInUser = await requireUser(request);
  const signedInUsername = signedInUser.username;

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

  if (!user) {
    return json({ errors: "User not found" }, { status: 404 });
  }

  const profile: Profile = {
    ...user,
    following: true,
  };

  return json(profile);
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#unfollow-user
export async function DELETE({ params, request }: APIEvent) {
  const { username } = params;

  const signedInUser = await requireUser(request);
  const signedInUsername = signedInUser.username;

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

  if (!user) {
    return json({ errors: "User not found" }, { status: 404 });
  }

  const profile: Profile = {
    ...user,
    following: false,
  };

  return json(profile);
}
