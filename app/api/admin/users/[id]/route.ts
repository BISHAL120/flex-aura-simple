import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { Prisma, type User } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const data: Prisma.UserUpdateInput = {};

    if (typeof body.isBanned === "boolean") {
      data.isBanned = body.isBanned;
    }

    if (Array.isArray(body.role)) {
      data.role = body.role.filter(
        (r: unknown): r is User["role"][number] =>
          typeof r === "string" && ["ADMIN", "MANAGER", "USER"].includes(r)
      );
    }

    // Profile fields (edit profile dialog)
    if (typeof body.firstName === "string") {
      data.firstName = body.firstName.trim();
    }
    if (typeof body.lastName === "string") {
      data.lastName = body.lastName.trim() || null;
    }
    if (typeof body.phoneNumber === "string") {
      data.phoneNumber = body.phoneNumber.trim() || null;
    }
    if (typeof body.location === "string") {
      data.location = body.location.trim() || null;
    }
    if (typeof body.bio === "string") {
      data.bio = body.bio.trim() || null;
    }

    // Derived display name: firstName + lastName (or keep current if unchanged)
    if (typeof body.firstName === "string" || typeof body.lastName === "string") {
      const current = await db.user.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
      const firstName = typeof body.firstName === "string" ? body.firstName.trim() : current?.firstName;
      const lastName =
        typeof body.lastName === "string" ? body.lastName.trim() || "" : current?.lastName || "";
      const name = `${firstName || ""} ${lastName}`.trim();
      if (name) {
        data.name = name;
      } else if (typeof body.firstName === "string") {
        data.name = body.firstName.trim();
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id },
      data,
      include: {
        sessions: { orderBy: { createdAt: "desc" } },
        accounts: true,
      },
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}
