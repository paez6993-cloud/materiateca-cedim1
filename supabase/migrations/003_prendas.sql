-- Tabla de prendas realizadas con cada material
CREATE TABLE IF NOT EXISTS prendas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_codigo TEXT NOT NULL REFERENCES materiales(codigo) ON DELETE CASCADE,
  foto_url      TEXT NOT NULL,
  descripcion   TEXT,
  autor_nombre  TEXT NOT NULL,
  autor_contacto TEXT,         -- Instagram, correo o teléfono (opcional)
  visible       BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prendas_material ON prendas(material_codigo);

-- RLS
ALTER TABLE prendas ENABLE ROW LEVEL SECURITY;

-- Público puede ver las prendas visibles
CREATE POLICY "prendas_public_select" ON prendas
  FOR SELECT USING (visible = true);

-- Solo admins pueden insertar / actualizar / eliminar
CREATE POLICY "prendas_admin_all" ON prendas
  FOR ALL USING (auth.role() = 'authenticated');

-- Bucket de Storage para fotos de prendas (ejecutar en Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('prendas', 'prendas', true);
