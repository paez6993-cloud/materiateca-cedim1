// Muestra el valor o "No identificado" si es null/vacío
export function CampoONoIdentificado({
  valor,
  className = "",
}: {
  valor: string | null | undefined;
  className?: string;
}) {
  if (!valor) {
    return (
      <span className={`text-cedar-400 italic ${className}`}>
        No identificado
      </span>
    );
  }
  return <span className={className}>{valor}</span>;
}

export function CampoONaDisponible({
  valor,
  className = "",
}: {
  valor: string | null | undefined;
  className?: string;
}) {
  if (!valor) {
    return (
      <span className={`text-cedar-400 italic ${className}`}>
        No disponible
      </span>
    );
  }
  return <span className={className}>{valor}</span>;
}
