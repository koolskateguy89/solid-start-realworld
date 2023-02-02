import { PrismaClient, type Prisma } from "@prisma/client";

import { hashPassword } from "../src/server/lib/password";

// FIXME: seeding doesn't work without "type": "module" in package.json
// not sure if can find workaround for this or just need to add that whenever seeding
// but need to remove it when running the app, otherwise it won't work

const prisma = new PrismaClient();

const users: Prisma.UserCreateInput[] = [
  {
    username: "testuser1",
    email: "test1@test.com",
    bio: "I work at statefarm",
    image: "https://i.stack.imgur.com/xHWG8.jpg",
    password: "test1",
  },
  {
    username: "testuser2",
    email: "test2@test.com",
    bio: "I work at google",
    image: "https://i.stack.imgur.com/l60Hf.png",
    password: "test2",
  },
  // TODO: use with space in their name so can test url
];

const tags: Prisma.TagCreateInput[] = [
  { name: "programming" },
  { name: "javascript" },
  { name: "emberjs" },
  { name: "angularjs" },
  { name: "react" },
  { name: "mean" },
  { name: "node" },
  { name: "rails" },
];

// TODO: article data
const articles: Prisma.ArticleCreateInput[] = [
  {
    slug: "how-to-train-your-dragon",
    title: "How to train your dragon",
    description: "Ever wonder how?",
    body: "It takes a Jacobian",
    tagList: {
      connectOrCreate: [
        {
          create: { name: "dragons" },
          where: { name: "dragons" },
        },
        {
          create: { name: "training" },
          where: { name: "training" },
        },
      ],
    },
    author: {
      connect: { username: "testuser1" },
    },
  },
  {
    slug: "how-to-train-your-dragon-2",
    title: "How to train your dragon 2",
    description: "So toothless",
    body: "It a dragon",
    tagList: {
      connectOrCreate: [
        {
          create: { name: "dragons" },
          where: { name: "dragons" },
        },
        {
          create: { name: "training" },
          where: { name: "training" },
        },
      ],
    },
    author: {
      connect: { username: "testuser1" },
    },
  },
];

async function main() {
  console.log("Start seeding ...");

  await prisma.$transaction(
    async () => {
      for (const u of users) {
        const user = await prisma.user.create({
          data: {
            ...u,
            password: await hashPassword(u.password),
          },
        });

        console.log(`Created user with email: ${user.email}`);
      }

      for (const t of tags) {
        const tag = await prisma.tag.create({
          data: t,
        });

        console.log(`Created tag with name: ${tag.name}`);
      }

      for (const a of articles) {
        const article = await prisma.article.create({
          data: a,
        });

        console.log(`Created article with slug: ${article.slug}`);
      }
    },
    {
      timeout: 15_000, // 15 seconds timeout
    }
  );

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
