import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Límite: máximo 5 propuestas por IP por hora (simple, sin Redis)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas propuestas. Intenta en una hora." },
      { status: 429 }
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { nombre_material } = body;
  if (!nombre_material?.trim()) {
    return NextResponse.json(
      { error: "El nombre del material es requerido" },
      { status: 400 }
    );
  }

  // Sanitizar: solo guardar campos conocidos
  const data = {
    nombre_material: nombre_material.trim().slice(0, 200),
    familia_fibra: body.familia_fibra || null,
    composicion: body.composicion?.slice(0, 500) || null,
    construccion: body.construccion || null,
    origen: body.origen || null,
    nombre_proponente: body.nombre_proponente?.slice(0, 100) || null,
    correo_proponente: body.correo_proponente?.slice(0, 200) || null,
    carrera: body.carrera?.slice(0, 100) || null,
    semestre: body.semestre?.slice(0, 20) || null,
    proveedor_nombre: body.proveedor_nombre?.slice(0, 200) || null,
    proveedor_contacto: body.proveedor_contacto?.slice(0, 300) || null,
    notas: body.notas?.slice(0, 1000) || null,
  };

  // Usar service role para insertar (pasa el RLS que permite INSERT público)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // anon key: RLS permite INSERT
  );

  const { error } = await supabase.from("propuestas_publicas").insert(data);

  if (error) {
    console.error("Error al insertar propuesta:", error);
    return NextResponse.json(
      { error: "Error al guardar la propuesta" },
      { status: 500 }
    );
  }

  // Notificación por correo a Ivette
  if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Materiateca CEDIM <noreply@materiateca.cedim.edu.mx>",
        to: process.env.NOTIFICATION_EMAIL,
        subject: `Nueva propuesta: ${data.nombre_material}`,
        html: `
          <p>Se recibió una nueva propuesta de material en la Materiateca.</p>
          <table cellpadding="6" style="border-collapse:collapse">
            <tr><td><strong>Material:</strong></td><td>${data.nombre_material}</td></tr>
            ${data.nombre_proponente ? `<tr><td><strong>Propuesto por:</strong></td><td>${data.nombre_proponente}</td></tr>` : ""}
            ${data.correo_proponente ? `<tr><td><strong>Correo:</strong></td><td>${data.correo_proponente}</td></tr>` : ""}
            ${data.familia_fibra ? `<tr><td><strong>Familia:</strong></td><td>${data.familia_fibra}</td></tr>` : ""}
          </table>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pendientes">Ver en el panel</a></p>
        `,
      });
    } catch (mailErr) {
      // No bloquear la respuesta si el correo falla
      console.error("Error al enviar correo:", mailErr);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
