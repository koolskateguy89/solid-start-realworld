import bcrypt from "bcryptjs";

const saltRounds = 10;

/**
 * Hashes the provided password using the bcrypt algorithm.
 *
 * @param raw
 * @returns The hashed password
 */
export const hashPassword = (raw: string) => bcrypt.hash(raw, saltRounds);

/**
 * Checks if the provided password matches the hashed password.
 *
 * @param password
 * @param hash The hashed password
 * @returns
 */
export const isCorrectPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
