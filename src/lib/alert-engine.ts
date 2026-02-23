import { db } from "@/lib/db";
import { daysUntil } from "@/lib/utils";
import type { AlertSeverity, AlertType } from "@prisma/client";

/**
 * Motor de Alertas Inteligentes
 *
 * Reglas basadas en proximidad temporal al evento:
 * - > 2 meses: No genera alertas
 * - 2 meses: Alertas sobre contratos y proveedores pendientes
 * - 1 mes: Alertas sobre pagos y checklists pendientes
 * - 1 semana: Todo es crítico
 */

interface AlertRule {
  check: (event: any, daysLeft: number) => AlertCandidate[];
}

interface AlertCandidate {
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  eventId: string;
}

const alertRules: AlertRule[] = [
  // Regla: Contratos pendientes (2 meses)
  {
    check(event, daysLeft) {
      if (daysLeft > 60 || daysLeft < 0) return [];

      const pendingContracts = event.contracts.filter(
        (c: any) => c.status === "PENDIENTE" || c.status === "ENVIADO"
      );

      if (pendingContracts.length === 0) return [];

      const severity: AlertSeverity = daysLeft <= 7 ? "CRITICAL" : daysLeft <= 30 ? "WARNING" : "INFO";

      return [
        {
          title: `${pendingContracts.length} contrato(s) sin firmar`,
          message: `El evento "${event.name}" tiene ${pendingContracts.length} contrato(s) pendientes de firma y faltan ${daysLeft} días.`,
          type: "CONTRATO" as AlertType,
          severity,
          eventId: event.id,
        },
      ];
    },
  },

  // Regla: Proveedores no confirmados (2 meses)
  {
    check(event, daysLeft) {
      if (daysLeft > 60 || daysLeft < 0) return [];

      const unconfirmed = event.providers.filter((ep: any) => !ep.confirmed);
      if (unconfirmed.length === 0) return [];

      const severity: AlertSeverity = daysLeft <= 7 ? "CRITICAL" : daysLeft <= 30 ? "WARNING" : "INFO";

      return [
        {
          title: `${unconfirmed.length} proveedor(es) sin confirmar`,
          message: `El evento "${event.name}" tiene ${unconfirmed.length} proveedor(es) pendientes de confirmación.`,
          type: "PROVEEDOR" as AlertType,
          severity,
          eventId: event.id,
        },
      ];
    },
  },

  // Regla: Pagos pendientes (1 mes)
  {
    check(event, daysLeft) {
      if (daysLeft > 30 || daysLeft < 0) return [];

      const pendingPayments = event.payments.filter(
        (p: any) => p.status === "PENDIENTE" || p.status === "PARCIAL"
      );
      if (pendingPayments.length === 0) return [];

      const totalPending = pendingPayments.reduce((acc: number, p: any) => acc + p.amount, 0);
      const severity: AlertSeverity = daysLeft <= 7 ? "CRITICAL" : "WARNING";

      return [
        {
          title: `Pagos pendientes: $${totalPending.toLocaleString()}`,
          message: `El evento "${event.name}" tiene ${pendingPayments.length} pago(s) pendientes por un total de $${totalPending.toLocaleString()}.`,
          type: "PAGO" as AlertType,
          severity,
          eventId: event.id,
        },
      ];
    },
  },

  // Regla: Pagos vencidos (cualquier momento)
  {
    check(event, daysLeft) {
      if (daysLeft < 0) return [];

      const overduePayments = event.payments.filter(
        (p: any) => p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "COMPLETADO"
      );
      if (overduePayments.length === 0) return [];

      return [
        {
          title: `${overduePayments.length} pago(s) vencidos`,
          message: `El evento "${event.name}" tiene pagos vencidos que requieren atención inmediata.`,
          type: "PAGO" as AlertType,
          severity: "CRITICAL" as AlertSeverity,
          eventId: event.id,
        },
      ];
    },
  },

  // Regla: Checklists incompletos (1 mes)
  {
    check(event, daysLeft) {
      if (daysLeft > 30 || daysLeft < 0) return [];

      const totalItems = event.checklists.reduce(
        (acc: number, cl: any) => acc + cl.items.length,
        0
      );
      const completed = event.checklists.reduce(
        (acc: number, cl: any) =>
          acc + cl.items.filter((i: any) => i.completed).length,
        0
      );

      if (totalItems === 0 || completed === totalItems) return [];

      const percent = Math.round((completed / totalItems) * 100);
      const severity: AlertSeverity = daysLeft <= 7 ? "CRITICAL" : "WARNING";

      return [
        {
          title: `Checklists al ${percent}%`,
          message: `El evento "${event.name}" tiene ${totalItems - completed} tarea(s) pendientes de ${totalItems} totales.`,
          type: "CHECKLIST" as AlertType,
          severity,
          eventId: event.id,
        },
      ];
    },
  },

  // Regla: Evento en 1 semana sin documentos clave
  {
    check(event, daysLeft) {
      if (daysLeft > 7 || daysLeft < 0) return [];

      const hasContract = event.documents.some((d: any) => d.type === "contrato");
      const hasRider = event.documents.some((d: any) => d.type === "rider");

      const missing: string[] = [];
      if (!hasContract) missing.push("contrato");
      if (!hasRider) missing.push("rider");

      if (missing.length === 0) return [];

      return [
        {
          title: `Documentos faltantes`,
          message: `A ${daysLeft} día(s) del evento "${event.name}" faltan: ${missing.join(", ")}.`,
          type: "GENERAL" as AlertType,
          severity: "CRITICAL" as AlertSeverity,
          eventId: event.id,
        },
      ];
    },
  },
];

export async function generateAlerts(): Promise<number> {
  // Traer eventos activos con toda su info
  const events = await db.event.findMany({
    where: {
      status: { in: ["CONFIRMADO", "EN_PRODUCCION"] },
      date: { gte: new Date() },
    },
    include: {
      contracts: true,
      providers: true,
      payments: true,
      checklists: { include: { items: true } },
      documents: true,
    },
  });

  const allCandidates: AlertCandidate[] = [];

  for (const event of events) {
    const days = daysUntil(event.date);

    // > 2 meses: no generar alertas
    if (days > 60) continue;

    for (const rule of alertRules) {
      const candidates = rule.check(event, days);
      allCandidates.push(...candidates);
    }
  }

  // Limpiar alertas no leídas anteriores y crear nuevas
  await db.alert.deleteMany({ where: { read: false } });

  if (allCandidates.length > 0) {
    await db.alert.createMany({
      data: allCandidates.map((c) => ({
        title: c.title,
        message: c.message,
        type: c.type,
        severity: c.severity,
        eventId: c.eventId,
        link: `/eventos/${c.eventId}`,
      })),
    });
  }

  return allCandidates.length;
}
