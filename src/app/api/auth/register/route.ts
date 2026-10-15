import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role = "EMPLOYEE" } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Validate role
    let assignedRole: Role = Role.EMPLOYEE;
    if (Object.values(Role).includes(role as Role)) {
      assignedRole = role as Role;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and profile
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role: assignedRole,
        profile: {
          create: {
            jobTitle: assignedRole === Role.SUPERADMIN ? "Executive Administrator" : assignedRole === Role.CLIENT ? "Client Representative" : "Associate Engineer",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during registration." },
      { status: 500 }
    );
  }
}
