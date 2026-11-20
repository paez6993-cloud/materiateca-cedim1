import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
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
  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let contentType = file.type || "image/jpeg";
  let uploadExt = ext;

  if (ext === "heic" || ext === "heif") {
    try {
      const heicConvert = (await import("heic-convert")).default;
      const converted = await heicConvert({
        buffer,
        format: "JPEG",
        quality: 0.9,
      });
      buffer = Buffer.from(converted);
      contentType = "image/jpeg";
      uploadExt = "jpg";
    } catch {
      return NextResponse.json(
        { error: "No se pudo convertir la foto HEIC. Intenta exportarla como JPG desde tu galería." },
        { status: 400 }
      );
    }
  }

  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${uploadExt}`;

  const service = createServiceClient();
  const { error } = await service.storage
    .from("propuestas-fotos")
    .upload(path, buffer, { contentType, upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = service.storage
    .from("propuestas-fotos")
    .getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
