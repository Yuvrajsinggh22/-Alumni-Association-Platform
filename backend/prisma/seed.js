
// Try loading .env from both parent and current directory
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
dotenv.config({ path: './.env' });
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const password = "password123";

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // check if demo user already exists
  const existing = await prisma.alumni.findUnique({ where: { email } });
  if (existing) {
    console.log("⚠️ Demo user already exists:", email);
    return;
  }

  // create demo user (auto-verified)
  await prisma.alumni.create({
    data: {
      name: "Demo User",
      degree: "B.Tech",
      currentJob: "Software Engineer",
      currentCompany: "Google",
      location: "Bangalore,India",
      bio: "Hi",
      skills: "Java",
      interests: "Java",
      linkedinUrl: "https://www.bikewale.com/kawasaki-bikes/z650rs/",
      githubUrl: "https://www.bikewale.com/kawasaki-bikes/z650rs/",
      websiteUrl: "https://www.bikewale.com/kawasaki-bikes/z650rs/",
      email,
      password: hashedPassword,
      graduationYear: 2024,
      isVerified: true,
      emailVerified: true
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
