import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";

import { type SessionProfile, sessionProfileSchema } from "./auth";
import { serverEnv } from "~/env/server";

// https://start.solidjs.com/advanced/session

const storage = createCookieSessionStorage({
  cookie: {
    name: "RealWorld_session",
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

export async function createUserSession(
  user: SessionProfile,
  redirectTo: string
) {
  const session = await storage.getSession();

  session.set("userProfile", {
    email: user.email,
    username: user.username,
    image: user.image,
  } satisfies SessionProfile);

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
export async function requireUser(request: Request) {
  const session = await getUserSession(request);
  const userProfile = session.get("userProfile");

  const result = sessionProfileSchema.safeParse(userProfile);

  if (!result.success) {
    throw redirect("/login");
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
