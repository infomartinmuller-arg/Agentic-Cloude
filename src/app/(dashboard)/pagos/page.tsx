import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const PAYMENT_STATUS: Record<string, { label: string; variant: any }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  PARCIAL: { label: "Parcial", variant: "info" },
  COMPLETADO: { label: "Completado", variant: "success" },
  VENCIDO: { label: "Vencido", variant: "destructive" },
};

async function getPayments() {
  return db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, name: true } },
      providerPayment: { include: { provider: { select: { name: true } } } },
    },
  });
}

export default async function PagosPage() {
  await requireAuth();
  const payments = await getPayments();

  const total = payments.reduce((acc, p) => acc + p.amount, 0);
  const paid = payments
    .filter((p) => p.status === "COMPLETADO")
    .reduce((acc, p) => acc + p.amount, 0);
  const pending = total - paid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">Resumen de todos los pagos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paid)}</p>
            <p className="text-sm text-muted-foreground">Pagado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(pending)}</p>
            <p className="text-sm text-muted-foreground">Pendiente</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay pagos registrados
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const config = PAYMENT_STATUS[payment.status] || {
                  label: payment.status,
                  variant: "outline",
                };
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.concept}</TableCell>
                    <TableCell>
                      <Link
                        href={`/eventos/${payment.event.id}`}
                        className="text-primary hover:underline"
                      >
                        {payment.event.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {payment.providerPayment?.provider?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.method || "-"}</TableCell>
                    <TableCell>
                      {payment.dueDate ? formatDate(payment.dueDate) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
