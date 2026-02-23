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
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Mail, Phone } from "lucide-react";

export function EventProvidersTab({
  eventId,
  providers,
}: {
  eventId: string;
  providers: any[];
}) {
  const totalFees = providers.reduce((acc, ep) => acc + ep.fee, 0);
  const confirmed = providers.filter((ep) => ep.confirmed).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Proveedores / Artistas</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {confirmed}/{providers.length} confirmados - Total: {formatCurrency(totalFees)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay proveedores asignados a este evento
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Rol en evento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tarifa</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((ep) => (
                <TableRow key={ep.id}>
                  <TableCell className="font-medium">{ep.provider.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ep.provider.type}</Badge>
                  </TableCell>
                  <TableCell>{ep.role || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      {ep.provider.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {ep.provider.email}
                        </span>
                      )}
                      {ep.provider.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {ep.provider.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(ep.fee)}
                  </TableCell>
                  <TableCell>
                    {ep.confirmed ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Confirmado
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <XCircle className="h-3 w-3" /> Pendiente
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
