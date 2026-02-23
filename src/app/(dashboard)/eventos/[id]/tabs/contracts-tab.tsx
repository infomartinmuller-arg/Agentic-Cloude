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
import { FileText } from "lucide-react";

const CONTRACT_STATUS: Record<string, { label: string; variant: any }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  ENVIADO: { label: "Enviado", variant: "info" },
  FIRMADO: { label: "Firmado", variant: "success" },
  VENCIDO: { label: "Vencido", variant: "destructive" },
};

export function EventContractsTab({
  eventId,
  contracts,
}: {
  eventId: string;
  contracts: any[];
}) {
  const totalAmount = contracts.reduce((acc, c) => acc + c.amount, 0);
  const signed = contracts.filter((c) => c.status === "FIRMADO").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contratos</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {signed}/{contracts.length} firmados - Total: {formatCurrency(totalAmount)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay contratos para este evento
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha firma</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Archivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const config = CONTRACT_STATUS[contract.status] || {
                  label: contract.status,
                  variant: "outline",
                };
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>{formatCurrency(contract.amount)}</TableCell>
                    <TableCell>
                      {contract.signDate ? formatDate(contract.signDate) : "-"}
                    </TableCell>
                    <TableCell>
                      {contract.dueDate ? formatDate(contract.dueDate) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {contract.fileUrl ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin archivo</span>
                      )}
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
