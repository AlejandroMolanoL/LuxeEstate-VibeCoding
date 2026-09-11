# LuxeEstate 🏰✨
### Plataforma Web Inmobiliaria de Bienes Raíces de Lujo

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

**LuxeEstate** es una plataforma web moderna diseñada para la exhibición, búsqueda y gestión integral de propiedades exclusivas y de alta gama a nivel mundial. Cuenta con una experiencia de usuario ultra fluida, soporte multilingüe, mapas georreferenciados interactivos y un potente panel de administración.

---

## 📑 Tabla de Contenidos

1. [Características y Funcionalidades](#-características-y-funcionalidades)
   - [Portal Público para Clientes](#1-portal-público-para-clientes)
   - [Página de Detalle de Propiedad](#2-página-de-detalle-de-propiedad)
   - [Panel de Administración (Admin Dashboard)](#3-panel-de-administración-admin-dashboard)
   - [Autenticación y Seguridad](#4-autenticación-y-seguridad)
   - [Internacionalización (i18n)](#5-internacionalización-i18n)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Guía de Instalación y Puesta en Marcha](#-guía-de-instalación-y-puesta-en-marcha)
   - [1. Clonar el repositorio](#1-clonar-el-repositorio)
   - [2. Instalar dependencias](#2-instalar-dependencias)
   - [3. Configuración de Variables de Entorno](#3-configuración-de-variables-de-entorno)
   - [4. Estructura de la Base de Datos (Supabase)](#4-estructura-de-la-base-de-datos-supabase)
   - [5. Ejecutar en entorno de desarrollo](#5-ejecutar-en-entorno-de-desarrollo)
6. [Scripts Disponibles](#-scripts-disponibles)
7. [Licencia](#-licencia)

---

## 🚀 Características y Funcionalidades

### 1. Portal Público para Clientes
* **Hero Search Interactivo**: Buscador en tiempo real por título, palabra clave o ubicación geográfica.
* **Filtros Rápidos de Listado**: Alterna instantáneamente entre propiedades en **Venta** (*Buy / For Sale*), **Renta** (*Rent / For Rent*) o **Todas** (*All*).
* **Modal de Filtros Avanzados**:
  * Rango de precios configurable (mínimo y máximo).
  * Cantidad mínima de habitaciones (recámaras) y baños.
  * Tipo de propiedad (*House*, *Apartment*, *Villa*, *Penthouse*, *Commercial*).
  * Selección de múltiples amenidades (*Piscina, Gimnasio, Helipuerto, Spa, Vista al Mar, Seguridad 24/7, Bodega de Vinos, etc.*).
* **Colecciones Destacadas**: Sección para dar vitrina prioritaria a las propiedades catalogadas como exclusivas o destacadas (*is_featured*).
* **Paginación Dinámica**: Sistema de paginación del lado del servidor que preserva todos los parámetros de filtrado en la URL.

### 2. Página de Detalle de Propiedad
* **Galería Multimedia**: Visualizador con carrusel de fotografías en alta resolución.
* **Ficha Técnica Detallada**: Muestra área en m², habitaciones, baños, parqueaderos, año de construcción y lista visual de amenidades.
* **Mapa Interactivo con Leaflet**: Localización geográfica precisa basada en coordenadas (latitud y longitud) con marcadores personalizados.
* **Calculadora de Hipotecas**: Herramienta interactiva para que los compradores estimen cuotas mensuales, tasas de interés y pagos iniciales.
* **Formulario de Contacto Directo**: Envío de consultas comerciales para agendar visitas o solicitar información con agentes.
* **SEO & Metadatos Dinámicos**: Generación automática de OpenGraph tags y metadatos optimizados para indexación y redes sociales.

### 3. Panel de Administración (Admin Dashboard)
* **Gestión de Propiedades (`/admin/propiedades`)**:
  * Tabla con vista general del inventario, estados y métricas rápidas.
  * **Creación y Edición**: Formulario integral (`/admin/propiedades/nueva` y `[id]`) con validaciones, configuración de coordenadas geográficas y selección de amenidades.
  * **Subida de Imágenes**: Carga directa y almacenamiento de imágenes en buckets de Supabase Storage.
  * **Inactivación Lógica (*Soft Delete*)**: Capacidad de desactivar y reactivar propiedades sin eliminarlas físicamente de la base de datos, manteniéndolas ocultas del catálogo público pero disponibles para auditoría y reactivación en el panel administrativo.
  * **Modal de Vista Previa**: Revisa cómo lucirá la publicación antes de guardarla o activarla.
* **Directorio de Usuarios y Roles (`/admin/usuarios`)**:
  * Supervisión de cuentas y asignación de roles con diferentes niveles de acceso:
    * `admin` (Administrador general)
    * `broker` (Corredor inmobiliario)
    * `agent` (Agente de ventas)
    * `user` (Cliente o usuario registrado)
  * Filtros por rol y buscador de usuarios por nombre o correo.

### 4. Autenticación y Seguridad
* Autenticación OAuth integrada mediante **Supabase Auth**:
  * Inicio de sesión con **Google**.
  * Inicio de sesión con **GitHub**.
* Protección de rutas y persistencia de sesiones seguras mediante `@supabase/ssr` y cookies HTTP.
* Redirección inteligente tras el inicio de sesión.

### 5. Internacionalización (i18n)
* Sistema multilingüe nativo con soporte para tres idiomas:
  * 🇪🇸 **Español** (`es`)
  * 🇺🇸 **Inglés** (`en`)
  * 🇫🇷 **Francés** (`fr`)
* Selector de idioma accesible en la barra de navegación que almacena la preferencia en cookies del navegador.

---

## 🛠️ Stack Tecnológico

| Área | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 16 (App Router)](https://nextjs.org/) | Renderizado híbrido (RSC, SSR, Client Components) y Server Actions |
| **Biblioteca UI** | [React 19](https://react.dev/) | Construcción reactiva y declarativa de interfaces de usuario |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) | Tipado estático fuerte para evitar errores en tiempo de ejecución |
| **Estilos & Diseño** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS | Sistema de diseño de lujo (*nordic*, *mosque*, *accent*), responsivo y fluido |
| **Base de Datos & Auth** | [Supabase](https://supabase.com/) | Base de datos PostgreSQL relacional, Auth OAuth y Storage |
| **SDK Supabase** | `@supabase/supabase-js` y `@supabase/ssr` | Manejo de clientes y servidores con cookies seguras |
| **Mapas Geográficos** | [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) | Renderizado de mapas interactivos y pines geolocalizados |
| **Iconografía** | Google Material Symbols & Material Icons | Iconos vectoriales limpios y consistentes |
| **Linter** | ESLint 9 | Calidad y formato del código fuente |

---

## 📁 Estructura del Proyecto

```text
luxu_estate/
├── app/                       # Rutas y páginas (Next.js App Router)
│   ├── admin/                 # Panel de administración (propiedades, usuarios)
│   │   ├── propiedades/       # Listado, creación, edición y server actions
│   │   └── usuarios/          # Directorio y gestión de roles
│   ├── api/                   # Rutas de API internas (endpoints auxiliares)
│   ├── auth/                  # Callbacks de autenticación OAuth
│   ├── login/                 # Página de inicio de sesión
│   ├── propiedades/[slug]/    # Página dinámica de detalle de cada propiedad
│   ├── layout.tsx             # Layout raíz de la aplicación
│   └── page.tsx               # Página principal (Home / Catálogo)
├── components/                # Componentes modulares y reutilizables
│   ├── admin/                 # Componentes del panel administrativo
│   ├── home/                  # HeroSearch, filtros, catálogo, tarjetas destacadas
│   ├── layout/                # Navbar, footer y elementos estructurales
│   └── property/              # Galería, mapa Leaflet, calculadora, contacto
├── data/                      # Datos mock y semillas de desarrollo
├── dictionaries/              # Diccionarios de traducción (es.json, en.json, fr.json)
├── lib/                       # Utilidades, clientes e integraciones
│   ├── i18n.ts                # Lógica del motor multilingüe
│   ├── properties.ts          # Consultas y filtros de propiedades en Supabase
│   └── supabase/              # Clientes de Supabase (browser, server y storage)
├── public/                    # Archivos estáticos (imágenes, logos, favicons)
├── types/                     # Definiciones de tipos e interfaces TypeScript
├── .env.template              # Plantilla de variables de entorno requeridas
└── package.json               # Dependencias y scripts del proyecto
```

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de contar con:
* **Node.js**: Versión `18.17.0` o superior (se recomienda Node 20 LTS o 22).
* **Gestor de paquetes**: `npm`, `pnpm`, `yarn` o `bun`.
* **Cuenta en Supabase**: Un proyecto activo con PostgreSQL habilitado.

---

## ⚙️ Guía de Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd luxu_estate
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copia la plantilla `.env.template` a un nuevo archivo `.env.local`:

```bash
cp .env.template .env.local
```

Abre `.env.local` y completa las credenciales de tu proyecto de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

*(Opcional: Si configuras inicio de sesión con Google o GitHub, habilita los proveedores OAuth correspondientes dentro del panel de Supabase en Authentication > Providers).*

### 4. Estructura de la Base de Datos (Supabase)

La tabla principal utilizada por el sistema es `properties`. Asegúrate de que tu base de datos cuente con los siguientes campos principales:

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  location TEXT,
  address TEXT,
  price NUMERIC NOT NULL,
  formatted_price TEXT,
  price_period TEXT,
  beds INTEGER DEFAULT 0,
  baths INTEGER DEFAULT 0,
  parking INTEGER DEFAULT 0,
  area TEXT,
  year_built INTEGER,
  images TEXT[] DEFAULT '{}',
  image_alt TEXT,
  badge TEXT,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('FOR SALE', 'FOR RENT', 'SOLD')),
  category TEXT NOT NULL CHECK (category IN ('House', 'Apartment', 'Villa', 'Penthouse', 'Commercial')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

> **Bucket de Almacenamiento**:
> Crea un bucket público en **Supabase Storage** llamado `properties` con políticas de lectura pública y escritura para subir fotografías de los inmuebles.

### 5. Ejecutar en entorno de desarrollo
Inicia el servidor de desarrollo local:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

* **Página principal**: [http://localhost:3000](http://localhost:3000)
* **Panel de Administración**: [http://localhost:3000/admin](http://localhost:3000/admin)
* **Login**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 📜 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

* `npm run dev`: Inicia el servidor de desarrollo de Next.js con recarga en caliente (*Hot Module Replacement*).
* `npm run build`: Compila la aplicación y optimiza los paquetes para producción.
* `npm run start`: Inicia el servidor de producción tras haber ejecutado `build`.
* `npm run lint`: Ejecuta ESLint para analizar y validar el código fuente.

---

## 📄 Licencia

Este proyecto es de carácter privado y formativo desarrollado en el marco del curso de *Vibe Coding*. Todos los derechos reservados.
