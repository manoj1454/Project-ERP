import { PrismaClient, ClientStatus, ProjectStatus, TaskPriority, TaskStatus, InteractionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CRM Clients and Project Engine Hierarchy...");

  const adminUser = await prisma.user.findUnique({ where: { email: "admin@workspace.erp" } });
  const employeeUser = await prisma.user.findUnique({ where: { email: "employee@workspace.erp" } });

  if (!adminUser || !employeeUser) {
    console.error("Please run the auth seed first!");
    return;
  }

  // 1. Seed Clients
  const clientAcme = await prisma.client.upsert({
    where: { id: "c1111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "c1111111-1111-1111-1111-111111111111",
      name: "Marcus Vance",
      companyName: "Acme Global Technologies",
      email: "marcus@acmeglobal.com",
      phone: "+1 (555) 019-2834",
      address: "100 Innovation Blvd, Austin, TX",
      status: ClientStatus.ACTIVE,
    },
  });

  const clientAether = await prisma.client.upsert({
    where: { id: "c2222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "c2222222-2222-2222-2222-222222222222",
      name: "Dr. Elena Zhao",
      companyName: "Aether Robotics & AI",
      email: "elena@aether-robotics.io",
      phone: "+1 (555) 438-9120",
      address: "45 Technology Square, Cambridge, MA",
      status: ClientStatus.ACTIVE,
    },
  });

  const clientVertex = await prisma.client.upsert({
    where: { id: "c3333333-3333-3333-3333-333333333333" },
    update: {},
    create: {
      id: "c3333333-3333-3333-3333-333333333333",
      name: "Julian Rivera",
      companyName: "Vertex BioHealth Labs",
      email: "jrivera@vertexbio.org",
      phone: "+1 (555) 762-0941",
      address: "88 BioPark Parkway, San Diego, CA",
      status: ClientStatus.LEAD,
    },
  });

  // Seed Interaction Logs
  await prisma.interactionLog.createMany({
    data: [
      {
        clientId: clientAcme.id,
        userId: adminUser.id,
        type: InteractionType.MEETING,
        notes: "Executive steering committee reviewed Q3 migration milestones. Budget cleared for phase 2.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        clientId: clientAether.id,
        userId: employeeUser.id,
        type: InteractionType.CALL,
        notes: "Technical alignment call with robotics engineering team regarding sensor telemetry rates.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      },
      {
        clientId: clientVertex.id,
        userId: adminUser.id,
        type: InteractionType.EMAIL,
        notes: "Sent proposal draft and regulatory compliance specifications for clinical dashboard.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    ],
    skipDuplicates: true,
  });

  // 2. Seed Projects & Full Hierarchy (Project -> Phase -> Task -> SubTask)
  const existingProject = await prisma.project.findFirst({
    where: { name: "Enterprise Multi-Cloud Infrastructure" },
  });

  if (!existingProject) {
    const project1 = await prisma.project.create({
      data: {
        name: "Enterprise Multi-Cloud Infrastructure",
        clientId: clientAcme.id,
        description: "Zero-downtime container migration and automated CI/CD pipeline orchestration.",
        budget: 125000.0,
        status: ProjectStatus.ACTIVE,
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-12-15"),
        phases: {
          create: [
            {
              name: "Phase 1: Discovery & System Audit",
              orderIndex: 0,
              status: "COMPLETED",
              tasks: {
                create: [
                  {
                    name: "Audit Existing Docker Workloads",
                    description: "Inventory all 42 microservices and compute resource allocations.",
                    priority: TaskPriority.HIGH,
                    status: TaskStatus.DONE,
                    assigneeId: employeeUser.id,
                    deadline: new Date("2026-08-15"),
                    subTasks: {
                      create: [
                        { name: "Extract container base images", isCompleted: true },
                        { name: "Verify CVE security baselines", isCompleted: true },
                      ],
                    },
                  },
                  {
                    name: "Network Topology & VPN Architecture",
                    description: "Establish dedicated site-to-site IPsec tunnel.",
                    priority: TaskPriority.MED,
                    status: TaskStatus.DONE,
                    assigneeId: adminUser.id,
                    deadline: new Date("2026-08-20"),
                    subTasks: {
                      create: [
                        { name: "Configure BGP routing tables", isCompleted: true },
                        { name: "Validate failover latency < 25ms", isCompleted: true },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: "Phase 2: Kubernetes Cluster Provisioning",
              orderIndex: 1,
              status: "IN_PROGRESS",
              tasks: {
                create: [
                  {
                    name: "Deploy Production EKS Control Plane",
                    description: "Multi-AZ high-availability cluster with managed node groups.",
                    priority: TaskPriority.HIGH,
                    status: TaskStatus.IN_PROGRESS,
                    assigneeId: employeeUser.id,
                    deadline: new Date("2026-10-25"),
                    subTasks: {
                      create: [
                        { name: "Provision Terraform VPC modules", isCompleted: true },
                        { name: "Deploy ingress-nginx with cert-manager", isCompleted: false },
                        { name: "Configure Prometheus / Grafana scraping", isCompleted: false },
                      ],
                    },
                  },
                  {
                    name: "PostgreSQL Connection Pooling & Read Replicas",
                    description: "Configure PgBouncer / Supavisor topology for sub-millisecond response.",
                    priority: TaskPriority.HIGH,
                    status: TaskStatus.TODO,
                    assigneeId: employeeUser.id,
                    deadline: new Date("2026-11-05"),
                    subTasks: {
                      create: [
                        { name: "Benchmark concurrent client connections", isCompleted: false },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: "Phase 3: Production Cutover & Validation",
              orderIndex: 2,
              status: "PENDING",
              tasks: {
                create: [
                  {
                    name: "DNS Traffic Switch & Chaos Engineering Tests",
                    description: "Execute blue-green DNS switchover during off-peak window.",
                    priority: TaskPriority.HIGH,
                    status: TaskStatus.TODO,
                    assigneeId: adminUser.id,
                    deadline: new Date("2026-12-01"),
                  },
                ],
              },
            },
          ],
        },
      },
    });

    console.log(`✓ Seeded Project Hierarchy for: "${project1.name}"`);
  }

  console.log("CRM & Project Hierarchy Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
