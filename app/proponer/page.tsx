import { NavBar } from "@/components/catalog/NavBar";
import { PropuestaForm } from "@/components/forms/PropuestaForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proponer un material",
};

export default function ProponerPage() {
  return (
    <>
      <NavBar />
      <main className="py-10">
        <div className="container-site max-w-2xl">
          <h1 className="font-display text-3xl font-semibold text-ink mb-2">
            Proponer un material
          </h1>

          {/* Instrucciones */}
          <div className="mb-8 space-y-3 rounded-sm border border-cedar-200 bg-cedar-100 px-5 py-4 text-sm text-cedar-700">
            <p className="font-semibold text-ink">
              Para que tu propuesta sea aprobada, debes:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Llenar este formulario.</li>
              <li>
                Entregar a <strong>Ivette</strong> en el taller la muestra
                física — mínimo <strong>15 × 15 cm</strong>, limpia e
                íntegra.
              </li>
              <li>
                Avisarle en persona o por correo que ya llenaste el formulario.
              </li>
            </ol>
            <p className="text-cedar-500 text-xs">
              Ningún dato es obligatorio excepto el nombre del material. Si no
              conoces un dato, déjalo en blanco o selecciona "No identificado".
              Ivette podrá completar o corregir la información antes de
              publicarla.
            </p>
          </div>

          <PropuestaForm />
        </div>
      </main>
    </>
  );
}
