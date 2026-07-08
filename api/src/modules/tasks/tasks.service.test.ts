import { Role, TaskStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { createTask, deleteTask, getTask, listTasks, updateTask } from './tasks.service';

vi.mock('../../config/prisma', () => ({
  prisma: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const create = vi.mocked(prisma.task.create);
const findMany = vi.mocked(prisma.task.findMany);
const findUnique = vi.mocked(prisma.task.findUnique);
const update = vi.mocked(prisma.task.update);
const remove = vi.mocked(prisma.task.delete);

const user = { id: 'user-1', role: Role.USER };
const admin = { id: 'admin-1', role: Role.ADMIN };
const ownTask = { id: 'task-1', title: 'Mía', userId: user.id, status: TaskStatus.TODO };
const otherTask = { id: 'task-2', title: 'Ajena', userId: 'user-2', status: TaskStatus.TODO };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createTask', () => {
  it('crea la tarea colgada del usuario que la pide', async () => {
    create.mockResolvedValue(ownTask as never);

    await createTask(user.id, { title: 'Mía' });

    expect(create).toHaveBeenCalledWith({ data: { title: 'Mía', userId: user.id } });
  });
});

describe('listTasks', () => {
  it('un USER solo ve sus propias tareas', async () => {
    findMany.mockResolvedValue([] as never);

    await listTasks(user);

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('un ADMIN ve todas las tareas', async () => {
    findMany.mockResolvedValue([] as never);

    await listTasks(admin);

    expect(findMany).toHaveBeenCalledWith({ where: {}, orderBy: { createdAt: 'desc' } });
  });
});

describe('ownership (getTask)', () => {
  it('tira 404 (AppError) si la tarea no existe', async () => {
    findUnique.mockResolvedValue(null);

    await expect(getTask(user, 'no-existe')).rejects.toBeInstanceOf(AppError);
    await expect(getTask(user, 'no-existe')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('tira 403 si la tarea es de otro usuario', async () => {
    findUnique.mockResolvedValue(otherTask as never);

    await expect(getTask(user, otherTask.id)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('devuelve la tarea si es del propio usuario', async () => {
    findUnique.mockResolvedValue(ownTask as never);

    await expect(getTask(user, ownTask.id)).resolves.toEqual(ownTask);
  });

  it('un ADMIN accede a una tarea ajena', async () => {
    findUnique.mockResolvedValue(otherTask as never);

    await expect(getTask(admin, otherTask.id)).resolves.toEqual(otherTask);
  });
});

describe('updateTask', () => {
  it('actualiza cuando el usuario es dueño', async () => {
    findUnique.mockResolvedValue(ownTask as never);
    update.mockResolvedValue({ ...ownTask, status: TaskStatus.DONE } as never);

    await updateTask(user, ownTask.id, { status: TaskStatus.DONE });

    expect(update).toHaveBeenCalledWith({
      where: { id: ownTask.id },
      data: { status: TaskStatus.DONE },
    });
  });

  it('no actualiza si la tarea es ajena (403)', async () => {
    findUnique.mockResolvedValue(otherTask as never);

    await expect(updateTask(user, otherTask.id, { title: 'hack' })).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(update).not.toHaveBeenCalled();
  });
});

describe('deleteTask', () => {
  it('borra cuando el usuario es dueño', async () => {
    findUnique.mockResolvedValue(ownTask as never);
    remove.mockResolvedValue(ownTask as never);

    await deleteTask(user, ownTask.id);

    expect(remove).toHaveBeenCalledWith({ where: { id: ownTask.id } });
  });

  it('no borra si la tarea no existe (404)', async () => {
    findUnique.mockResolvedValue(null);

    await expect(deleteTask(user, 'no-existe')).rejects.toMatchObject({ statusCode: 404 });
    expect(remove).not.toHaveBeenCalled();
  });
});
