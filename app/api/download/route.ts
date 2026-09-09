import { NextRequest, NextResponse, after } from "next/server";
import fs from "fs";
import path from "path";
import { notifyDownload } from "@/lib/webhooks";

const PDF_PATH = path.join(
  process.cwd(),
  "public",
  "downloads",
  "checklist-pre-viaje.pdf"
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sessionId = typeof body?.session_id === "string" ? body.session_id : "";

  try {
    const file = fs.readFileSync(PDF_PATH);

    after(() => notifyDownload("checklist_pre_viaje", sessionId));

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="checklist-pre-viaje.pdf"',
      },
    });
  } catch (error) {
    console.error("No se encontro el PDF del checklist", error);
    return NextResponse.json(
      { error: "El archivo no esta disponible por el momento." },
      { status: 404 }
    );
  }
}
