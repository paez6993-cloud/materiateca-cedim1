import Image from "next/image";
import Link from "next/link";
import { Material, FAMILIA_LABELS, DISPONIBILIDAD_LABELS, DISPONIBILIDAD_COLORS } from "@/types/database";

interface MaterialCardProps {
  material: Pick<
    Material,
    | "codigo"
    | "nombre"
    | "familia_fibra"
    | "estado_disponibilidad"
    | "foto_completa_url"
    | "construccion"
    | "origen"
  >;
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Link
      href={`/material/${material.codigo}`}
      className="material-card group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-700"
    >
      {/* Foto */}
      <div className="relative aspect-square overflow-hidden bg-cedar-100">
        {material.foto_completa_url ? (
          <Image
            src={material.foto_completa_url}
            alt={material.nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cedar-300">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Badge estado */}
        <div className="absolute bottom-2 left-2">
          <span
            className={`badge text-xs ${DISPONIBILIDAD_COLORS[material.estado_disponibilidad]}`}
          >
            {DISPONIBILIDAD_LABELS[material.estado_disponibilidad]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="font-mono text-xs text-cedar-500">{material.codigo}</p>
        <h3 className="font-sans text-sm font-medium leading-tight text-ink line-clamp-2">
          {material.nombre}
        </h3>
        <p className="text-xs text-cedar-500">
          {FAMILIA_LABELS[material.familia_fibra]}
        </p>
      </div>
    </Link>
  );
}
