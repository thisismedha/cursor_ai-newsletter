import { NextResponse } from "next/server";

import { runEdition } from "@/src/lib/pipeline/runEdition";

export async function GET() {
  try {
    const edition = await runEdition();
    return NextResponse.json({ ok: true, edition });
  } catch (error) {
    console.error("[edition] Failed to generate edition", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate edition" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { excludeUrls?: unknown }
      | null;
    const excludeUrls =
      body?.excludeUrls && Array.isArray(body.excludeUrls)
        ? body.excludeUrls.filter((v) => typeof v === "string")
        : [];

    const edition = await runEdition({ excludeUrls });
    return NextResponse.json({ ok: true, edition });
  } catch (error) {
    console.error("[edition] Failed to generate edition (POST)", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate edition" },
      { status: 500 },
    );
  }
}
