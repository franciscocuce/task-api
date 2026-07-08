# Task API

API REST de gestión de tareas con **autenticación JWT, control de acceso por roles
y ownership, validación y tests**. Construida con **Express + TypeScript + Prisma +
PostgreSQL**, y totalmente **dockerizada**: se levanta con un solo comando.

## Características

- **Auth con JWT**: registro y login; las contraseñas se guardan hasheadas con bcrypt.
- **Roles y ownership**: cada usuario solo accede a **sus** tareas; un `ADMIN` accede a todas.
- **CRUD de tareas** completo, con el control de acceso resuelto en la capa de servicio.
- **Validación** de entrada con zod y **manejo de errores centralizado** (respuestas uniformes).
- **Tests**: unitarios del servicio (Prisma mockeado) + e2e con Supertest sobre una base real.
- **Docker**: API + PostgreSQL orquestados con docker-compose; migraciones automáticas al arrancar.

## Stack

| Capa       | Tecnología                     |
| ---------- | ------------------------------ |
| Backend    | Node.js, Express, TypeScript   |
| ORM / DB   | Prisma, PostgreSQL             |
| Auth       | JWT, bcrypt                    |
| Validación | zod                            |
| Testing    | Vitest, Supertest              |
| DevOps     | Docker, docker-compose         |

## Cómo correrlo

### Opción A — Docker (recomendada)

Levanta la API y la base juntas. No necesitás Node ni Postgres instalados, solo Docker.

```bash
docker compose up -d --build
```

La API queda en `http://localhost:3000`. Las migraciones se aplican solas al arrancar.

```bash
curl http://localhost:3000/api/health
# { "status": "ok", "timestamp": "..." }
```

Para apagar todo: `docker compose down` (agregá `-v` para borrar también los datos).

### Opción B — Local (desarrollo)

Con Node 22+ y el Postgres del compose corriendo (`docker compose up -d db`).

```bash
cd api
npm install
cp .env.example .env
npm run prisma:migrate      # crea las tablas
npm run db:seed             
npm run dev                 
```

## Variables de entorno

Ver `api/.env.example`. Las principales:

| Variable             | Descripción                              |
| -------------------- | ---------------------------------------- |
| `PORT`               | Puerto de la API (default 3000)          |
| `DATABASE_URL`       | Cadena de conexión a PostgreSQL          |
| `JWT_ACCESS_SECRET`  | Secreto para firmar los tokens           |
| `JWT_ACCESS_EXPIRES_IN` | Vencimiento del token (ej. `15m`)     |

## Endpoints

Todas las rutas de tareas requieren el header `Authorization: Bearer <token>`.

| Método | Ruta                 | Descripción                          | Auth |
| ------ | -------------------- | ------------------------------------ | ---- |
| POST   | `/api/auth/register` | Registra un usuario, devuelve token  | No   |
| POST   | `/api/auth/login`    | Login, devuelve token                | No   |
| GET    | `/api/auth/me`       | Perfil del usuario autenticado       | Sí   |
| POST   | `/api/tasks`         | Crea una tarea                       | Sí   |
| GET    | `/api/tasks`         | Lista tus tareas (todas si sos ADMIN)| Sí   |
| GET    | `/api/tasks/:id`     | Obtiene una tarea                    | Sí   |
| PATCH  | `/api/tasks/:id`     | Edita una tarea                      | Sí   |
| DELETE | `/api/tasks/:id`     | Borra una tarea                      | Sí   |
| GET    | `/api/health`        | Health check                         | No   |

## Tests

```bash
cd api
docker compose up -d db      # (desde la raíz) Postgres para los e2e
npm run db:test:migrate      # prepara la base de test
npm test                     # unitarios + e2e
```

- `npm run test:unit` → solo unitarios.
- `npm run test:e2e` → solo e2e.
- `npm run test:watch` → modo watch.

## Estructura

```
api/
  prisma/
    schema.prisma      # modelos User y Task
    migrations/        # migraciones versionadas
  src/
    config/            # env y cliente de Prisma
    modules/
      auth/            # registro, login, perfil
      tasks/           # CRUD con ownership y roles
    middlewares/       # authenticate, errorHandler
    utils/             # jwt, hash, AppError, asyncHandler
    app.ts             # arma la app de Express
    server.ts          # levanta el servidor
  test/                # helpers y tests e2e
  Dockerfile
docker-compose.yml     # API + PostgreSQL
```

## Roadmap

Habria que sumar mas adelante: refresh tokens, paginación y filtros en el listado,
documentación OpenAPI/Swagger y un frontend que consuma la API.
