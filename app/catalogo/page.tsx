import { NavBar } from "@/components/catalog/NavBar";
import { MaterialCard } from "@/components/catalog/MaterialCard";
import {
  FamiliaFibra,
  Construccion,
  PesoCategoria,
  Origen,
  EstadoDisponibilidad,
  FAMILIA_LABELS,
  CONSTRUCCION_LABELS,
  PESO_LABELS,
  DISPONIBILIDAD_LABELS,
} from "@/types/database";

interface SearchParams {
  q?: string;
  codigo?: string;
  familia?: FamiliaFibra;
  construccion?: Construccion;
  peso?: PesoCategoria;
  origen?: Origen;
  estado?: EstadoDisponibilidad;
  reciclado?: string;
  tradicional?: string;
  cedim?: string;
}

export const metadata = { title: "Catálogo" };

// Materiales de relleno para visualizar el diseño
const PLACEHOLDERS = [
  { codigo: "CED-NAT-001", nombre: "Lino crudo natural", familia_fibra: "natural_vegetal" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "importado" as const, color: "#c8b89a" },
  { codigo: "CED-ANI-001", nombre: "Lana merino fina", familia_fibra: "natural_animal" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_punto" as const, origen: "importado" as const, color: "#8b7355" },
  { codigo: "CED-SIN-001", nombre: "Poliéster texturizado", familia_fibra: "sintetica" as const, estado_disponibilidad: "prestada" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "nacional" as const, color: "#6b7280" },
  { codigo: "CED-NAT-002", nombre: "Algodón orgánico", familia_fibra: "natural_vegetal" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "nacional" as const, color: "#d4c5a9" },
  { codigo: "CED-ART-001", nombre: "Viscosa bambú", familia_fibra: "artificial_regenerada" as const, estado_disponibilidad: "solo_consulta" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "importado" as const, color: "#9cad99" },
  { codigo: "CED-MEZ-001", nombre: "Mezcla lino-algodón", familia_fibra: "mezcla" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "importado" as const, color: "#b5a89c" },
  { codigo: "CED-ANI-002", nombre: "Seda natural cruda", familia_fibra: "natural_animal" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "importado" as const, color: "#e8d5b7" },
  { codigo: "CED-NAT-003", nombre: "Yute arpillera", familia_fibra: "natural_vegetal" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "nacional" as const, color: "#a67c52" },
  { codigo: "CED-SIN-002", nombre: "Nylon ripstop", familia_fibra: "sintetica" as const, estado_disponibilidad: "agotada" as const, foto_completa_url: null, construccion: "tejido_plano" as const, origen: "importado" as const, color: "#4a5568" },
  { codigo: "CED-ART-002", nombre: "Modal suave", familia_fibra: "artificial_regenerada" as const, estado_disponibilidad: "disponible" as const, foto_completa_url: null, construccion: "tejido_punto" as const, origen: "importado" as const, color: "#c4b5c9" },
];

async function getMateriales(params: SearchParams) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("materiales")
      .select("codigo, nombre, familia_fibra, estado_disponibilidad, foto_completa_url, construccion, origen")
      .eq("estado_revision", "aprobado")
      .order("aprobado_at", { ascending: false });

    if (params.q) {
      query = query.or(`nombre.ilike.%${params.q}%,composicion.ilike.%${params.q}%,notas.ilike.%${params.q}%`);
    }
    if (params.codigo) query = query.ilike("codigo", `%${params.codigo}%`);
    if (params.familia) query = query.eq("familia_fibra", params.familia);
    if (params.construccion) query = query.eq("construccion", params.construccion);
    if (params.peso) query = query.eq("peso_categoria", params.peso);
    if (params.origen) query = query.eq("origen", params.origen);
    if (params.estado) query = query.eq("estado_disponibilidad", params.estado);
    if (params.reciclado === "1") query = query.eq("es_reciclado", true);
    if (params.tradicional === "1") query = query.eq("es_textil_tradicional", true);
    if (params.cedim === "1") query = query.eq("desarrollado_en_cedim", true);

    const { data, error } = await query;
    if (error) return { materiales: null, error: true };
    return { materiales: data || [], error: false };
  } catch {
    return { materiales: null, error: true };
  }
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { materiales, error: supabaseError } = await getMateriales(params);
  const hayFiltros = Object.values(params).some(Boolean);

  // Si Supabase no está configurado y no hay filtros activos, mostramos placeholders
  const mostrarPlaceholders = supabaseError && !hayFiltros;
  const listaMostrar = mostrarPlaceholders ? PLACEHOLDERS : (materiales || []);

  return (
    <>
      <NavBar />
      <main className="py-10">
        <div className="container-site">
          <div className="mb-8 flex items-baseline justify-between">
            <h1 className="font-display text-3xl font-semibold text-ink">
              Catálogo
            </h1>
            {mostrarPlaceholders && (
              <span className="text-xs text-cedar-400">
                Vista previa — conecta Supabase para ver materiales reales
              </span>
            )}
          </div>

          {/* Buscador y filtros */}
          <form method="GET" className="mb-8 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Buscar por nombre, composición…"
                className="field-input max-w-xs"
              />
              <input
                name="codigo"
                defaultValue={params.codigo}
                placeholder="Código (ej. CED-NAT-014)"
                className="field-input max-w-[200px]"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select name="familia" defaultValue={params.familia || ""} className="field-input w-auto">
                <option value="">Todas las familias</option>
                {(Object.keys(FAMILIA_LABELS) as FamiliaFibra[]).map((f) => (
                  <option key={f} value={f}>{FAMILIA_LABELS[f]}</option>
                ))}
              </select>

              <select name="construccion" defaultValue={params.construccion || ""} className="field-input w-auto">
                <option value="">Toda construcción</option>
                {(Object.keys(CONSTRUCCION_LABELS) as Construccion[]).map((c) => (
                  <option key={c} value={c}>{CONSTRUCCION_LABELS[c]}</option>
                ))}
              </select>

              <select name="peso" defaultValue={params.peso || ""} className="field-input w-auto">
                <option value="">Todo peso</option>
                {(Object.keys(PESO_LABELS) as PesoCategoria[]).map((p) => (
                  <option key={p} value={p}>{PESO_LABELS[p]}</option>
                ))}
              </select>

              <select name="origen" defaultValue={params.origen || ""} className="field-input w-auto">
                <option value="">Todo origen</option>
                <option value="nacional">Nacional</option>
                <option value="importado">Importado</option>
              </select>

              <select name="estado" defaultValue={params.estado || ""} className="field-input w-auto">
                <option value="">Todo estado</option>
                {(["disponible", "prestada", "solo_consulta", "agotada"] as EstadoDisponibilidad[]).map((e) => (
                  <option key={e} value={e}>{DISPONIBILIDAD_LABELS[e]}</option>
                ))}
              </select>

              <button type="submit" className="btn-primary py-2 text-xs">
                Filtrar
              </button>

              {hayFiltros && (
                <a href="/catalogo" className="btn-secondary py-2 text-xs">
                  Limpiar filtros
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-cedar-700">
              {[
                { name: "reciclado", value: params.reciclado, label: "Reciclado" },
                { name: "tradicional", value: params.tradicional, label: "Textil tradicional" },
                { name: "cedim", value: params.cedim, label: "Desarrollado en CEDIM" },
              ].map(({ name, value, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    value="1"
                    defaultChecked={value === "1"}
                    className="h-4 w-4 border-cedar-300 text-ink"
                  />
                  {label}
                </label>
              ))}
            </div>
          </form>

          {/* Resultados */}
          {supabaseError && hayFiltros ? (
            <div className="py-20 text-center text-cedar-500">
              <p className="text-lg">La base de datos no está configurada todavía.</p>
              <a href="/catalogo" className="mt-4 inline-block text-sm underline">
                Ver vista previa sin filtros
              </a>
            </div>
          ) : listaMostrar.length === 0 ? (
            <div className="py-20 text-center text-cedar-500">
              <p className="text-lg">No se encontraron materiales.</p>
              {hayFiltros && (
                <a href="/catalogo" className="mt-4 inline-block text-sm underline">
                  Limpiar filtros
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-cedar-500">
                {mostrarPlaceholders
                  ? `${listaMostrar.length} ejemplos de materiales`
                  : `${listaMostrar.length} material${listaMostrar.length !== 1 ? "es" : ""}`}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {listaMostrar.map((m) => (
                  <PlaceholderCard key={m.codigo} material={m as any} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

// Wrapper que añade el swatch de color cuando no hay foto
function PlaceholderCard({ material }: { material: any }) {
  if (material.color && !material.foto_completa_url) {
    return (
      <div className="material-card group">
        <div
          className="relative aspect-square overflow-hidden"
          style={{
            backgroundColor: material.color,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              rgba(255,255,255,0.15) 4px,
              rgba(255,255,255,0.15) 5px
            )`,
          }}
        >
          <div className="absolute bottom-2 left-2">
            <span className={`badge text-xs ${
              material.estado_disponibilidad === "disponible" ? "bg-green-100 text-green-800" :
              material.estado_disponibilidad === "prestada" ? "bg-amber-100 text-amber-800" :
              material.estado_disponibilidad === "solo_consulta" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-500"
            }`}>
              {DISPONIBILIDAD_LABELS[material.estado_disponibilidad as EstadoDisponibilidad]}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-3">
          <p className="font-mono text-xs text-cedar-500">{material.codigo}</p>
          <h3 className="font-sans text-sm font-medium leading-tight text-ink line-clamp-2">
            {material.nombre}
          </h3>
          <p className="text-xs text-cedar-500">
            {FAMILIA_LABELS[material.familia_fibra as FamiliaFibra]}
          </p>
        </div>
      </div>
    );
  }
  return <MaterialCard material={material} />;
}
