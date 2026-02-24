import { getProviders } from "./actions";
import { ProvidersTable } from "./providers-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: { type?: string; search?: string };
}) {
  const providers = await getProviders({
    type: searchParams.type,
    search: searchParams.search,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proveedores / Artistas</h1>
          <p className="text-muted-foreground">
            Directorio de proveedores y artistas
          </p>
        </div>
        <Link href="/proveedores/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </Link>
      </div>

      <ProvidersTable providers={providers} />
    </div>
  );
}
