import { config } from 'dotenv';

// Corre antes que cualquier módulo de la app: fuerza las variables de .env.test
// (base de datos de test, secretos de test) por encima de las de .env.
config({ path: '.env.test', override: true });
