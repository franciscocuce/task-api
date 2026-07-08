import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { createUser, resetDb } from './helpers';

const app = createApp();

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registra un usuario y devuelve token + datos (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nuevo@task.dev', password: 'password123' })
      .expect(201);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'nuevo@task.dev', role: 'USER' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('rechaza email duplicado (409)', async () => {
    await createUser({ email: 'repetido@task.dev' });

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'repetido@task.dev', password: 'password123' })
      .expect(409);
  });

  it('rechaza datos inválidos (400)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-es-email', password: '123' })
      .expect(400);
  });
});

describe('POST /api/auth/login', () => {
  it('loguea con credenciales correctas (200)', async () => {
    const { user, password } = await createUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('rechaza credenciales inválidas (401)', async () => {
    const { user } = await createUser();

    await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'incorrecta' })
      .expect(401);
  });
});

describe('GET /api/auth/me', () => {
  it('rechaza sin token (401)', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });

  it('devuelve el perfil del token (200)', async () => {
    const { token, user } = await createUser();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: user.id, email: user.email, role: user.role });
  });
});
