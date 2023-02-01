import jwt from "jsonwebtoken";

import { serverEnv } from "~/env/server";

/**
 * Generates a JWT token that is to be used as an authentication token.
 * - payload contains username
 * - expires in a week from the date it was generated
 *
 * @param username
 * @returns JWT authentication token
 * @note server-side only
 */
export function generateToken(username: string): string {
  return jwt.sign({ username }, serverEnv.TOKEN_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies the provided `token` and returns the username contained in the token's payload.
 * Returns `null` if the token cannot be verified.
 *
 * @param token
 * @returns The username contained in the token payload
 * @note server-side only
 * @note this function does not verify the token's signature
 */
export function getUsernameFromToken(token: string): string | null {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  return (decoded?.username as string) ?? null;
}
