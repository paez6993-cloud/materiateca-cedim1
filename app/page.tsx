import { NavBar } from "@/components/catalog/NavBar";
import { InfiniteCarousel } from "@/components/catalog/InfiniteCarousel";
import Link from "next/link";

export const revalidate = 60;

async function getDatosCuriosos() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("datos_curiosos")
      .select("id, texto, fuente")
      .eq("activo", true)
      .order("orden", { ascending: true })
      .limit(10);
    return data || [];
  } catch {
    return [];
  }
}

async function getMaterialesRecientes() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("materiales")
      .select("codigo, nombre, familia_fibra, estado_disponibilidad, foto_completa_url")
      .eq("estado_revision", "aprobado")
      .order("aprobado_at", { ascending: false })
      .limit(20);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [datosCuriosos, materiales] = await Promise.all([
    getDatosCuriosos(),
    getMaterialesRecientes(),
  ]);

  const diaDelAnio = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const datoCurioso =
    datosCuriosos.length > 0
      ? datosCuriosos[diaDelAnio % datosCuriosos.length]
      : null;

  // Dato curioso de relleno mientras no haya datos reales
  const datoCuriosoMostrar = datoCurioso ?? {
    texto: "El lino es una de las fibras naturales más antiguas del mundo — se han encontrado telas de lino en tumbas egipcias de más de 4,000 años de antigüedad.",
    fuente: "Enciclopedia Textil",
  };

  return (
    <>
      <NavBar />

      <main>
        {/* Hero */}
        <section className="border-b border-cedar-200 py-20 md:py-28">
          <div className="container-site">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cedar-500">
                Taller de Materiales · CEDIM
              </p>
              <h1 className="font-display text-5xl font-semibold leading-none tracking-tight text-ink sm:text-6xl md:text-7xl">
                Materiateca
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-cedar-700">
                Catálogo digital de muestras textiles del taller. Consulta fichas,
                aprende sobre los materiales y solicita una muestra prestada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalogo" className="btn-primary">
                  Ver catálogo
                </Link>
                <Link href="/proponer" className="btn-secondary">
                  Proponer un material
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Carrusel */}
        <section className="border-b border-cedar-200 py-10">
          <div className="container-site mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">
              {materiales.length > 0 ? "En el catálogo" : "Próximamente en el catálogo"}
            </h2>
            {materiales.length > 0 && (
              <Link href="/catalogo" className="text-sm text-cedar-600 hover:text-ink">
                Ver todos →
              </Link>
            )}
          </div>
          <InfiniteCarousel materiales={materiales as any} />
          {materiales.length === 0 && (
            <p className="container-site mt-3 text-xs text-cedar-400">
              Vista previa — los materiales aparecerán aquí una vez configurada la base de datos.
            </p>
          )}
        </section>

        {/* ¿Sabías que...? */}
        <section className="border-b border-cedar-200 bg-cedar-100 py-12">
          <div className="container-site">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cedar-500">
              ¿Sabías que…?
            </p>
            <blockquote className="max-w-3xl">
              <p className="font-display text-2xl leading-snug text-ink md:text-3xl">
                "{datoCuriosoMostrar.texto}"
              </p>
              {datoCuriosoMostrar.fuente && (
                <footer className="mt-4 text-sm text-cedar-500">
                  Fuente: {datoCuriosoMostrar.fuente}
                </footer>
              )}
            </blockquote>
          </div>
        </section>

        {/* Acerca del proyecto */}
        <section className="py-16">
          <div className="container-site">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink mb-6">
                  Acerca de la Materiateca
                </h2>
                <p className="text-sm leading-relaxed text-cedar-700 mb-4">
                  La Materiateca es el archivo vivo de materiales textiles del
                  taller de CEDIM. Cada muestra física tiene una ficha digital con
                  su composición, familia de fibra, construcción y trazabilidad.
                </p>
                <p className="text-sm leading-relaxed text-cedar-700">
                  Cuando un campo aparece como <span className="italic text-cedar-400">No identificado</span>,
                  significa que el dato no ha podido verificarse con una fuente
                  confiable. Preferimos ser honestos sobre lo que no sabemos.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-ink">
                    ¿Cómo proponer un material?
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-sm text-cedar-700">
                    <li>Llena el formulario "Proponer un material".</li>
                    <li>Entrega a Ivette la muestra física (mínimo <strong>15 × 15 cm</strong>).</li>
                    <li>Avísale en persona o por correo que ya llenaste el formulario.</li>
                    <li>Ivette lo revisa y, si se aprueba, aparece en el catálogo.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-ink">
                    ¿Cómo pedir una muestra prestada?
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-sm text-cedar-700">
                    <li>En la ficha del material, haz clic en "Solicitar préstamo".</li>
                    <li>Pasa al taller y deja una identificación con Ivette.</li>
                    <li>La muestra debe regresar íntegra <strong>al día siguiente</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cedar-200 py-8">
        <div className="container-site flex items-center justify-between">
          <span className="text-xs text-cedar-400">
            CEDIM Materiateca · {new Date().getFullYear()}
          </span>
          <span className="text-xs font-bold tracking-widest text-cedar-400">
            ©CEDIM
          </span>
        </div>
      </footer>
    </>
  );
}
