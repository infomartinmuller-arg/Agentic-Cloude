import { getEvents } from "./actions";
import { EventsTable } from "./events-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const events = await getEvents({
    status: searchParams.status,
    search: searchParams.search,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus eventos desde aquí
          </p>
        </div>
        <Link href="/eventos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      <EventsTable events={events} />
    </div>
  );
}
