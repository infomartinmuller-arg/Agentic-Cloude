"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EventStatus } from "@prisma/client";

const eventSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    venue: z.string().optional(),
    city: z.string().optional(),
    date: z.string().min(1, "La fecha es obligatoria"),
    endDate: z.string().optional(),
    status: z
      .enum(["BORRADOR", "CONFIRMADO", "EN_PRODUCCION", "FINALIZADO", "CANCELADO"])
      .optional(),
    budget: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.date) {
        return new Date(data.endDate) >= new Date(data.date);
      }
      return true;
    },
    { message: "La fecha de fin debe ser posterior a la fecha de inicio", path: ["endDate"] }
  );

export async function createEvent(formData: FormData) {
  const user = await requireRole(["OWNER", "COORDINATOR"]);

  const raw = Object.fromEntries(formData.entries());

  const result = eventSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos inválidos" };
  }
  const parsed = result.data;

  try {
    const event = await db.event.create({
      data: {
        name: parsed.name,
        description: parsed.description || null,
        venue: parsed.venue || null,
        city: parsed.city || null,
        date: new Date(parsed.date),
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        status: (parsed.status as EventStatus) || "BORRADOR",
        budget: parsed.budget || 0,
        notes: parsed.notes || null,
        creatorId: user.id,
      },
    });

    revalidatePath("/eventos");
    revalidatePath("/dashboard");
    return { success: true, eventId: event.id };
  } catch (err) {
    console.error("Error creando evento:", err);
    return { success: false, error: "Error al crear el evento" };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  await requireRole(["OWNER", "COORDINATOR"]);

  const raw = Object.fromEntries(formData.entries());

  const result = eventSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos inválidos" };
  }
  const parsed = result.data;

  try {
    const existing = await db.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return { success: false, error: "Evento no encontrado" };
    }

    await db.event.update({
      where: { id: eventId },
      data: {
        name: parsed.name,
        description: parsed.description || null,
        venue: parsed.venue || null,
        city: parsed.city || null,
        date: new Date(parsed.date),
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        status: (parsed.status as EventStatus) || undefined,
        budget: parsed.budget || 0,
        notes: parsed.notes || null,
      },
    });

    revalidatePath("/eventos");
    revalidatePath(`/eventos/${eventId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error actualizando evento:", err);
    return { success: false, error: "Error al actualizar el evento" };
  }
}

export async function deleteEvent(eventId: string) {
  await requireRole(["OWNER"]);

  try {
    const existing = await db.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return { success: false, error: "Evento no encontrado" };
    }

    await db.event.delete({ where: { id: eventId } });

    revalidatePath("/eventos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error eliminando evento:", err);
    return { success: false, error: "Error al eliminar el evento" };
  }
}

export async function getEvents(filters?: {
  status?: string;
  search?: string;
}) {
  await requireAuth();

  const where: any = {};

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { venue: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.event.findMany({
    where,
    orderBy: { date: "asc" },
    include: {
      _count: {
        select: {
          providers: true,
          payments: true,
          checklists: true,
          documents: true,
          alerts: true,
        },
      },
      creator: { select: { name: true } },
    },
  });
}

export async function getEventById(eventId: string) {
  await requireAuth();

  return db.event.findUnique({
    where: { id: eventId },
    include: {
      creator: { select: { name: true, email: true } },
      providers: {
        include: { provider: true },
        orderBy: { createdAt: "desc" },
      },
      contracts: { orderBy: { createdAt: "desc" } },
      payments: {
        orderBy: { createdAt: "desc" },
        include: { providerPayment: { include: { provider: true } } },
      },
      checklists: {
        include: { items: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      alerts: { orderBy: { createdAt: "desc" }, take: 20 },
      responsibles: {
        include: { user: { select: { name: true, email: true, role: true } } },
      },
    },
  });
}
