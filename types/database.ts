// Tipos TypeScript que reflejan el esquema de Supabase

export type FamiliaFibra =
  | "natural_vegetal"
  | "natural_animal"
  | "artificial_regenerada"
  | "sintetica"
  | "mezcla";

export type Construccion = "tejido_plano" | "punto" | "no_tejido";
export type PesoCategoria = "ligero" | "medio" | "pesado";
export type Origen = "nacional" | "importado";
export type EstadoRevision = "pendiente" | "aprobado" | "rechazado";
export type EstadoDisponibilidad =
  | "disponible"
  | "prestada"
  | "solo_consulta"
  | "agotada";
export type EstadoSolicitud = "pendiente" | "confirmada" | "rechazada";
export type EstadoPropuesta = "nueva" | "convertida" | "descartada";

export interface Material {
  id: string;
  codigo: string | null;
  nombre: string;
  ubicacion_taller: string | null;
  estado_revision: EstadoRevision;
  estado_disponibilidad: EstadoDisponibilidad;
  es_prestable: boolean;
  familia_fibra: FamiliaFibra;
  composicion: string | null;
  composicion_fuente: string | null;
  construccion: Construccion | null;
  peso_categoria: PesoCategoria | null;
  gramaje: number | null;
  origen: Origen | null;
  es_reciclado: boolean;
  certificacion: string | null;
  certificacion_fuente: string | null;
  es_textil_tradicional: boolean;
  desarrollado_en_cedim: boolean;
  proveedor_nombre: string | null;
  fabricante: string | null;
  productor_materia_prima: string | null;
  lugar_produccion: string | null;
  usos_sugeridos: string | null;
  donde_comprar: string | null;
  notas: string | null;
  fuentes: string | null;
  foto_completa_url: string | null;
  foto_textura_url: string | null;
  propuesto_por_nombre: string | null;
  propuesto_por_correo: string | null;
  aprobado_por: string | null;
  aprobado_at: string | null;
  rechazado_por: string | null;
  rechazado_at: string | null;
  motivo_rechazo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string | null;
  correo: string | null;
  telefono: string | null;
  sitio_web: string | null;
  direccion: string | null;
  ciudad: string | null;
  pais: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropuestaPublica {
  id: string;
  nombre_material: string;
  familia_fibra: string | null;
  composicion: string | null;
  construccion: string | null;
  origen: string | null;
  nombre_proponente: string | null;
  correo_proponente: string | null;
  carrera: string | null;
  semestre: string | null;
  notas: string | null;
  proveedor_nombre: string | null;
  proveedor_contacto: string | null;
  estado: EstadoPropuesta;
  material_id: string | null;
  created_at: string;
}

export interface Prestamo {
  id: string;
  material_id: string;
  nombre_prestatario: string;
  correo_prestatario: string;
  carrera_semestre: string | null;
  motivo: string | null;
  fecha_salida: string;
  fecha_regreso_esperada: string;
  dejo_identificacion: boolean;
  fecha_devolucion: string | null;
  estado_muestra: string | null;
  notas: string | null;
  registrado_por: string | null;
  created_at: string;
  updated_at: string;
  // Join
  material?: Pick<Material, "codigo" | "nombre" | "foto_completa_url">;
}

export interface SolicitudPrestamo {
  id: string;
  material_id: string;
  nombre: string;
  correo: string;
  carrera_semestre: string | null;
  motivo: string | null;
  estado: EstadoSolicitud;
  created_at: string;
  material?: Pick<Material, "codigo" | "nombre">;
}

export interface DatoCurioso {
  id: string;
  texto: string;
  fuente: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

// Etiquetas legibles para el usuario
export const FAMILIA_LABELS: Record<FamiliaFibra, string> = {
  natural_vegetal: "Natural vegetal",
  natural_animal: "Natural animal",
  artificial_regenerada: "Artificial / Regenerada",
  sintetica: "Sintética",
  mezcla: "Mezcla",
};

export const FAMILIA_ABBR: Record<FamiliaFibra, string> = {
  natural_vegetal: "NAT",
  natural_animal: "ANI",
  artificial_regenerada: "ART",
  sintetica: "SIN",
  mezcla: "MEZ",
};

export const CONSTRUCCION_LABELS: Record<Construccion, string> = {
  tejido_plano: "Tejido plano",
  punto: "Punto",
  no_tejido: "No tejido",
};

export const PESO_LABELS: Record<PesoCategoria, string> = {
  ligero: "Ligero",
  medio: "Medio",
  pesado: "Pesado",
};

export const DISPONIBILIDAD_LABELS: Record<EstadoDisponibilidad, string> = {
  disponible: "Disponible",
  prestada: "Prestada",
  solo_consulta: "Solo consulta",
  agotada: "Agotada",
};

export const DISPONIBILIDAD_COLORS: Record<EstadoDisponibilidad, string> = {
  disponible: "bg-green-100 text-green-800",
  prestada: "bg-amber-100 text-amber-800",
  solo_consulta: "bg-blue-100 text-blue-800",
  agotada: "bg-gray-100 text-gray-500",
};
