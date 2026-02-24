"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  FileText,
  CheckSquare,
  CreditCard,
  AlertTriangle,
  UserCheck,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import { deleteEvent } from "../actions";
import { EditEventDialog } from "./edit-event-dialog";
import { EventContractsTab } from "./tabs/contracts-tab";
import { EventPaymentsTab } from "./tabs/payments-tab";
import { EventProvidersTab } from "./tabs/providers-tab";
import { EventChecklistsTab } from "./tabs/checklists-tab";
import { EventDocumentsTab } from "./tabs/documents-tab";
import { EventResponsiblesTab } from "./tabs/responsibles-tab";

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  BORRADOR: { label: "Borrador", variant: "secondary" },
  CONFIRMADO: { label: "Confirmado", variant: "info" },
  EN_PRODUCCION: { label: "En Producción", variant: "warning" },
  FINALIZADO: { label: "Finalizado", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "destructive" },
};

export function EventHub({ event }: { event: any }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const days = daysUntil(event.date);
  const config = STATUS_CONFIG[event.status] || { label: event.status, variant: "outline" };

  // Calcular progreso de checklists
  const totalItems = event.checklists.reduce(
    (acc: number, cl: any) => acc + cl.items.length,
    0
  );
  const completedItems = event.checklists.reduce(
    (acc: number, cl: any) => acc + cl.items.filter((i: any) => i.completed).length,
    0
  );
  const checklistPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Calcular pagos
  const totalPayments = event.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
  const paidPayments = event.payments
    .filter((p: any) => p.status === "COMPLETADO")
    .reduce((acc: number, p: any) => acc + p.amount, 0);

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await deleteEvent(event.id);
    router.push("/eventos");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/eventos">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            {event.description && (
              <p className="mt-1 text-muted-foreground">{event.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(event.date)}
                {days > 0 && ` (en ${days} días)`}
                {days === 0 && " (Hoy)"}
                {days < 0 && ` (hace ${Math.abs(days)} días)`}
              </span>
              {(event.venue || event.city) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {[event.venue, event.city].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(event.budget)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <EditEventDialog event={event} />
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{event.providers.length}</p>
                <p className="text-xs text-muted-foreground">Proveedores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(paidPayments)}</p>
                <p className="text-xs text-muted-foreground">
                  de {formatCurrency(totalPayments)} pagado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{checklistPercent}%</p>
                <p className="text-xs text-muted-foreground">
                  {completedItems}/{totalItems} tareas
                </p>
              </div>
            </div>
            <Progress value={checklistPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{event.documents.length}</p>
                <p className="text-xs text-muted-foreground">Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="providers" className="gap-1">
            <Users className="h-4 w-4" /> Proveedores
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-1">
            <FileText className="h-4 w-4" /> Contratos
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1">
            <CreditCard className="h-4 w-4" /> Pagos
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-1">
            <CheckSquare className="h-4 w-4" /> Checklists
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1">
            <FileText className="h-4 w-4" /> Documentos
          </TabsTrigger>
          <TabsTrigger value="responsibles" className="gap-1">
            <UserCheck className="h-4 w-4" /> Responsables
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <EventProvidersTab eventId={event.id} providers={event.providers} />
        </TabsContent>
        <TabsContent value="contracts">
          <EventContractsTab eventId={event.id} contracts={event.contracts} />
        </TabsContent>
        <TabsContent value="payments">
          <EventPaymentsTab eventId={event.id} payments={event.payments} />
        </TabsContent>
        <TabsContent value="checklists">
          <EventChecklistsTab eventId={event.id} checklists={event.checklists} />
        </TabsContent>
        <TabsContent value="documents">
          <EventDocumentsTab eventId={event.id} documents={event.documents} />
        </TabsContent>
        <TabsContent value="responsibles">
          <EventResponsiblesTab eventId={event.id} responsibles={event.responsibles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
