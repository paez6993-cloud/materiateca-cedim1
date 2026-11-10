-- ============================================================
-- MATERIATECA CEDIM — Esquema inicial
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: proveedores
-- ============================================================
CREATE TABLE proveedores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  contacto    TEXT,          -- nombre de persona de contacto
  correo      TEXT,
  telefono    TEXT,
  sitio_web   TEXT,
  direccion   TEXT,
  ciudad      TEXT,
  pais        TEXT DEFAULT 'México',
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: materiales
-- ============================================================
CREATE TABLE materiales (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  codigo                TEXT UNIQUE,                          -- CED-NAT-001 (auto-asignado al aprobar)
  nombre                TEXT NOT NULL,
  ubicacion_taller      TEXT,                                 -- ej. "Estante A, cajón 3"

  -- Estado del flujo
  estado_revision       TEXT NOT NULL DEFAULT 'pendiente'    -- pendiente | aprobado | rechazado
                        CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado')),
  estado_disponibilidad TEXT NOT NULL DEFAULT 'disponible'   -- disponible | prestada | solo_consulta | agotada
                        CHECK (estado_disponibilidad IN ('disponible', 'prestada', 'solo_consulta', 'agotada')),
  es_prestable          BOOLEAN NOT NULL DEFAULT TRUE,

  -- Familia de fibra
  familia_fibra         TEXT NOT NULL
                        CHECK (familia_fibra IN ('natural_vegetal', 'natural_animal', 'artificial_regenerada', 'sintetica', 'mezcla')),

  -- Composición
  composicion           TEXT,                                 -- NULL = "No identificado"
  composicion_fuente    TEXT,                                 -- ficha técnica del proveedor, etiqueta, etc.

  -- Construcción
  construccion          TEXT
                        CHECK (construccion IN ('tejido_plano', 'punto', 'no_tejido', NULL)),

  -- Peso
  peso_categoria        TEXT
                        CHECK (peso_categoria IN ('ligero', 'medio', 'pesado', NULL)),
  gramaje               NUMERIC(8,2),                        -- g/m², NULL si no se conoce

  -- Origen
  origen                TEXT
                        CHECK (origen IN ('nacional', 'importado', NULL)),

  -- Características especiales
  es_reciclado          BOOLEAN DEFAULT FALSE,
  certificacion         TEXT,                                 -- NULL si no aplica
  certificacion_fuente  TEXT,
  es_textil_tradicional BOOLEAN DEFAULT FALSE,
  desarrollado_en_cedim BOOLEAN DEFAULT FALSE,

  -- Cadena de trazabilidad
  proveedor_nombre      TEXT,                                 -- redundante para acceso rápido
  fabricante            TEXT,
  productor_materia_prima TEXT,
  lugar_produccion      TEXT,

  -- Contenido editorial
  usos_sugeridos        TEXT,
  donde_comprar         TEXT,
  notas                 TEXT,
  fuentes               TEXT,                                 -- campo libre para referencias

  -- Fotos (URLs de Supabase Storage)
  foto_completa_url     TEXT,
  foto_textura_url      TEXT,

  -- Propuesta original
  propuesto_por_nombre  TEXT,
  propuesto_por_correo  TEXT,

  -- Auditoría
  aprobado_por          UUID REFERENCES auth.users(id),
  aprobado_at           TIMESTAMPTZ,
  rechazado_por         UUID REFERENCES auth.users(id),
  rechazado_at          TIMESTAMPTZ,
  motivo_rechazo        TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: material_proveedores  (relación N:N para segunda etapa)
-- ============================================================
CREATE TABLE material_proveedores (
  material_id  UUID REFERENCES materiales(id) ON DELETE CASCADE,
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE CASCADE,
  PRIMARY KEY (material_id, proveedor_id)
);

-- ============================================================
-- TABLA: propuestas_publicas
-- Formulario público "Proponer un material" (sin cuenta)
-- ============================================================
CREATE TABLE propuestas_publicas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_material   TEXT NOT NULL,
  familia_fibra     TEXT,
  composicion       TEXT,
  construccion      TEXT,
  origen            TEXT,
  nombre_proponente TEXT,
  correo_proponente TEXT,
  carrera           TEXT,
  semestre          TEXT,
  notas             TEXT,
  proveedor_nombre  TEXT,
  proveedor_contacto TEXT,
  estado            TEXT NOT NULL DEFAULT 'nueva'   -- nueva | convertida | descartada
                    CHECK (estado IN ('nueva', 'convertida', 'descartada')),
  material_id       UUID REFERENCES materiales(id), -- se llena al convertir en material
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: contadores_codigo
-- Para generar CED-[FAMILIA]-[###] sin colisiones
-- ============================================================
CREATE TABLE contadores_codigo (
  familia  TEXT PRIMARY KEY,
  contador INTEGER NOT NULL DEFAULT 0
);

-- Insertar familias iniciales
INSERT INTO contadores_codigo (familia) VALUES
  ('NAT'), ('ANI'), ('ART'), ('SIN'), ('MEZ');

-- ============================================================
-- FUNCIÓN: generar_codigo_material()
-- Asigna el siguiente código disponible al aprobar
-- ============================================================
CREATE OR REPLACE FUNCTION generar_codigo_material(familia_abbr TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  nuevo_contador INTEGER;
  nuevo_codigo   TEXT;
BEGIN
  UPDATE contadores_codigo
  SET contador = contador + 1
  WHERE familia = familia_abbr
  RETURNING contador INTO nuevo_contador;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Familia no reconocida: %', familia_abbr;
  END IF;

  nuevo_codigo := 'CED-' || familia_abbr || '-' || LPAD(nuevo_contador::TEXT, 3, '0');
  RETURN nuevo_codigo;
END;
$$;

-- Mapeo familia → abreviatura
CREATE OR REPLACE FUNCTION familia_a_abbr(familia TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE familia
    WHEN 'natural_vegetal'      THEN 'NAT'
    WHEN 'natural_animal'       THEN 'ANI'
    WHEN 'artificial_regenerada' THEN 'ART'
    WHEN 'sintetica'            THEN 'SIN'
    WHEN 'mezcla'               THEN 'MEZ'
    ELSE UPPER(LEFT(familia, 3))
  END;
END;
$$;

-- ============================================================
-- TABLA: prestamos
-- Registros de préstamo (Ivette los crea manualmente)
-- ============================================================
CREATE TABLE prestamos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id         UUID NOT NULL REFERENCES materiales(id) ON DELETE RESTRICT,
  nombre_prestatario  TEXT NOT NULL,
  correo_prestatario  TEXT NOT NULL,
  carrera_semestre    TEXT,
  motivo              TEXT,
  fecha_salida        DATE NOT NULL,
  fecha_regreso_esperada DATE NOT NULL,
  dejo_identificacion BOOLEAN NOT NULL DEFAULT FALSE,  -- NUNCA guardar foto/número
  fecha_devolucion    DATE,                            -- NULL = sigue prestado
  estado_muestra      TEXT,                            -- nota al devolver: "íntegra", "con daño leve"
  notas               TEXT,
  registrado_por      UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: solicitudes_prestamo
-- Las hacen estudiantes desde la ficha pública
-- ============================================================
CREATE TABLE solicitudes_prestamo (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id       UUID NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  correo            TEXT NOT NULL,
  carrera_semestre  TEXT,
  motivo            TEXT,
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmada', 'rechazada')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: datos_curiosos
-- "¿Sabías que...?" administrados por Ivette
-- ============================================================
CREATE TABLE datos_curiosos (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto     TEXT NOT NULL,
  fuente    TEXT,
  activo    BOOLEAN NOT NULL DEFAULT TRUE,
  orden     INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_materiales_updated_at
  BEFORE UPDATE ON materiales
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_prestamos_updated_at
  BEFORE UPDATE ON prestamos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_datos_curiosos_updated_at
  BEFORE UPDATE ON datos_curiosos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ÍNDICES útiles para búsquedas y filtros del catálogo
-- ============================================================
CREATE INDEX idx_materiales_codigo ON materiales(codigo);
CREATE INDEX idx_materiales_familia ON materiales(familia_fibra);
CREATE INDEX idx_materiales_estado_revision ON materiales(estado_revision);
CREATE INDEX idx_materiales_disponibilidad ON materiales(estado_disponibilidad);
CREATE INDEX idx_materiales_construccion ON materiales(construccion);
CREATE INDEX idx_materiales_origen ON materiales(origen);
CREATE INDEX idx_prestamos_material ON prestamos(material_id);
CREATE INDEX idx_prestamos_devolucion ON prestamos(fecha_devolucion);
