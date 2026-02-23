import { NextResponse } from "next/server";
import { generateAlerts } from "@/lib/alert-engine";

// Endpoint para generar alertas (puede invocarse con cron o manualmente)
export async function POST() {
  try {
    const count = await generateAlerts();
    return NextResponse.json({
      success: true,
      alertsGenerated: count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
