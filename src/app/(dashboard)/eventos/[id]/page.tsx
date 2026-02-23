import { notFound } from "next/navigation";
import { getEventById } from "../actions";
import { EventHub } from "./event-hub";

export default async function EventoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  return <EventHub event={event} />;
}
