import { type APIEvent, json } from "solid-start";

import { getUser } from "~/server/lib/auth";
import { prisma } from "~/server/db/client";
import { userToProfile } from "~/server/transform/profile";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#get-profile
export async function GET({ params, request }: APIEvent) {
  const { username } = params;

  const signedInUser = await getUser(request);
  const signedInUsername = signedInUser?.username ?? "";

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
      bio: true,
      image: true,
      _count: {
        select: {
          followers: {
            where: {
              username: signedInUsername,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return json({ errors: "User not found" }, { status: 404 });
  }

  return json(userToProfile(user));
}
