import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id, sessionId } = await params;

    if (typeof id !== "string" || !id || typeof sessionId !== "string" || !sessionId) {
      return NextResponse.json({ message: "Invalid request params" }, { status: 400 });
    }

    // Only delete the session if it belongs to the target user.
    const deleted = await db.session.deleteMany({
      where: { id: sessionId, userId: id },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error revoking session:", error);
    return NextResponse.json({ message: "Failed to revoke session" }, { status: 500 });
  }
}
