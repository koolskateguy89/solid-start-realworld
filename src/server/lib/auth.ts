import { json } from "solid-start";

import type { ErrorResponse } from "~/types/api";
import { type SessionProfile, getUserProfile } from "./session";
import { getSession } from "./token";

export async function getUser(
  request: Request
): Promise<SessionProfile | null> {
  const userProfile = await getUserProfile(request);

  return userProfile ?? getSession(request)?.user ?? null;
}

export async function requireUser(request: Request): Promise<SessionProfile> {
  const user = await getUser(request);

  if (!user) {
    throw json(
      {
        errors: "Unauthorised",
      } satisfies ErrorResponse,
      {
        status: 401,
      }
    );
  }

  return user;
}
