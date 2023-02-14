import { json } from "solid-start";
import { z } from "zod";

import type { Profile, ErrorResponse } from "~/types/api";
import { getUserProfile } from "./session";
import { getSession } from "./token";

// TODO: dont need to include bio in session
export type SessionProfile = Omit<Profile, "following">;

// TODO: typecheck thingy to check what i need to change for this to work
// export type SessionProfile = Omit<User, "token" | "bio">;

export const sessionProfileSchema: z.ZodType<SessionProfile> = z.object({
  // TODO!: update once SessionProfile is updated
  // email: z.string().email(),
  username: z.string().min(1),
  bio: z.string(),
  image: z.string(),
});

export async function getUser(
  request: Request
): Promise<SessionProfile | null> {
  const userProfile = await getUserProfile(request);

  return userProfile ?? getSession(request)?.user ?? null;
}

export async function requireUser(request: Request): Promise<SessionProfile> {
  const user = await getUser(request);

  if (!user) {
    throw json<ErrorResponse>({ errors: "Unauthorised" }, 401);
  }

  return user;
}
