import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { createTaskSchema, updateTaskSchema } from './tasks.dto';
import * as tasksService from './tasks.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = createTaskSchema.parse(req.body);
  const task = await tasksService.createTask(req.user!.id, data);
  res.status(201).json(task);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await tasksService.listTasks(req.user!);
  res.status(200).json(tasks);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.getTask(req.user!, req.params.id);
  res.status(200).json(task);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = updateTaskSchema.parse(req.body);
  const task = await tasksService.updateTask(req.user!, req.params.id, data);
  res.status(200).json(task);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await tasksService.deleteTask(req.user!, req.params.id);
  res.status(204).send();
});
