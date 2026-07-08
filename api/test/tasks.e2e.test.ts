import { Role } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { createUser, resetDb } from './helpers';

const app = createApp();

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('acceso', () => {
  it('rechaza sin token (401)', async () => {
    await request(app).get('/api/tasks').expect(401);
  });
});

describe('POST /api/tasks', () => {
  it('crea una tarea colgada del usuario (201)', async () => {
    const { token, user } = await createUser();

    const res = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'Mi primera tarea' })
      .expect(201);

    expect(res.body).toMatchObject({ title: 'Mi primera tarea', status: 'TODO', userId: user.id });
  });

  it('rechaza un body inválido (400)', async () => {
    const { token } = await createUser();

    await request(app).post('/api/tasks').set(auth(token)).send({ title: '' }).expect(400);
  });
});

describe('GET /api/tasks', () => {
  it('un USER solo ve sus propias tareas', async () => {
    const a = await createUser();
    const b = await createUser();
    await request(app).post('/api/tasks').set(auth(a.token)).send({ title: 'De A' });
    await request(app).post('/api/tasks').set(auth(b.token)).send({ title: 'De B' });

    const res = await request(app).get('/api/tasks').set(auth(a.token)).expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('De A');
  });

  it('un ADMIN ve las tareas de todos', async () => {
    const owner = await createUser();
    const admin = await createUser({ role: Role.ADMIN });
    await request(app).post('/api/tasks').set(auth(owner.token)).send({ title: 'De alguien' });

    const res = await request(app).get('/api/tasks').set(auth(admin.token)).expect(200);

    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/tasks/:id', () => {
  it('404 si la tarea no existe', async () => {
    const { token } = await createUser();

    await request(app).get('/api/tasks/no-existe').set(auth(token)).expect(404);
  });

  it('403 al pedir la tarea de otro usuario', async () => {
    const owner = await createUser();
    const intruso = await createUser();
    const created = await request(app)
      .post('/api/tasks')
      .set(auth(owner.token))
      .send({ title: 'Privada' });

    await request(app).get(`/api/tasks/${created.body.id}`).set(auth(intruso.token)).expect(403);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('edita el status de una tarea propia (200)', async () => {
    const { token } = await createUser();
    const created = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'Pendiente' });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .set(auth(token))
      .send({ status: 'DONE' })
      .expect(200);

    expect(res.body.status).toBe('DONE');
  });

  it('403 al editar la tarea de otro', async () => {
    const owner = await createUser();
    const intruso = await createUser();
    const created = await request(app)
      .post('/api/tasks')
      .set(auth(owner.token))
      .send({ title: 'Ajena' });

    await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .set(auth(intruso.token))
      .send({ title: 'hackeada' })
      .expect(403);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('borra una tarea propia (204) y deja de existir', async () => {
    const { token } = await createUser();
    const created = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'A borrar' });

    await request(app).delete(`/api/tasks/${created.body.id}`).set(auth(token)).expect(204);
    await request(app).get(`/api/tasks/${created.body.id}`).set(auth(token)).expect(404);
  });
});
