"use client";

import Image from "next/image";
import Link from "next/link";
import { FAMILIA_LABELS, DISPONIBILIDAD_COLORS, DISPONIBILIDAD_LABELS } from "@/types/database";

// Muestras de relleno para visualizar el diseño antes de tener materiales reales
const PLACEHOLDERS = [
  { codigo: "CED-NAT-001", nombre: "Lino crudo natural", familia: "natural_vegetal", color: "#c8b89a", estado: "disponible" },
  { codigo: "CED-ANI-001", nombre: "Lana merino fina", familia: "natural_animal", color: "#8b7355", estado: "disponible" },
  { codigo: "CED-SIN-001", nombre: "Poliéster texturizado", familia: "sintetica", color: "#6b7280", estado: "prestada" },
  { codigo: "CED-NAT-002", nombre: "Algodón orgánico", familia: "natural_vegetal", color: "#d4c5a9", estado: "disponible" },
  { codigo: "CED-ART-001", nombre: "Viscosa bambú", familia: "artificial_regenerada", color: "#9cad99", estado: "solo_consulta" },
  { codigo: "CED-MEZ-001", nombre: "Mezcla lino-algodón", familia: "mezcla", color: "#b5a89c", estado: "disponible" },
  { codigo: "CED-ANI-002", nombre: "Seda natural cruda", familia: "natural_animal", color: "#e8d5b7", estado: "disponible" },
  { codigo: "CED-NAT-003", nombre: "Yute arpillera", familia: "natural_vegetal", color: "#a67c52", estado: "disponible" },
  { codigo: "CED-SIN-002", nombre: "Nylon ripstop", familia: "sintetica", color: "#4a5568", estado: "agotada" },
  { codigo: "CED-ART-002", nombre: "Modal suave", familia: "artificial_regenerada", color: "#c4b5c9", estado: "disponible" },
];

interface CarouselItem {
  codigo: string;
  nombre: string;
  familia_fibra?: string;
  familia?: string;
  estado_disponibilidad?: string;
  estado?: string;
  foto_completa_url?: string | null;
  color?: string;
}

interface InfiniteCarouselProps {
  materiales?: CarouselItem[];
}

export function InfiniteCarousel({ materiales = [] }: InfiniteCarouselProps) {
  const items: CarouselItem[] = materiales.length > 0
    ? materiales
    : PLACEHOLDERS.map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        familia_fibra: p.familia,
        estado_disponibilidad: p.estado,
        foto_completa_url: null,
        color: p.color,
      }));

  // Duplicar para efecto infinito
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Gradientes de fade en los bordes */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-cedar-50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-cedar-50 to-transparent" />

      <div className="flex gap-4 carousel-track py-2">
        {doubled.map((item, i) => (
          <Link
            key={`${item.codigo}-${i}`}
            href={`/material/${item.codigo}`}
            className="group flex-shrink-0 w-48 flex flex-col overflow-hidden border border-cedar-200 bg-white transition-shadow hover:shadow-md"
          >
            {/* Imagen o placeholder de color */}
            <div className="relative aspect-square overflow-hidden">
              {item.foto_completa_url ? (
                <Image
                  src={item.foto_completa_url}
                  alt={item.nombre}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="192px"
                />
              ) : (
                <div
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundColor: (item as any).color || "#e8e3d8",
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 4px,
                      rgba(255,255,255,0.15) 4px,
                      rgba(255,255,255,0.15) 5px
                    )`,
                  }}
                />
              )}
              {/* Badge estado */}
              <div className="absolute bottom-2 left-2">
                <span className={`badge text-xs ${
                  DISPONIBILIDAD_COLORS[(item.estado_disponibilidad || "disponible") as keyof typeof DISPONIBILIDAD_COLORS]
                }`}>
                  {DISPONIBILIDAD_LABELS[(item.estado_disponibilidad || "disponible") as keyof typeof DISPONIBILIDAD_LABELS]}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 p-3">
              <p className="font-mono text-xs text-cedar-500">{item.codigo}</p>
              <p className="text-xs font-medium leading-tight text-ink line-clamp-2">
                {item.nombre}
              </p>
              <p className="text-xs text-cedar-500">
                {FAMILIA_LABELS[(item.familia_fibra || "mezcla") as keyof typeof FAMILIA_LABELS]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
