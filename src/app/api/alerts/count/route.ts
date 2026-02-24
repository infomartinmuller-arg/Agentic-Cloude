import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadAlertCount } from "@/lib/alert-engine";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const count = await getUnreadAlertCount();
    return NextResponse.json({ count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
