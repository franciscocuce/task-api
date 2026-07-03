import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AuthUser } from '../../middlewares/authenticate';
import { AppError } from '../../utils/AppError';
import { CreateTaskInput, UpdateTaskInput } from './tasks.dto';

export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({ data: { ...input, userId } });
}

export async function listTasks(user: AuthUser) {
  const where = user.role === Role.ADMIN ? {} : { userId: user.id };
  return prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getTask(user: AuthUser, id: string) {
  return findOwnedTask(user, id);
}

export async function updateTask(user: AuthUser, id: string, input: UpdateTaskInput) {
  await findOwnedTask(user, id);
  return prisma.task.update({ where: { id }, data: input });
}

export async function deleteTask(user: AuthUser, id: string) {
  await findOwnedTask(user, id);
  await prisma.task.delete({ where: { id } });
}

async function findOwnedTask(user: AuthUser, id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new AppError(404, 'Tarea no encontrada');
  }
  if (user.role !== Role.ADMIN && task.userId !== user.id) {
    throw new AppError(403, 'No tenés permiso sobre esta tarea');
  }
  return task;
}
