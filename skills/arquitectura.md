# Arquitectura del Backend — StayCare

## Stack
- Runtime: Node.js 20 LTS
- Framework: Express 4 + TypeScript 5
- Base de datos: MySQL 8 via mysql2/promise
- Auth: JWT en cookies httpOnly
- Validación: Zod
- Encriptación: bcryptjs
- Deploy: Vercel (serverless) — entry point: api/index.ts

## Estructura de carpetas

StayCare-Backend/
├── api/
│   └── index.ts                  ← entry point Vercel (serverless)
├── src/
│   ├── app.ts                    ← Express app, middlewares globales, registro de rutas
│   ├── server.ts                 ← arranque HTTP local
│   │
│   ├── config/
│   │   ├── db.ts                 ← pool mysql2/promise + connectDB()
│   │   └── env.ts                ← validación de variables de entorno al arrancar
│   │
│   ├── modules/
│   │   └── [modulo]/
│   │       ├── [modulo].routes.ts       ← define verbos HTTP + middlewares por ruta
│   │       ├── [modulo].controller.ts   ← orquesta request/response, llama al servicio
│   │       ├── [modulo].service.ts      ← lógica de negocio, llama al repositorio
│   │       ├── [modulo].repository.ts   ← queries SQL raw con mysql2
│   │       └── [modulo].schema.ts       ← schemas Zod de validación
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts    ← verifica JWT del accessToken en cookie
│   │   │   ├── authorize.ts       ← comprueba rol del usuario autenticado
│   │   │   ├── validate.ts        ← ejecuta schema Zod sobre req.body / req.params
│   │   │   └── errorHandler.ts    ← captura AppError y errores no controlados
│   │   │
│   │   └── utils/
│   │       ├── jwt.ts             ← sign/verify tokens, opciones de cookies
│   │       ├── response.ts        ← sendSuccess() / sendError()
│   │       └── AppError.ts        ← clase de error operacional con statusCode
│   │
│   └── http/                     ← archivos .http para pruebas manuales (no producción)
│
├── .env
├── .env.example
├── tsconfig.json
└── package.json

## Variables de entorno requeridas

PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=staycare

# JWT
JWT_ACCESS_SECRET=secret_minimo_32_caracteres
JWT_REFRESH_SECRET=otro_secret_minimo_32_caracteres
ACCESS_TOKEN_EXPIRES=900        # segundos (15 min)
REFRESH_TOKEN_EXPIRES=604800    # segundos (7 días)

# App
CLIENT_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@staycare.com
SMTP_PASS=app_password

## Ciclo de vida de una petición HTTP

Request
  → CORS (valida CLIENT_URL)
  → express.json() + cookieParser()
  → authenticate (verifica accessToken JWT)
  → authorize(...roles) (verifica rol del token)
  → validate(schema) (Zod sobre body/params)
  → Controller (llama al Service)
  → Service (lógica de negocio, llama al Repository)
  → Repository (query SQL con mysql2/promise)
  → sendSuccess / sendError
  → errorHandler (captura cualquier throw no controlado)

## Modelo de identidad y clientes (MySQL)

- **`roles`**: catálogo fijo (`admin`, `staff`, `driver`, `client`). `users.role_id` → `roles.id`.
- **`users`**: cuenta (nombre, email, contraseña, teléfono, idioma, etc.).  
  **Crear un “cliente”** es crear un **`user` con rol `client`**.
- **`client_profiles`**: datos B2B **solo si el usuario es `client`** (1:1 con `users.id` vía `user_id`).  
  Incluye `contact_person`, `vat_number`, `billing_address`, `credits_terms_days`, `pricing_tier`, etc.
- **`properties`**: sedes del cliente; `client_profile_id` → `client_profiles.id` (1:N).

No existe tabla `clients` separada: el endpoint `/api/clients` opera sobre **`client_profiles` + `users` (rol client) + `properties`**.

Registro público (`POST /api/auth/register`) y **alta por admin/staff de cualquier rol** (`POST /api/users`, incl. `role: client` con `client_profile` y `properties` opcional) persisten en las **mismas tablas**; la parte “empresa” va en `client_profiles`. No hay `POST /api/clients` para esa alta (solo listado/edición de perfiles y `POST /api/clients/self` para completar perfil del usuario actual).

## Base de datos — resto de tablas (legado / migración)

Tabla                 | Origen (colección Mongo original)
----------------------|------------------------------------------
users / client_profiles / properties | Sustituyen el antiguo modelo Clients embebido
items                 | Items
orders                | Orders
order_items           | Orders.items[] (snapshot por valor, sin FK a items)
order_status_history  | Orders.status_history[]
order_photos          | Orders.photos[]
routes                | Routes
route_orders          | Routes.orders[] (pivot N:M)
invoices              | Invoices
invoice_orders        | Invoices.orders[] (pivot N:M)
invoice_line_items    | Invoices.line_items[]
invoice_payments      | Invoices.payments[]
machines              | Machine
invitations           | Invitation
password_resets       | PasswordReset
