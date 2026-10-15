import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample TimeEntry records...");

  const adminUser = await prisma.user.findUnique({ where: { email: "admin@workspace.erp" } });
  const employeeUser = await prisma.user.findUnique({ where: { email: "employee@workspace.erp" } });

  if (!adminUser || !employeeUser) {
    console.error("Missing users for time-tracking seeding.");
    return;
  }

  const tasks = await prisma.task.findMany({ take: 3 });
  if (tasks.length === 0) {
    console.error("No tasks found. Please seed projects first.");
    return;
  }

  const now = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;

  const entries = [
    {
      userId: employeeUser.id,
      taskId: tasks[0].id,
      startTime: new Date(now - dayMs * 3 + 1000 * 60 * 60 * 9), // 3 days ago at 9am
      endTime: new Date(now - dayMs * 3 + 1000 * 60 * 60 * 11 + 1000 * 60 * 30), // 2.5 hours
      durationMinutes: 150,
      isBillable: true,
      notes: "Audited existing Docker microservices and extracted base image layers.",
      isBilled: true,
    },
    {
      userId: adminUser.id,
      taskId: tasks[0].id,
      startTime: new Date(now - dayMs * 2 + 1000 * 60 * 60 * 10),
      endTime: new Date(now - dayMs * 2 + 1000 * 60 * 60 * 12),
      durationMinutes: 120,
      isBillable: true,
      notes: "Architectural consultation on site-to-site IPsec VPN tunnel security baselines.",
      isBilled: false,
    },
    {
      userId: employeeUser.id,
      taskId: tasks[1] ? tasks[1].id : tasks[0].id,
      startTime: new Date(now - dayMs * 1 + 1000 * 60 * 60 * 14),
      endTime: new Date(now - dayMs * 1 + 1000 * 60 * 60 * 16 + 1000 * 60 * 45),
      durationMinutes: 165,
      isBillable: true,
      notes: "Configured Terraform EKS modules and deployed Prometheus/Grafana helm charts.",
      isBilled: false,
    },
    {
      userId: employeeUser.id,
      taskId: tasks[1] ? tasks[1].id : tasks[0].id,
      startTime: new Date(now - 1000 * 60 * 60 * 5),
      endTime: new Date(now - 1000 * 60 * 60 * 4 + 1000 * 60 * 15),
      durationMinutes: 75,
      isBillable: false,
      notes: "Internal staff engineering sprint retrospective and team alignment.",
      isBilled: false,
    },
  ];

  for (const entry of entries) {
    await prisma.timeEntry.create({
      data: entry,
    });
  }

  console.log(`✓ Seeded ${entries.length} realistic TimeEntry records into Supabase!`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
