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
      department: "Computer Science Engineering",
      degree:"B.Tech",
      currentJob:"Software Engineer",
      currentJob:"Google",
      location:"Bangalore,India",
      bio:"Hi",
      skills:"Java",
      interests:"Java",
      linkedinUrl:"https://www.bikewale.com/kawasaki-bikes/z650rs/",
      githubUrl:"https://www.bikewale.com/kawasaki-bikes/z650rs/",
      websiteUrl:"https://www.bikewale.com/kawasaki-bikes/z650rs/",
      email,
      password: hashedPassword,
      graduationYear: 2024,
      
      
      
      isVerified: true,
      emailVerified: true
    }
  });

  console.log("✅ Demo user created:");
  console.log("   Email: demo@example.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
