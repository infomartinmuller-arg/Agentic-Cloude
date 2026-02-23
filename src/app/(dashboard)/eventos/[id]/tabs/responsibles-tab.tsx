"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRoleLabel } from "@/lib/auth-utils";

export function EventResponsiblesTab({
  eventId,
  responsibles,
}: {
  eventId: string;
  responsibles: any[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Responsables</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {responsibles.length} persona{responsibles.length !== 1 ? "s" : ""} asignada{responsibles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {responsibles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay responsables asignados a este evento
          </p>
        ) : (
          <div className="space-y-3">
            {responsibles.map((resp) => {
              const initials = resp.user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={resp.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{resp.user.name}</p>
                    <p className="text-sm text-muted-foreground">{resp.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{resp.role}</Badge>
                    <Badge variant="secondary">
                      {getRoleLabel(resp.user.role)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
