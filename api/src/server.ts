import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`🚀 API escuchando en http://localhost:${env.port}`);
  console.log(`   Health check: http://localhost:${env.port}/api/health`);
});
