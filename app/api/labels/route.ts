import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const labels = await prisma.label.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(labels);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, color } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!color?.match(/^#[0-9a-fA-F]{6}$/)) {
    return NextResponse.json(
      { error: "Color must be a valid hex code (e.g. #3b82f6)" },
      { status: 400 }
    );
  }

  const label = await prisma.label.create({
    data: {
      name: name.trim(),
      color,
      userId: session.user.id,
    },
  });

  return NextResponse.json(label, { status: 201 });
}