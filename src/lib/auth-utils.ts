import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard?error=sin-permisos");
  }
  return user;
}

// Permisos por rol
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  OWNER: [
    "events:read", "events:write", "events:delete",
    "providers:read", "providers:write", "providers:delete",
    "payments:read", "payments:write", "payments:delete",
    "contracts:read", "contracts:write", "contracts:delete",
    "checklists:read", "checklists:write",
    "documents:read", "documents:write", "documents:delete",
    "users:read", "users:write", "users:delete",
    "config:read", "config:write",
  ],
  COORDINATOR: [
    "events:read", "events:write",
    "providers:read", "providers:write",
    "payments:read",
    "contracts:read", "contracts:write",
    "checklists:read", "checklists:write",
    "documents:read", "documents:write",
    "users:read",
  ],
  TREASURER: [
    "events:read",
    "providers:read",
    "payments:read", "payments:write",
    "contracts:read",
    "documents:read",
  ],
  DESIGNER: [
    "events:read",
    "providers:read",
    "documents:read", "documents:write",
    "checklists:read",
  ],
  ASSISTANT: [
    "events:read",
    "providers:read",
    "payments:read",
    "checklists:read",
    "documents:read",
  ],
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    OWNER: "Dueño",
    COORDINATOR: "Coordinador",
    TREASURER: "Tesorero",
    DESIGNER: "Diseñador",
    ASSISTANT: "Asistente",
  };
  return labels[role] || role;
}
