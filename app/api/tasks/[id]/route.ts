import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rebalancePositions, needsRebalance } from "@/lib/position";
import { TaskStatus, Priority } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!task || task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, status, priority, dueDate, position, labelIds } =
    body;

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status: status as TaskStatus }),
      ...(priority !== undefined && { priority: priority as Priority }),
      ...(position !== undefined && { position }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(labelIds !== undefined && {
        labels: {
          deleteMany: {},
          create: labelIds.map((labelId: string) => ({ labelId })),
        },
      }),
    },
    include: {
      labels: { include: { label: true } },
    },
  });

  if (position !== undefined) {
    const columnTasks = await prisma.task.findMany({
      where: { userId: session.user.id, status: updated.status },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });

    if (needsRebalance(columnTasks, 0)) {
      const updates = rebalancePositions(columnTasks);
      prisma.$transaction(
        updates.map((u) =>
          prisma.task.update({
            where: { id: u.id },
            data: { position: u.position },
          })
        )
      ).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!task || task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
