import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import * as tasksController from './tasks.controller';

export const tasksRoutes = Router();

tasksRoutes.use(authenticate);

tasksRoutes.post('/', tasksController.create);
tasksRoutes.get('/', tasksController.list);
tasksRoutes.get('/:id', tasksController.getOne);
tasksRoutes.patch('/:id', tasksController.update);
tasksRoutes.delete('/:id', tasksController.remove);
