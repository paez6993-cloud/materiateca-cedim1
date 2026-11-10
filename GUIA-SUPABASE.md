# Guía de configuración — Supabase + Netlify
**Materiateca CEDIM**  
Sigue estos pasos en orden. Tarda unos 30 minutos.

---

## Paso 1: Instalar Node.js

1. Ve a **https://nodejs.org**
2. Descarga la versión **LTS** (el botón verde grande)
3. Instala con todas las opciones por defecto
4. Cierra y vuelve a abrir la terminal (PowerShell)
5. Verifica: escribe `node --version` — debe mostrar algo como `v20.x.x`

---

## Paso 2: Instalar las dependencias del proyecto

Abre la terminal en la carpeta `materiateca-cedim`:

```
cd C:\Users\marisolpaez\materiateca-cedim
npm install
```

Espera a que termine (1–2 minutos).

---

## Paso 3: Crear el proyecto en Supabase

1. Ve a **https://supabase.com** y crea una cuenta (gratis)
2. Haz clic en **"New project"**
3. Llénalo así:
   - **Name:** `materiateca-cedim`
   - **Database password:** elige una contraseña segura y **guárdala en un lugar seguro**
   - **Region:** elige el más cercano (`US East` o `South America` si aparece)
4. Espera ~2 minutos a que el proyecto se cree

---

## Paso 4: Crear las tablas (esquema de base de datos)

1. En tu proyecto de Supabase, haz clic en **"SQL Editor"** (menú izquierdo)
2. Haz clic en **"New query"**
3. Abre el archivo `supabase/migrations/001_initial_schema.sql` en tu computadora
4. Copia todo el contenido y pégalo en el editor SQL
5. Haz clic en **"Run"** (o Ctrl+Enter)
6. Debe decir "Success. No rows returned"
7. Repite con el archivo `supabase/migrations/002_rls_policies.sql`

---

## Paso 5: Crear el bucket de fotos

1. En Supabase, ve a **"Storage"** (menú izquierdo)
2. Haz clic en **"New bucket"**
3. Llénalo así:
   - **Name:** `materiales-fotos`
   - **Public bucket:** activa esta opción ✓
4. Haz clic en **"Save"**

---

## Paso 6: Crear los usuarios de administración

Crearás las cuentas de Ivette y Efraín manualmente (no hay registro público).

1. En Supabase, ve a **"Authentication"** > **"Users"**
2. Haz clic en **"Invite user"** (o "Add user")
3. Crea el usuario de Ivette con su correo institucional y una contraseña temporal
4. Repite para Efraín
5. Dile a cada uno que cambie su contraseña la primera vez que entre

---

## Paso 7: Obtener las claves de API

1. En Supabase, ve a **"Settings"** > **"API"**
2. Anota (o copia) estos valores:
   - **Project URL** → esto va en `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** (bajo "Project API keys") → esto va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (bajo "Project API keys") → esto va en `SUPABASE_SERVICE_ROLE_KEY`
   
   ⚠️ La `service_role` key es secreta — nunca la compartas ni la pongas en el navegador

---

## Paso 8: Configurar Resend (correos)

1. Ve a **https://resend.com** y crea una cuenta gratuita
2. Ve a **"API Keys"** y crea una nueva clave
3. Copia la clave (empieza con `re_...`)
4. Esta va en `RESEND_API_KEY`

---

## Paso 9: Crear el archivo de variables de entorno

1. En la carpeta `materiateca-cedim`, copia el archivo `.env.local.example` y renómbralo a `.env.local`
2. Ábrelo con el Bloc de notas y llena los valores que obtuviste:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NOTIFICATION_EMAIL=correo-de-ivette@cedim.edu.mx
NEXT_PUBLIC_SITE_URL=https://materiateca.netlify.app
```

3. Guarda el archivo

---

## Paso 10: Probar en tu computadora

```
npm run dev
```

Abre **http://localhost:3000** en tu navegador. Debes ver la página de inicio.  
Prueba entrar a **http://localhost:3000/admin/login** con el correo y contraseña de Ivette.

---

## Paso 11: Crear el repositorio en GitHub

1. Ve a **https://github.com** y crea un repositorio nuevo:
   - **Name:** `materiateca-cedim`
   - **Private:** sí (recomendado)
   - **NO** marques "Add README"
2. Copia los comandos que te da GitHub (sección "push existing repository")
3. En la terminal dentro de la carpeta del proyecto:

```
git init
git add .
git commit -m "Versión inicial Materiateca CEDIM"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/materiateca-cedim.git
git push -u origin main
```

---

## Paso 12: Publicar en Netlify

1. Ve a **https://netlify.com** y entra a tu cuenta
2. Haz clic en **"Add new site"** > **"Import an existing project"**
3. Conecta tu GitHub y selecciona el repositorio `materiateca-cedim`
4. Deja la configuración de build tal como está (detecta automáticamente Next.js)
5. Antes de publicar, ve a **"Site settings"** > **"Environment variables"**
6. Agrega cada variable de `.env.local` (las mismas, pero aquí sin el archivo)
7. Haz clic en **"Deploy site"**
8. Espera 2–3 minutos. Netlify te dará una URL como `random-name.netlify.app`
9. Puedes cambiar el nombre en **"Domain settings"** a `materiateca-cedim.netlify.app`

---

## Paso 13: Actualizar la URL base

Una vez que tengas la URL de Netlify:
1. Ve a las variables de entorno de Netlify y actualiza `NEXT_PUBLIC_SITE_URL` con tu URL real
2. Ve a Supabase > **"Authentication"** > **"URL Configuration"**
3. Agrega tu URL de Netlify en **"Site URL"**
4. En **"Redirect URLs"** agrega: `https://tu-sitio.netlify.app/**`

---

## ✓ ¡Listo!

El sitio está publicado. Ivette puede entrar a `https://tu-sitio.netlify.app/admin/login`.

---

## Límites del plan gratuito (referencia)

| Servicio | Límite gratis |
|----------|--------------|
| Supabase | 500 MB DB, 1 GB Storage, 50 000 usuarios |
| Netlify | 300 min build/mes, 100 GB banda |
| Resend | 3 000 emails/mes |

Más que suficiente para este semestre.
