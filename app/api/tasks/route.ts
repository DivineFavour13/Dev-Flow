import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus, Priority } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as TaskStatus | null;

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status } : {}),
    },
    include: {
      labels: {
        include: { label: true },
      },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, status, priority, dueDate, labelIds, position } =
    body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const lastTask = await prisma.task.findFirst({
    where: { userId: session.user.id, status: status ?? "TODO" },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? null,
      status: (status as TaskStatus) ?? "TODO",
      priority: (priority as Priority) ?? "LOW",
      position: position ?? (lastTask ? lastTask.position + 1 : 1),
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: session.user.id,
      labels: labelIds?.length
        ? {
            create: labelIds.map((labelId: string) => ({ labelId })),
          }
        : undefined,
    },
    include: {
      labels: { include: { label: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}