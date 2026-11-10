import { NavBar } from "@/components/catalog/NavBar";
import { createClient } from "@/lib/supabase/server";
import {
  FAMILIA_LABELS,
  CONSTRUCCION_LABELS,
  PESO_LABELS,
  DISPONIBILIDAD_LABELS,
  DISPONIBILIDAD_COLORS,
} from "@/types/database";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  try {
    const { code } = await params;
    const supabase = await createClient();
    const { data } = await supabase
      .from("materiales")
      .select("nombre, codigo")
      .eq("codigo", code.toUpperCase())
      .eq("estado_revision", "aprobado")
      .single();
    return {
      title: data ? `${data.codigo} · ${data.nombre}` : "Material no encontrado",
    };
  } catch {
    return { title: "Material" };
  }
}

async function getMaterial(code: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .eq("codigo", code.toUpperCase())
      .eq("estado_revision", "aprobado")
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

async function getPrendas(codigo: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("prendas")
      .select("*")
      .eq("material_codigo", codigo)
      .eq("visible", true)
      .order("created_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

async function getProveedores(codigo: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("material_proveedores")
      .select("*, proveedores(*)")
      .eq("material_codigo", codigo);
    return data || [];
  } catch {
    return [];
  }
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [material, prendas, proveedores] = await Promise.all([
    getMaterial(code),
    getPrendas(code.toUpperCase()),
    getProveedores(code.toUpperCase()),
  ]);

  if (!material) notFound();

  const esPrestable =
    material.es_prestable && material.estado_disponibilidad === "disponible";

  return (
    <>
      <NavBar />
      <main className="py-8 md:py-14">
        <div className="container-site">

          {/* Breadcrumb */}
          <nav className="mb-8 text-xs text-cedar-500">
            <Link href="/catalogo" className="hover:text-ink">Catálogo</Link>
            <span className="mx-2">›</span>
            <span className="font-mono">{material.codigo}</span>
          </nav>

          {/* Layout principal: foto | ficha */}
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] xl:grid-cols-[55%_1fr]">

            {/* Columna izquierda: fotos */}
            <div className="space-y-3">
              <div className="relative aspect-square overflow-hidden bg-cedar-100">
                {material.foto_completa_url ? (
                  <Image
                    src={material.foto_completa_url}
                    alt={material.nombre}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-cedar-300">
                    <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Sin fotografía todavía</span>
                  </div>
                )}
              </div>

              {/* Foto de textura en miniatura */}
              {material.foto_textura_url && (
                <div className="relative aspect-square w-24 overflow-hidden bg-cedar-100">
                  <Image
                    src={material.foto_textura_url}
                    alt={`Textura · ${material.nombre}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
            </div>

            {/* Columna derecha: ficha de datos */}
            <div className="space-y-7">

              {/* Encabezado */}
              <div>
                <p className="mb-1 font-mono text-sm tracking-wider text-cedar-400">
                  {material.codigo}
                </p>
                <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
                  {material.nombre}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className={`badge ${DISPONIBILIDAD_COLORS[material.estado_disponibilidad as keyof typeof DISPONIBILIDAD_COLORS]}`}>
                    {DISPONIBILIDAD_LABELS[material.estado_disponibilidad as keyof typeof DISPONIBILIDAD_LABELS]}
                  </span>
                  {material.es_textil_tradicional && (
                    <span className="badge bg-cedar-100 text-cedar-700">Textil tradicional</span>
                  )}
                  {material.es_reciclado && (
                    <span className="badge bg-green-100 text-green-800">Reciclado</span>
                  )}
                  {material.desarrollado_en_cedim && (
                    <span className="badge bg-ink text-cedar-50">Desarrollado en CEDIM</span>
                  )}
                </div>
              </div>

              {/* Botón préstamo */}
              {esPrestable && (
                <Link href={`/solicitar-prestamo?codigo=${material.codigo}`} className="btn-primary block text-center">
                  Solicitar préstamo
                </Link>
              )}
              {material.estado_disponibilidad === "prestada" && (
                <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Esta muestra está prestada actualmente. Consulta con Ivette su disponibilidad.
                </p>
              )}
              {material.estado_disponibilidad === "solo_consulta" && (
                <p className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Esta muestra es solo para consulta en taller, no se presta.
                </p>
              )}

              {/* Tabla de datos */}
              <div className="divide-y divide-cedar-100 border-t border-cedar-200">
                <Fila label="Familia de fibra">
                  {FAMILIA_LABELS[material.familia_fibra as keyof typeof FAMILIA_LABELS]}
                </Fila>
                <Fila label="Composición">
                  {material.composicion || <em className="text-cedar-400">No identificada</em>}
                  {material.composicion_fuente && (
                    <span className="ml-2 text-xs text-cedar-400">({material.composicion_fuente})</span>
                  )}
                </Fila>
                <Fila label="Construcción">
                  {material.construccion
                    ? CONSTRUCCION_LABELS[material.construccion as keyof typeof CONSTRUCCION_LABELS]
                    : <em className="text-cedar-400">No identificada</em>}
                </Fila>
                <Fila label="Peso">
                  {material.peso_categoria ? (
                    <>
                      {PESO_LABELS[material.peso_categoria as keyof typeof PESO_LABELS]}
                      {material.gramaje && <span className="ml-1 text-cedar-500">({material.gramaje} g/m²)</span>}
                    </>
                  ) : <em className="text-cedar-400">No identificado</em>}
                </Fila>
                <Fila label="Origen">
                  {material.origen === "nacional" ? "Nacional"
                    : material.origen === "importado" ? "Importado"
                    : <em className="text-cedar-400">No identificado</em>}
                </Fila>
                {material.lugar_produccion && (
                  <Fila label="Lugar de producción">{material.lugar_produccion}</Fila>
                )}
                {material.fabricante && (
                  <Fila label="Fabricante">{material.fabricante}</Fila>
                )}
                {material.certificacion && (
                  <Fila label="Certificación">{material.certificacion}</Fila>
                )}
                {material.usos_sugeridos && (
                  <Fila label="Usos sugeridos">{material.usos_sugeridos}</Fila>
                )}
                {material.ubicacion_taller && (
                  <Fila label="Ubicación en taller">{material.ubicacion_taller}</Fila>
                )}
              </div>

              {/* Notas */}
              {material.notas && (
                <div>
                  <p className="field-label mb-1">Notas</p>
                  <p className="text-sm leading-relaxed text-cedar-700">{material.notas}</p>
                </div>
              )}

              {/* Proveedores / dónde comprar */}
              {(proveedores.length > 0 || material.donde_comprar) && (
                <div className="border-t border-cedar-200 pt-6">
                  <p className="field-label mb-4">Dónde conseguirlo</p>
                  <div className="space-y-4">
                    {proveedores.map((mp: any) => (
                      <ProveedorCard key={mp.id} proveedor={mp.proveedores} />
                    ))}
                    {material.donde_comprar && proveedores.length === 0 && (
                      <p className="text-sm text-cedar-700">{material.donde_comprar}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Fuentes */}
              {material.fuentes && (
                <p className="text-xs text-cedar-400">Fuentes: {material.fuentes}</p>
              )}
            </div>
          </div>

          {/* Sección: Prendas realizadas con este textil */}
          {prendas.length > 0 && (
            <section className="mt-20 border-t border-cedar-200 pt-12">
              <h2 className="font-display mb-8 text-2xl font-semibold text-ink">
                Prendas realizadas con este textil
              </h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {prendas.map((prenda: any) => (
                  <PrendaCard key={prenda.id} prenda={prenda} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <footer className="mt-16 border-t border-cedar-200 py-8">
        <div className="container-site flex items-center justify-between">
          <Link href="/catalogo" className="text-sm text-cedar-500 hover:text-ink">
            ← Volver al catálogo
          </Link>
          <span className="text-xs font-bold tracking-widest text-cedar-400">©CEDIM</span>
        </div>
      </footer>
    </>
  );
}

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-6 py-3">
      <span className="w-40 flex-shrink-0 text-xs font-medium uppercase tracking-wide text-cedar-500">
        {label}
      </span>
      <span className="text-sm text-ink">{children}</span>
    </div>
  );
}

function ProveedorCard({ proveedor }: { proveedor: any }) {
  if (!proveedor) return null;
  return (
    <div className="border border-cedar-200 bg-white p-4">
      <p className="font-medium text-sm text-ink">{proveedor.nombre}</p>
      {proveedor.direccion && (
        <p className="mt-1 text-xs text-cedar-500">{proveedor.direccion}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-3">
        {proveedor.telefono && (
          <a href={`tel:${proveedor.telefono}`} className="text-xs text-cedar-600 hover:text-ink">
            {proveedor.telefono}
          </a>
        )}
        {proveedor.email && (
          <a href={`mailto:${proveedor.email}`} className="text-xs text-cedar-600 hover:text-ink">
            {proveedor.email}
          </a>
        )}
        {proveedor.sitio_web && (
          <a href={proveedor.sitio_web} target="_blank" rel="noopener noreferrer"
            className="text-xs text-cedar-600 hover:text-ink">
            {proveedor.sitio_web.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>
    </div>
  );
}

function PrendaCard({ prenda }: { prenda: any }) {
  return (
    <div className="group flex flex-col gap-2">
      <div className="relative aspect-[3/4] overflow-hidden bg-cedar-100">
        <Image
          src={prenda.foto_url}
          alt={prenda.descripcion || `Prenda por ${prenda.autor_nombre}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>
      <div>
        {prenda.descripcion && (
          <p className="text-xs leading-tight text-cedar-700 line-clamp-2">{prenda.descripcion}</p>
        )}
        <p className="text-xs text-cedar-500 mt-0.5">
          por <span className="font-medium text-ink">{prenda.autor_nombre}</span>
        </p>
        {prenda.autor_contacto && (
          <p className="text-xs text-cedar-400">{prenda.autor_contacto}</p>
        )}
      </div>
    </div>
  );
}
