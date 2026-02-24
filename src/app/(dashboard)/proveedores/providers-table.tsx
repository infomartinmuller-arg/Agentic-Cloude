"use client";

import { useState } from "react";
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
import { Search, ArrowUpDown, Star, Mail, Phone, MapPin, Calendar } from "lucide-react";

type ProviderWithCounts = {
  id: string;
  name: string;
  type: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  rating: number | null;
  _count: { events: number; payments: number };
};

const PROVIDER_TYPES = [
  "artista",
  "proveedor",
  "venue",
  "catering",
  "tecnico",
  "seguridad",
  "transporte",
  "decoracion",
  "fotografia",
  "otro",
];

export function ProvidersTable({ providers }: { providers: ProviderWithCounts[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortField, setSortField] = useState<"name" | "type" | "rating">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = providers
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.contactName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      else if (sortField === "rating") cmp = (a.rating || 0) - (b.rating || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });

  function toggleSort(field: "name" | "type" | "rating") {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleTypeFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("type");
    else params.set("type", value);
    router.push(`/proveedores?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          defaultValue={searchParams.get("type") || "all"}
          onValueChange={handleTypeFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {PROVIDER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("name")}>
                  Nombre <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("type")}>
                  Tipo <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("rating")}>
                  Rating <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Eventos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron proveedores
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <p className="font-medium">{provider.name}</p>
                    {provider.contactName && (
                      <p className="text-xs text-muted-foreground">{provider.contactName}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      {provider.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {provider.email}
                        </span>
                      )}
                      {provider.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {provider.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {provider.city ? (
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" /> {provider.city}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {provider.rating ? (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < provider.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin rating</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" /> {provider._count.events}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} proveedor{filtered.length !== 1 ? "es" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
