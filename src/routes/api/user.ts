import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { requireUser } from "~/server/lib/auth";
import { hashPassword } from "~/server/lib/password";
import { generateToken } from "~/server/lib/token";
import { prisma } from "~/server/db/client";
import type { User } from "~/types/api";

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#get-current-user
export async function GET({ request }: APIEvent) {
  const userProfile = await requireUser(request);

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username: userProfile.username,
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return json<User>({ ...user, token: generateToken(user) });
}

// https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#update-user
const updateSchema = z.object({
  user: z.object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1).optional(),
    bio: z.string().optional(),
    image: z.string().url().optional(),
  }),
});

export type UpdateUserBody = z.infer<typeof updateSchema>;

export type UpdateUserError = "TODO";

export async function POST({ request }: APIEvent) {
  const userProfile = await requireUser(request);

  const body = await request.json();

  const isValid = updateSchema.safeParse(body);
  if (!isValid.success)
    return json({ errors: { body: ["invalid"] } }, { status: 422 });

  const { user: data } = isValid.data;

  console.log("data =", data);

  // TODO: ensure new user & email are unique first, could use a findMany

  // TODO: return error using type UpdateUserError
  // and appropriate error code, 422?

  const user = await prisma.user.update({
    where: {
      username: userProfile.username,
    },
    data: {
      ...data,
      ...(data.password && {
        password: await hashPassword(data.password),
      }),
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return json<User>({ ...user, token: generateToken(user) });
}
