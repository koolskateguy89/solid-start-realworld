import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { prisma } from "~/server/db/client";
import { hashPassword } from "~/server/lib/password";
import { generateToken } from "~/server/lib/token";
import type { User } from "~/types/api";

export type RegistrationError = {
  errors: "exists" | "invalid";
};

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#registration
const registrationSchema = z.object({
  user: z.object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export async function POST({ request }: APIEvent) {
  const body = await request.json();

  const isValid = registrationSchema.safeParse(body);

  if (!isValid.success)
    return json<RegistrationError>({ errors: "invalid" }, { status: 422 });

  const { user } = isValid.data;

  const exists =
    (await prisma.user.count({
      where: { username: user.username },
    })) > 0;

  if (exists)
    return json<RegistrationError>({ errors: "exists" }, { status: 422 });

  const dbUser = await prisma.user.create({
    data: {
      username: user.username,
      email: user.email,
      password: await hashPassword(user.password),
      bio: "",
      image: "",
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return json<User>({
    ...dbUser,
    token: generateToken(dbUser),
  });
}
