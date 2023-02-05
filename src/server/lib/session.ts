import { json, redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { z } from "zod";

import type { ErrorResponse, Profile } from "~/types/api";
import { serverEnv } from "~/env/server";

// https://start.solidjs.com/advanced/session

// Using cookies makes more sense than localStorage with an SSR framework
// becausew when using localStorage, a page load would look like:
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

// but will try to implement an approach that accepts both token in Authorisation header
// and cookie on API routes

// with requireSession() on API routes, will we be able to throw an Exception?
// so we don't have to handle the case where the session is null in every API route,
// as requireSession() will handle it for us

export type SessionProfile = Omit<Profile, "following">;

const sessionProfileSchema = z.object({
  username: z.string().min(1),
  bio: z.string(),
  image: z.string(),
}) satisfies z.ZodType<SessionProfile>;

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // secure doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [serverEnv.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export async function createUserSession<TUser extends SessionProfile>(
  user: TUser,
  redirectTo: string
) {
  const session = await storage.getSession();

  session.set("userProfile", {
    username: user.username,
    bio: user.bio,
    image: user.image,
  });

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

/**
 * @note server side only
 */
export async function getUserProfile(request: Request) {
  const session = await getUserSession(request);
  const userProfile = session.get("userProfile");

  const result = sessionProfileSchema.safeParse(userProfile);
  if (!result.success) return null;
  return result.data;
}

/**
 * @note only use server-side on pages
 * @see `src/server/lib/auth.ts` for API route version
 */
export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userProfile = session.get("userProfile");

  const result = sessionProfileSchema.safeParse(userProfile);

  if (!result.success) {
    const searchParams = new URLSearchParams({ redirectTo });
    throw redirect(`/login?${searchParams}`);
  }

  return result.data;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);

  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
