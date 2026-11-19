import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Solo admins autenticados pueden subir fotos
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  if (ext === "heic" || ext === "heif") {
    return NextResponse.json(
      { error: "Las fotos de iPhone (HEIC) no son compatibles. Convierte la imagen a JPG antes de subirla." },
      { status: 400 }
    );
  }
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Service role bypasses todas las políticas de Storage
  const service = createServiceClient();
  const { error } = await service.storage
    .from("propuestas-fotos")
    .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = service.storage
    .from("propuestas-fotos")
    .getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
