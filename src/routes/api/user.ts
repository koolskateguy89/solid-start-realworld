import { type APIEvent, json } from "solid-start";
import { z } from "zod";

import { requireUser } from "~/server/lib/auth";
import { hashPassword } from "~/server/lib/password";
import { generateToken } from "~/server/lib/token";
import { prisma } from "~/server/db/client";
import type { ErrorResponse, User } from "~/types/api";

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
    // TODO: will need to limit the length cos it will be stored in a cookie
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    // TODO: enforce password min length
    password: z.string().optional(),
    bio: z.string().optional(),
    // TODO: will need to limit the length cos it will be stored in a cookie
    image: z.string().url().optional(),
  }),
});

export type UpdateUserBody = z.infer<typeof updateSchema>;

export type UpdateUserError = ErrorResponse<"NAME_TAKEN" | "EMAIL_TAKEN">;

export async function POST({ request }: APIEvent) {
  const userProfile = await requireUser(request);

  const body = await request.json();

  const isValid = updateSchema.safeParse(body);
  if (!isValid.success)
    return json<ErrorResponse>({ errors: isValid.error }, 422);

  const { user: data } = isValid.data;

  console.log("data =", data);

  // Only check if username is taken if it's changed
  if (data.username && data.username !== userProfile.username) {
    const usernameTaken =
      (await prisma.user.count({
        where: {
          username: data.username,
        },
      })) > 0;

    if (usernameTaken)
      return json<UpdateUserError>({ errors: "NAME_TAKEN" }, 422);
  }

  // TODO!: store email in session
  // const email = "test";
  const email = data.email;

  // Only check if email is taken if it's changed
  if (data.email && data.email !== email /*userProfile.email*/) {
    const emailTaken =
      (await prisma.user.count({
        where: {
          email: data.email,
        },
      })) > 0;

    if (emailTaken)
      return json<UpdateUserError>({ errors: "EMAIL_TAKEN" }, 422);
  }

  const user = await prisma.user.update({
    where: {
      username: userProfile.username,
    },
    data: {
      username: data.username,
      email: data.email,
      bio: data.bio,
      image: data.image,
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
