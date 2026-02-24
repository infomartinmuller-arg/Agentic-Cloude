"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

function toLocalDatetime(date: string | Date): string {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function EditEventDialog({ event }: { event: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateEvent(event.id, formData);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || "Error al actualizar");
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar el evento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-1 h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del evento *</Label>
            <Input
              id="edit-name"
              name="name"
              required
              defaultValue={event.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={event.description || ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Fecha de inicio *</Label>
              <Input
                id="edit-date"
                name="date"
                type="datetime-local"
                required
                defaultValue={toLocalDatetime(event.date)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Fecha de fin</Label>
              <Input
                id="edit-endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={event.endDate ? toLocalDatetime(event.endDate) : ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-venue">Lugar / Venue</Label>
              <Input
                id="edit-venue"
                name="venue"
                defaultValue={event.venue || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ciudad</Label>
              <Input
                id="edit-city"
                name="city"
                defaultValue={event.city || ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-budget">Presupuesto</Label>
              <Input
                id="edit-budget"
                name="budget"
                type="number"
                min="0"
                step="0.01"
                defaultValue={event.budget || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select name="status" defaultValue={event.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="EN_PRODUCCION">En Producción</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notas</Label>
            <textarea
              id="edit-notes"
              name="notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={event.notes || ""}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
