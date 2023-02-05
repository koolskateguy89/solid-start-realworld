import type { Prisma } from "@prisma/client";

import type { Profile } from "~/types/api";

export function selectDbUser(signedInUsername: string) {
  return {
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
  } satisfies Prisma.UserSelect;
}

export type DbUser = Prisma.UserGetPayload<{
  select: ReturnType<typeof selectDbUser>;
}>;

export function userToProfile<TUser extends DbUser>(user: TUser): Profile {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: user._count.followers > 0,
  };
}
