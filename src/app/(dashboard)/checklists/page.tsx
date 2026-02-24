import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

async function getChecklists() {
  return db.checklist.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, name: true } },
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export default async function ChecklistsPage() {
  await requireAuth();
  const checklists = await getChecklists();

  const totalItems = checklists.reduce((acc, cl) => acc + cl.items.length, 0);
  const completedItems = checklists.reduce(
    (acc, cl) => acc + cl.items.filter((i) => i.completed).length,
    0
  );
  const globalPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Checklists</h1>
        <p className="text-muted-foreground">
          Progreso global: {completedItems}/{totalItems} tareas ({globalPercent}%)
        </p>
        <Progress value={globalPercent} className="mt-2 h-3 max-w-md" />
      </div>

      {checklists.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay checklists creados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {checklists.map((checklist) => {
            const total = checklist.items.length;
            const completed = checklist.items.filter((i) => i.completed).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card key={checklist.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{checklist.title}</CardTitle>
                      <Link
                        href={`/eventos/${checklist.event.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {checklist.event.name}
                      </Link>
                    </div>
                    <Badge variant={percent === 100 ? "success" : "secondary"}>
                      {completed}/{total}
                    </Badge>
                  </div>
                  <Progress value={percent} className="h-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox checked={item.completed} disabled />
                        <span
                          className={`text-sm ${
                            item.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                    {checklist.items.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{checklist.items.length - 5} más...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
