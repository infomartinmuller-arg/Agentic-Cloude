import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, CheckCircle, Info } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

async function getAlerts() {
  return db.alert.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, name: true } },
    },
    take: 50,
  });
}

export default async function AlertasPage() {
  await requireAuth();
  const alerts = await getAlerts();

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-muted-foreground">
          {unread} alerta{unread !== 1 ? "s" : ""} sin leer
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay alertas
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon =
              alert.severity === "CRITICAL"
                ? AlertTriangle
                : alert.severity === "WARNING"
                ? Bell
                : Info;
            const iconColor =
              alert.severity === "CRITICAL"
                ? "text-destructive"
                : alert.severity === "WARNING"
                ? "text-yellow-600"
                : "text-blue-600";

            return (
              <Card
                key={alert.id}
                className={alert.read ? "opacity-60" : ""}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{alert.title}</p>
                      {!alert.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {alert.event && (
                        <Link
                          href={`/eventos/${alert.event.id}`}
                          className="text-primary hover:underline"
                        >
                          {alert.event.name}
                        </Link>
                      )}
                      <span>{formatDateTime(alert.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge
                      variant={
                        alert.severity === "CRITICAL"
                          ? "destructive"
                          : alert.severity === "WARNING"
                          ? "warning"
                          : "info"
                      }
                    >
                      {alert.severity === "CRITICAL"
                        ? "Crítico"
                        : alert.severity === "WARNING"
                        ? "Atención"
                        : "Info"}
                    </Badge>
                    <Badge variant="outline">
                      {alert.type === "CONTRATO"
                        ? "Contrato"
                        : alert.type === "PAGO"
                        ? "Pago"
                        : alert.type === "CHECKLIST"
                        ? "Checklist"
                        : alert.type === "PROVEEDOR"
                        ? "Proveedor"
                        : "General"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
