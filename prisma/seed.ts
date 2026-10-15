import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RBAC Users into Supabase...");

  const users = [
    {
      email: "admin@workspace.erp",
      name: "Sarah Chen (SuperAdmin)",
      password: "Admin@123",
      role: Role.SUPERADMIN,
      jobTitle: "Chief Executive Admin",
    },
    {
      email: "employee@workspace.erp",
      name: "David Kim (Lead Engineer)",
      password: "Employee@123",
      role: Role.EMPLOYEE,
      jobTitle: "Senior Systems Engineer",
    },
    {
      email: "client@workspace.erp",
      name: "Apex Global (Client Partner)",
      password: "Client@123",
      role: Role.CLIENT,
      jobTitle: "Client Representative",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        name: u.name,
        passwordHash,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        profile: {
          create: {
            jobTitle: u.jobTitle,
          },
        },
      },
    });

    console.log(`✓ Seeded user: ${user.email} with Role: [${user.role}]`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
