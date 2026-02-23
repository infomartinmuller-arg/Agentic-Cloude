# Agentic Cloude - Plataforma de Gestión de Eventos

Sistema integral para la gestión de eventos, proveedores, pagos y producción.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Server Actions + API Routes
- **Base de datos:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js v5 con Credentials + RBAC (5 roles)
- **UI:** Tablas tipo Excel, Hub por evento con tabs, Dashboard con métricas

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar PostgreSQL con Docker
npm run docker:up

# 3. Generar cliente Prisma y sincronizar DB
npm run db:generate
npm run db:push

# 4. Cargar datos de demo
npm run db:seed

# 5. Iniciar la aplicación
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Credenciales de demo

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@agentic.com | admin123 | Dueño |
| laura@agentic.com | admin123 | Coordinador |
| carlos@agentic.com | admin123 | Tesorero |
| ana@agentic.com | admin123 | Diseñador |
| pedro@agentic.com | admin123 | Asistente |

## Roles RBAC

- **Dueño (Owner):** Acceso total
- **Coordinador:** Gestiona eventos, proveedores y contratos
- **Tesorero:** Gestiona pagos y ve contratos
- **Diseñador:** Sube documentos y ve eventos
- **Asistente:** Solo lectura

## Motor de Alertas Inteligentes

Las alertas se generan automáticamente basadas en la proximidad temporal al evento:

| Tiempo al evento | Alertas generadas |
|-----------------|-------------------|
| > 2 meses | Ninguna |
| 2 meses | Contratos y proveedores pendientes |
| 1 mes | Pagos y checklists pendientes |
| 1 semana | Todo es crítico |

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/         # Login
│   ├── (dashboard)/          # Layout con sidebar
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── eventos/          # Tablero + Hub con tabs
│   │   ├── proveedores/      # Directorio de proveedores
│   │   ├── pagos/            # Resumen de pagos
│   │   ├── checklists/       # Vista global de checklists
│   │   ├── alertas/          # Centro de alertas
│   │   ├── documentos/       # Gestión de documentos
│   │   └── configuracion/    # Usuarios y roles
│   └── api/
│       ├── auth/             # Auth.js endpoints
│       └── alerts/generate/  # Generación de alertas
├── components/
│   ├── layout/               # Sidebar, Header, Providers
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   ├── auth.ts               # Configuración Auth.js
│   ├── auth-utils.ts         # Helpers RBAC
│   ├── alert-engine.ts       # Motor de alertas
│   ├── db.ts                 # Cliente Prisma
│   └── utils.ts              # Utilidades
└── middleware.ts              # Protección de rutas
```
