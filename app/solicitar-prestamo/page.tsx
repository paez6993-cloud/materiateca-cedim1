"use client";

import { NavBar } from "@/components/catalog/NavBar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ContenidoPrestamo() {
  const params = useSearchParams();
  const codigo = params.get("codigo");

  return (
    <>
      <NavBar />
      <main className="py-10 md:py-16">
        <div className="container-site max-w-2xl">

          {/* Breadcrumb */}
          <nav className="mb-8 text-xs text-cedar-500">
            <Link href="/catalogo" className="hover:text-ink">Catálogo</Link>
            {codigo && (
              <>
                <span className="mx-2">›</span>
                <Link href={`/material/${codigo}`} className="font-mono hover:text-ink">{codigo}</Link>
              </>
            )}
            <span className="mx-2">›</span>
            <span>Solicitar préstamo</span>
          </nav>

          {/* Encabezado */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-semibold text-ink">
              Préstamo de muestras
            </h1>
            {codigo && (
              <p className="mt-2 font-mono text-sm text-cedar-500">
                Material: {codigo}
              </p>
            )}
            <p className="mt-4 text-cedar-700 leading-relaxed">
              Las muestras de la Materiateca se pueden prestar para que las uses
              como referencia en tus proyectos de diseño. El préstamo es
              presencial, directo en el taller con Ivette.
            </p>
          </div>

          {/* Cómo funciona */}
          <section className="mb-10 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-cedar-500">
              Cómo funciona
            </h2>
            <div className="divide-y divide-cedar-100 border-y border-cedar-200">
              {[
                {
                  num: "01",
                  titulo: "Ve al taller",
                  texto: "El préstamo es presencial. Busca a Ivette en el taller de materiales del CEDIM en el horario de atención.",
                },
                {
                  num: "02",
                  titulo: "Deja tu identificación",
                  texto: "Para llevarte la muestra debes dejar una identificación vigente (credencial CEDIM o identificación oficial) como garantía.",
                },
                {
                  num: "03",
                  titulo: "Llévate la muestra",
                  texto: "Puedes llevar la muestra por el tiempo que acuerdes con Ivette. Regresa la muestra en las mismas condiciones en que la recibiste.",
                },
                {
                  num: "04",
                  titulo: "Recoge tu identificación",
                  texto: "Al devolver la muestra en buen estado, se te regresa tu identificación sin costo alguno.",
                },
              ].map(({ num, titulo, texto }) => (
                <div key={num} className="flex gap-5 py-5">
                  <span className="font-mono text-xs text-cedar-300 w-6 flex-shrink-0 pt-0.5">{num}</span>
                  <div>
                    <p className="font-medium text-sm text-ink">{titulo}</p>
                    <p className="mt-1 text-sm text-cedar-700 leading-relaxed">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Para qué sirve */}
          <section className="mb-10 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-cedar-500">
              Para qué sirve tener la muestra
            </h2>
            <ul className="space-y-3">
              {[
                "Sentir el gramaje, la caída y la textura real de la tela — cosas que no se pueden percibir en una foto.",
                "Comparar cómo se comporta el material con la luz, doblado o estirado.",
                "Llevarlo a una tlapalería o tienda de telas para encontrar algo similar o exactamente igual.",
                "Usarlo como referencia de color frente a otros materiales en tu proyecto.",
                "Hacer pruebas de costura, teñido o acabado antes de comprar metros.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-cedar-700">
                  <span className="text-cedar-300 flex-shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Reglas */}
          <section className="mb-12 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-cedar-500">
              Cuidado de la muestra
            </h2>
            <div className="border border-cedar-200 bg-cedar-50 px-5 py-4 space-y-2">
              {[
                "No cortes, rayes ni alfileres la muestra — es compartida por todos los estudiantes.",
                "Evita mojarla, mancharla o exponerla a productos químicos.",
                "Regresa la muestra doblada o enrollada, nunca arrugada.",
                "Si ocurre un accidente, avísale a Ivette antes de devolverla.",
              ].map((regla) => (
                <p key={regla} className="text-sm text-cedar-700 flex gap-3">
                  <span className="text-cedar-400 flex-shrink-0">·</span>
                  {regla}
                </p>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            {codigo && (
              <Link href={`/material/${codigo}`} className="btn-secondary text-center">
                ← Volver al material
              </Link>
            )}
            <Link href="/catalogo" className="btn-primary text-center">
              Ver más materiales
            </Link>
          </div>

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

export default function SolicitarPrestamoPage() {
  return (
    <Suspense>
      <ContenidoPrestamo />
    </Suspense>
  );
}
