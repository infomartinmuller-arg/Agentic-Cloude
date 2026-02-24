"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function EventChecklistsTab({
  eventId,
  checklists,
}: {
  eventId: string;
  checklists: any[];
}) {
  return (
    <div className="space-y-4">
      {checklists.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No hay checklists para este evento
          </CardContent>
        </Card>
      ) : (
        checklists.map((checklist) => {
          const total = checklist.items.length;
          const completed = checklist.items.filter((i: any) => i.completed).length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Card key={checklist.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{checklist.title}</CardTitle>
                  <Badge variant={percent === 100 ? "success" : "secondary"}>
                    {completed}/{total} ({percent}%)
                  </Badge>
                </div>
                <Progress value={percent} className="h-2" />
              </CardHeader>
              <CardContent>
                {checklist.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin items</p>
                ) : (
                  <div className="space-y-2">
                    {checklist.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2"
                      >
                        <Checkbox checked={item.completed} disabled />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              item.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {item.text}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            {item.assignee && <span>Asignado: {item.assignee}</span>}
                            {item.dueDate && (
                              <span>Vence: {formatDate(item.dueDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
