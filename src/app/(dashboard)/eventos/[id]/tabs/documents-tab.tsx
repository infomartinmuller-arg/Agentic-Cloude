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
import { formatDate } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOC_TYPE_LABELS: Record<string, string> = {
  contrato: "Contrato",
  rider: "Rider",
  plano: "Plano",
  factura: "Factura",
  otro: "Otro",
};

export function EventDocumentsTab({
  eventId,
  documents,
}: {
  eventId: string;
  documents: any[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documentos</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} documento{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay documentos subidos para este evento
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {DOC_TYPE_LABELS[doc.type] || doc.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(doc.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.notes || "-"}
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
