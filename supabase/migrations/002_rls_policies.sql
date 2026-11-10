-- ============================================================
-- MATERIATECA CEDIM — Políticas de seguridad (RLS)
-- Row Level Security: controla quién puede leer/escribir qué
-- Ejecutar DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE materiales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_proveedores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE propuestas_publicas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_prestamo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_curiosos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contadores_codigo     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MATERIALES
-- ============================================================

-- Lectura pública: solo materiales aprobados
CREATE POLICY "materiales_lectura_publica"
  ON materiales FOR SELECT
  USING (estado_revision = 'aprobado');

-- Lectura admin: todos los estados
CREATE POLICY "materiales_lectura_admin"
  ON materiales FOR SELECT
  TO authenticated
  USING (TRUE);

-- Escritura: solo usuarios autenticados (Ivette / Efraín)
CREATE POLICY "materiales_insertar_admin"
  ON materiales FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "materiales_actualizar_admin"
  ON materiales FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "materiales_eliminar_admin"
  ON materiales FOR DELETE
  TO authenticated
  USING (TRUE);

-- ============================================================
-- PROVEEDORES
-- ============================================================

-- Lectura pública de proveedores
CREATE POLICY "proveedores_lectura_publica"
  ON proveedores FOR SELECT
  USING (TRUE);

CREATE POLICY "proveedores_escritura_admin"
  ON proveedores FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- MATERIAL_PROVEEDORES
-- ============================================================

CREATE POLICY "material_proveedores_lectura_publica"
  ON material_proveedores FOR SELECT
  USING (TRUE);

CREATE POLICY "material_proveedores_escritura_admin"
  ON material_proveedores FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- PROPUESTAS PÚBLICAS
-- ============================================================

-- Cualquiera puede insertar una propuesta (formulario público)
CREATE POLICY "propuestas_insertar_publico"
  ON propuestas_publicas FOR INSERT
  WITH CHECK (TRUE);

-- Solo admins pueden leer y modificar propuestas
CREATE POLICY "propuestas_lectura_admin"
  ON propuestas_publicas FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "propuestas_actualizar_admin"
  ON propuestas_publicas FOR UPDATE
  TO authenticated
  USING (TRUE);

-- ============================================================
-- PRÉSTAMOS
-- ============================================================

-- Solo admins gestionan préstamos
CREATE POLICY "prestamos_admin"
  ON prestamos FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- SOLICITUDES DE PRÉSTAMO
-- ============================================================

-- Cualquiera puede enviar una solicitud
CREATE POLICY "solicitudes_insertar_publico"
  ON solicitudes_prestamo FOR INSERT
  WITH CHECK (TRUE);

-- Solo admins las leen y gestionan
CREATE POLICY "solicitudes_lectura_admin"
  ON solicitudes_prestamo FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "solicitudes_actualizar_admin"
  ON solicitudes_prestamo FOR UPDATE
  TO authenticated
  USING (TRUE);

-- ============================================================
-- DATOS CURIOSOS
-- ============================================================

-- Lectura pública de datos activos
CREATE POLICY "datos_curiosos_lectura_publica"
  ON datos_curiosos FOR SELECT
  USING (activo = TRUE);

-- Admins ven todos y pueden editar
CREATE POLICY "datos_curiosos_admin"
  ON datos_curiosos FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- CONTADORES (solo admins pueden incrementar)
-- ============================================================

CREATE POLICY "contadores_lectura_admin"
  ON contadores_codigo FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "contadores_actualizar_admin"
  ON contadores_codigo FOR UPDATE
  TO authenticated
  USING (TRUE);

-- ============================================================
-- STORAGE: bucket "materiales-fotos"
-- Crear el bucket en Supabase > Storage y aplicar estas reglas
-- ============================================================

-- Las políticas de storage se configuran desde el panel de Supabase:
-- 1. Ir a Storage > Buckets > Create bucket
--    Nombre: materiales-fotos
--    Public bucket: SÍ (para que las fotos se puedan ver sin autenticación)
-- 2. Las fotos se suben solo desde el panel admin (autenticado)
-- La URL pública queda: https://[proyecto].supabase.co/storage/v1/object/public/materiales-fotos/[filename]
