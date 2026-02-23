import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CreditCard, AlertTriangle, CheckSquare, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData() {
  const [
    totalEvents,
    activeEvents,
    totalProviders,
    pendingPayments,
    totalPaymentsAmount,
    paidAmount,
    recentAlerts,
    upcomingEvents,
    checklistProgress,
  ] = await Promise.all([
    db.event.count(),
    db.event.count({ where: { status: { in: ["CONFIRMADO", "EN_PRODUCCION"] } } }),
    db.provider.count({ where: { active: true } }),
    db.payment.count({ where: { status: { in: ["PENDIENTE", "PARCIAL"] } } }),
    db.payment.aggregate({ _sum: { amount: true } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETADO" } }),
    db.alert.findMany({
      where: { read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { event: { select: { name: true } } },
    }),
    db.event.findMany({
      where: { date: { gte: new Date() }, status: { not: "CANCELADO" } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    db.checklistItem.groupBy({
      by: ["completed"],
      _count: true,
    }),
  ]);

  const totalItems = checklistProgress.reduce((acc, g) => acc + g._count, 0);
  const completedItems = checklistProgress.find((g) => g.completed === true)?._count || 0;
  const checklistPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    totalEvents,
    activeEvents,
    totalProviders,
    pendingPayments,
    totalBudget: totalPaymentsAmount._sum.amount || 0,
    paidAmount: paidAmount._sum.amount || 0,
    recentAlerts,
    upcomingEvents,
    checklistPercent,
  };
}

export default async function DashboardPage() {
  await requireAuth();
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu gestión de eventos</p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Eventos Activos"
          value={data.activeEvents.toString()}
          subtitle={`${data.totalEvents} totales`}
          icon={<Calendar className="h-5 w-5 text-blue-600" />}
        />
        <MetricCard
          title="Proveedores"
          value={data.totalProviders.toString()}
          subtitle="Activos en la plataforma"
          icon={<Users className="h-5 w-5 text-green-600" />}
        />
        <MetricCard
          title="Pagos Pendientes"
          value={data.pendingPayments.toString()}
          subtitle={`${formatCurrency(data.totalBudget - data.paidAmount)} por pagar`}
          icon={<CreditCard className="h-5 w-5 text-orange-600" />}
        />
        <MetricCard
          title="Checklists"
          value={`${data.checklistPercent}%`}
          subtitle="Completado global"
          icon={<CheckSquare className="h-5 w-5 text-purple-600" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            <CardDescription>Eventos más cercanos en el calendario</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay eventos próximos</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingEvents.map((event) => {
                  const days = daysUntil(event.date);
                  return (
                    <Link
                      key={event.id}
                      href={`/eventos/${event.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.date)} {event.venue && `- ${event.venue}`}
                        </p>
                      </div>
                      <Badge
                        variant={
                          days <= 7 ? "destructive" : days <= 30 ? "warning" : "secondary"
                        }
                      >
                        {days === 0
                          ? "Hoy"
                          : days === 1
                          ? "Mañana"
                          : `${days} días`}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertas Recientes</CardTitle>
            <CardDescription>Notificaciones sin leer</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay alertas pendientes</p>
            ) : (
              <div className="space-y-3">
                {data.recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        alert.severity === "CRITICAL"
                          ? "text-destructive"
                          : alert.severity === "WARNING"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alert.message}
                      </p>
                      {alert.event && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Evento: {alert.event.name}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        alert.severity === "CRITICAL"
                          ? "destructive"
                          : alert.severity === "WARNING"
                          ? "warning"
                          : "info"
                      }
                      className="shrink-0"
                    >
                      {alert.severity === "CRITICAL"
                        ? "Crítico"
                        : alert.severity === "WARNING"
                        ? "Atención"
                        : "Info"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen financiero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(data.totalBudget)}</p>
              <p className="text-sm text-muted-foreground">Presupuesto Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.paidAmount)}</p>
              <p className="text-sm text-muted-foreground">Pagado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(data.totalBudget - data.paidAmount)}
              </p>
              <p className="text-sm text-muted-foreground">Pendiente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="rounded-full bg-muted p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
