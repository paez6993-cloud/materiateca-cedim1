import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-cedar-200 bg-cedar-50/95 backdrop-blur-sm">
      {/* Banda superior CEDIM */}
      <div className="border-b border-cedar-200 bg-ink py-1.5">
        <div className="container-site flex items-center justify-between">
          <span className="text-xs font-medium tracking-widest text-cedar-300 uppercase">
            Centro de Estudios Superiores de Diseño de Monterrey
          </span>
          <span className="font-sans text-xs font-bold tracking-widest text-cedar-100">
            ©CEDIM
          </span>
        </div>
      </div>

      {/* Navbar principal */}
      <div className="container-site flex h-14 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Materiateca
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-cedar-400 sm:block">
            CEDIM
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/catalogo"
            className="text-sm text-cedar-700 transition-colors hover:text-ink"
          >
            Catálogo
          </Link>
          <Link href="/proponer" className="btn-primary py-2 text-xs">
            Proponer material
          </Link>
        </nav>
      </div>
    </header>
  );
}
