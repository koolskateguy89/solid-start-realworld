import jwt from "jsonwebtoken";

import { type SessionProfile, sessionProfileSchema } from "./auth";
import { serverEnv } from "~/env/server";

export type TokenSession = {
  user: SessionProfile;
};

/*
auth strategy:

- store a subset of `User` in the token payload
- store the token in localStorage
- use `jwt.decode()` to decode the token on the client-side
- use `jwt.verify()` to verify the token on the server-side

- [server] `generateToken(User)` will use the entire `User` object as the payload
- [server] `getSession(Request)` should return the entire `User` object, or `null` if the token is invalid/missing
  - the token should be in the `Authorization` header
*/

/**
 * Generates a JWT token that is to be used as an authentication token.
 * - payload contains email, username and image
 * - expires in a week from the date it was generated
 *
 * @param user
 * @returns JWT authentication token
 */
export function generateToken(user: SessionProfile): string {
  return jwt.sign(
    {
      user: {
        email: user.email,
        username: user.username,
        image: user.image,
      },
    } satisfies TokenSession,
    serverEnv.TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

export function getToken(request: Request): string | null {
  return request.headers.get("Authorization")?.split(" ")[1] ?? null;
}

/**
 * Gets the session stored in the token in the `Authorization` header.
 *
 * @returns The session contained in the token payload, or `null` if the token is invalid/missing
 */
export function getSession(request: Request): TokenSession | null {
  const token = getToken(request);
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      serverEnv.TOKEN_SECRET
    ) as jwt.JwtPayload | null;

    if (!decoded) return null;

    const user = sessionProfileSchema.parse(decoded.user);

    return {
      user,
    };
  } catch (err) {
    return null;
  }
}
