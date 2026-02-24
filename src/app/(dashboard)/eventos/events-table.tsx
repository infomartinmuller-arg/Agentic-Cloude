"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Search,
  ArrowUpDown,
  Users,
  CreditCard,
  CheckSquare,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

type EventWithCounts = {
  id: string;
  name: string;
  venue: string | null;
  city: string | null;
  date: Date;
  status: string;
  budget: number;
  creator: { name: string };
  _count: {
    providers: number;
    payments: number;
    checklists: number;
    documents: number;
    alerts: number;
  };
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  BORRADOR: { label: "Borrador", variant: "secondary" },
  CONFIRMADO: { label: "Confirmado", variant: "info" },
  EN_PRODUCCION: { label: "En Producción", variant: "warning" },
  FINALIZADO: { label: "Finalizado", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "destructive" },
};

export function EventsTable({ events }: { events: EventWithCounts[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortField, setSortField] = useState<"date" | "name" | "budget">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = events
    .filter((e) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "budget") cmp = a.budget - b.budget;
      return sortDir === "asc" ? cmp : -cmp;
    });

  function toggleSort(field: "date" | "name" | "budget") {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.push(`/eventos?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          defaultValue={searchParams.get("status") || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="BORRADOR">Borrador</SelectItem>
            <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
            <SelectItem value="EN_PRODUCCION">En Producción</SelectItem>
            <SelectItem value="FINALIZADO">Finalizado</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("name")}>
                  Evento <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("date")}>
                  Fecha <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("budget")}>
                  Presupuesto <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Resumen</TableHead>
              <TableHead className="w-16">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron eventos
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((event) => {
                const days = daysUntil(event.date);
                const config = STATUS_CONFIG[event.status] || { label: event.status, variant: "outline" as const };
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          por {event.creator.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(event.date)}</p>
                        <p className="text-xs text-muted-foreground">
                          {days > 0
                            ? `en ${days} días`
                            : days === 0
                            ? "Hoy"
                            : `hace ${Math.abs(days)} días`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {[event.venue, event.city].filter(Boolean).join(", ") || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(event.budget)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="Proveedores">
                          <Users className="h-3 w-3" /> {event._count.providers}
                        </span>
                        <span className="flex items-center gap-1" title="Pagos">
                          <CreditCard className="h-3 w-3" /> {event._count.payments}
                        </span>
                        <span className="flex items-center gap-1" title="Checklists">
                          <CheckSquare className="h-3 w-3" /> {event._count.checklists}
                        </span>
                        <span className="flex items-center gap-1" title="Documentos">
                          <FileText className="h-3 w-3" /> {event._count.documents}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/eventos/${event.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} evento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
