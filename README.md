# Task API

API REST de gestión de tareas con **autenticación JWT, roles, testing y Docker**.
Construida con **Express + TypeScript + Prisma + PostgreSQL**, con un front
en **React** para consumirla.

## Stack

| Capa       | Tecnología                          |
| ---------- | ----------------------------------- |
| Backend    | Node.js, Express, TypeScript        |
| ORM / DB   | Prisma, PostgreSQL                  |
| Auth       | JWT (access + refresh), bcrypt      |
| Validación | zod                                 |
| Testing    | Vitest, Supertest                   |
| Docs       | Swagger / OpenAPI                   |
| Frontend   | React, Vite, TypeScript, Tailwind   |
| DevOps     | Docker, docker-compose              |

## Cómo correrlo

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

Verificar que la API está viva:

```bash
curl http://localhost:3000/api/health
# { "status": "ok", "timestamp": "..." }
```

## Estructura

```
api/
  src/
    config/        # configuración de entorno
    modules/       # auth, tasks, users (por venir)
    middlewares/   # auth, roles, manejo de errores (por venir)
    utils/         # jwt, hash, helpers (por venir)
    app.ts         # crea la app Express (exportable para tests)
    server.ts      # levanta el servidor
```
