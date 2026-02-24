"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleLabel } from "@/lib/auth-utils";
import type { Role } from "@prisma/client";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const res = await fetch("/api/alerts/count");
        if (res.ok) {
          const data = await res.json();
          setAlertCount(data.count || 0);
        }
      } catch {
        // Silently fail
      }
    }

    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 60000); // Refrescar cada minuto
    return () => clearInterval(interval);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h2 className="text-lg font-semibold">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Usuario"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Alertas */}
        <Link href="/alertas">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ? getRoleLabel(user.role as Role) : ""}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}
