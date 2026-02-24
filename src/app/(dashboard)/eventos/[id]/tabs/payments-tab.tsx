"use client";

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

const PAYMENT_STATUS: Record<string, { label: string; variant: any }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  PARCIAL: { label: "Parcial", variant: "info" },
  COMPLETADO: { label: "Completado", variant: "success" },
  VENCIDO: { label: "Vencido", variant: "destructive" },
};

export function EventPaymentsTab({
  eventId,
  payments,
}: {
  eventId: string;
  payments: any[];
}) {
  const total = payments.reduce((acc, p) => acc + p.amount, 0);
  const paid = payments
    .filter((p) => p.status === "COMPLETADO")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pagos</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(paid)} pagados de {formatCurrency(total)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay pagos registrados para este evento
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const config = PAYMENT_STATUS[payment.status] || {
                  label: payment.status,
                  variant: "outline",
                };
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.concept}</TableCell>
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
                      {payment.paidDate ? formatDate(payment.paidDate) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
