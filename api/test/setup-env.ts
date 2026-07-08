import { config } from 'dotenv';

// tiene que correr antes que env.ts; override pisa lo que haya en .env
config({ path: '.env.test', override: true });
