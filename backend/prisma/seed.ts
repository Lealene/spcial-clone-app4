import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const users = [];

  for (let i = 1; i <= 5; i++) {
    const hashed = await bcrypt.hash("password123", 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@gmail.com` },
      update: {},
      create: {
        username: `user${i}`,
        email: `user${i}@gmail.com`,
        password: hashed,
        bio: `Hi, I'm user${i}!`,
      },
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }

  for (const user of users) {
    for (let i = 1; i <= 5; i++) {
      const post = await prisma.post.create({
        data: {
          content: `Post ${i} by ${user.username} — hello world! 🚀`,
          authorId: user.id,
        },
      });

      await prisma.comment.create({
        data: {
          content: `Nice post #${i}!`,
          authorId: users[0].id,
          postId: post.id,
        },
      });

      await prisma.like.create({
        data: {
          userId: users[1].id,
          postId: post.id,
        },
      });
    }
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
