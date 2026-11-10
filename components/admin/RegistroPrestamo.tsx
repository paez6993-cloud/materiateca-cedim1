"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RegistroPrestamo({ prestamoId }: { prestamoId: string }) {
  const [open, setOpen] = useState(false);
  const [estadoMuestra, setEstadoMuestra] = useState("íntegra");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function marcarDevuelto() {
    setLoading(true);
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];

    // Obtener el material_id para actualizar disponibilidad
    const { data: prestamo } = await supabase
      .from("prestamos")
      .select("material_id")
      .eq("id", prestamoId)
      .single();

    await supabase
      .from("prestamos")
      .update({
        fecha_devolucion: hoy,
        estado_muestra: estadoMuestra,
        notas: notas || null,
      })
      .eq("id", prestamoId);

    if (prestamo?.material_id) {
      await supabase
        .from("materiales")
        .update({ estado_disponibilidad: "disponible" })
        .eq("id", prestamo.material_id);
    }

    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 btn-secondary py-1.5 text-xs"
      >
        Marcar devuelto
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 flex-shrink-0 w-56">
      <select
        value={estadoMuestra}
        onChange={(e) => setEstadoMuestra(e.target.value)}
        className="field-input py-1.5 text-xs"
      >
        <option value="íntegra">Íntegra</option>
        <option value="con daño menor">Con daño menor</option>
        <option value="con daño importante">Con daño importante</option>
        <option value="no fue devuelta">No fue devuelta</option>
      </select>
      <input
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Notas opcionales…"
        className="field-input py-1.5 text-xs"
      />
      <div className="flex gap-2">
        <button
          onClick={marcarDevuelto}
          disabled={loading}
          className="btn-primary flex-1 py-1.5 text-xs"
        >
          {loading ? "…" : "Confirmar"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="btn-secondary py-1.5 text-xs px-3"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
