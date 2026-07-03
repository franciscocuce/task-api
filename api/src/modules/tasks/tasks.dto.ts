import { TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().nullable(),
    status: z.nativeEnum(TaskStatus),
  })
  .partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
