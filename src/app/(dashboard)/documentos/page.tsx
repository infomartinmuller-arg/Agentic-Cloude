import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText } from "lucide-react";
import Link from "next/link";

const DOC_TYPE_LABELS: Record<string, string> = {
  contrato: "Contrato",
  rider: "Rider",
  plano: "Plano",
  factura: "Factura",
  otro: "Otro",
};

async function getDocuments() {
  return db.document.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, name: true } },
    },
  });
}

export default async function DocumentosPage() {
  await requireAuth();
  const documents = await getDocuments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">
          {documents.length} documento{documents.length !== 1 ? "s" : ""} en total
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay documentos subidos
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
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
                  <TableCell>
                    <Link
                      href={`/eventos/${doc.event.id}`}
                      className="text-primary hover:underline"
                    >
                      {doc.event.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(doc.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.notes || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
