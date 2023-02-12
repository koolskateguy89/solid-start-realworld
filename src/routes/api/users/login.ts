import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { prisma } from "~/server/db/client";
import { isCorrectPassword } from "~/server/lib/password";
import { generateToken } from "~/server/lib/token";
import type { User } from "~/types/api";

export type LoginError = {
  errors: "notexists" | "invalid";
};

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#authentication
const loginSchema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export type LoginBody = z.infer<typeof loginSchema>;

export async function POST({ request }: APIEvent) {
  const body = await request.json();

  const isValid = loginSchema.safeParse(body);

  if (!isValid.success)
    return json<LoginError>({ errors: "invalid" }, { status: 422 });

  const { user } = isValid.data;

  const dbUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    select: {
      username: true,
      email: true,
      image: true,
      bio: true,
      password: true,
    },
  });

  if (!dbUser)
    return json<LoginError>({ errors: "notexists" }, { status: 422 });

  const isCorrect = await isCorrectPassword(user.password, dbUser.password);

  if (!isCorrect)
    return json<LoginError>({ errors: "invalid" }, { status: 401 });

  return json<User>({
    email: dbUser.email,
    username: dbUser.username,
    bio: dbUser.bio,
    image: dbUser.image,
    token: generateToken(dbUser),
  });
}
