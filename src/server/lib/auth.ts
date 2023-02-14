import { json } from "solid-start";
import { z } from "zod";

import type { User, ErrorResponse } from "~/types/api";
import { getUserProfile } from "./session";
import { getSession } from "./token";

// Using cookies makes more sense than localStorage with an SSR framework
// because when using localStorage, a page load would look like:
//   client --[request]-> server
//   server --[page]-> client
//   client --[token]-> server (to decode token for session)
//   server --[session]-> client (to set session state & be able to use session)
// and when there's content that is dependent on the user being signed in, there would be a flash of different content
// with cookies, the page load would look like:
//   client --[request]-> server (with cookie)
//   server --[page]-> client (with session dependent content & session state)

// should use SolidStart's session management thingy
// https://start.solidjs.com/advanced/session
// https://start.solidjs.com/core-concepts/api-routes#session-management
// will want to store a subset of User (image at least) in the cookie, not just the username
// also see https://start.solidjs.com/api/useServerEvent for accessing the session on client-side
// (not sure if solid sessionStore can be used on client-side)

// This file merges the session and token auth approaches so that the same auth
// logic can be used on API routes without having to duplicate it

export type SessionProfile = Omit<User, "token" | "bio">;

export const sessionProfileSchema: z.ZodType<SessionProfile> = z.object({
  email: z.string().email(),
  username: z.string().min(1),
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
