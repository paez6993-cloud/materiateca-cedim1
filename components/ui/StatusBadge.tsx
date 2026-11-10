import {
  EstadoDisponibilidad,
  DISPONIBILIDAD_LABELS,
  DISPONIBILIDAD_COLORS,
} from "@/types/database";

export function StatusBadge({ estado }: { estado: EstadoDisponibilidad }) {
  return (
    <span className={`badge ${DISPONIBILIDAD_COLORS[estado]}`}>
      {DISPONIBILIDAD_LABELS[estado]}
    </span>
  );
}
