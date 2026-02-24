"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const providerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  type: z.string().min(1, "El tipo es obligatorio"),
  contactName: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional().or(z.literal(NaN).transform(() => undefined)),
});

export async function getProviders(filters?: { type?: string; search?: string }) {
  await requireAuth();

  const where: any = { active: true };

  if (filters?.type && filters.type !== "all") {
    where.type = filters.type;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { contactName: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.provider.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { events: true, payments: true } },
    },
  });
}

export async function createProvider(formData: FormData) {
  await requireRole(["OWNER", "COORDINATOR"]);

  const raw = Object.fromEntries(formData.entries());

  const result = providerSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos inválidos" };
  }
  const parsed = result.data;

  try {
    await db.provider.create({
      data: {
        name: parsed.name,
        type: parsed.type,
        contactName: parsed.contactName || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        website: parsed.website || null,
        city: parsed.city || null,
        notes: parsed.notes || null,
        rating: parsed.rating || null,
      },
    });

    revalidatePath("/proveedores");
    return { success: true };
  } catch (err) {
    console.error("Error creando proveedor:", err);
    return { success: false, error: "Error al crear el proveedor" };
  }
}

export async function deleteProvider(id: string) {
  await requireRole(["OWNER"]);

  try {
    await db.provider.update({ where: { id }, data: { active: false } });
    revalidatePath("/proveedores");
    return { success: true };
  } catch (err) {
    console.error("Error desactivando proveedor:", err);
    return { success: false, error: "Error al eliminar el proveedor" };
  }
}

export async function getProviderTypes() {
  await requireAuth();
  const types = await db.provider.groupBy({ by: ["type"], _count: true });
  return types.map((t) => ({ type: t.type, count: t._count }));
}
