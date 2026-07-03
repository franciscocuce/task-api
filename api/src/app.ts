import express, { Application, Request, Response } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';

// Se separa de server.ts para poder importar la app en los tests sin abrir un puerto.
export function createApp(): Application {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);

  app.use(errorHandler);

  return app;
}
