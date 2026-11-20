"use client";

import { useState, useEffect } from "react";

type Dato = { texto: string; fuente?: string | null };

export function DatoCurioso({ datos }: { datos: Dato[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * datos.length));
  }, [datos.length]);

  if (!datos.length) return null;

  const dato = datos[idx];
  const prev = () => setIdx((i) => (i - 1 + datos.length) % datos.length);
  const next = () => setIdx((i) => (i + 1) % datos.length);

  return (
    <div className="flex items-start gap-4">
      <button
        onClick={prev}
        aria-label="Dato anterior"
        className="mt-1 flex-shrink-0 text-cedar-400 hover:text-ink transition-colors text-xl leading-none"
      >
        ←
      </button>

      <blockquote className="flex-1 min-w-0">
        <p className="font-display text-2xl leading-snug text-ink md:text-3xl">
          "{dato.texto}"
        </p>
        {dato.fuente && (
          <footer className="mt-4 text-sm text-cedar-500">
            Fuente: {dato.fuente}
          </footer>
        )}
        <p className="mt-3 text-xs text-cedar-400">
          {idx + 1} / {datos.length}
        </p>
      </blockquote>

      <button
        onClick={next}
        aria-label="Siguiente dato"
        className="mt-1 flex-shrink-0 text-cedar-400 hover:text-ink transition-colors text-xl leading-none"
      >
        →
      </button>
    </div>
  );
}
