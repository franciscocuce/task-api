import { Role } from '@prisma/client';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/hash';
import { signAccessToken } from '../src/utils/jwt';

// Deja la base limpia entre tests. Borrar usuarios arrastra sus tareas por el
// onDelete: Cascade del schema.
export async function resetDb(): Promise<void> {
  await prisma.user.deleteMany();
}

let counter = 0;

// Crea un usuario real en la base de test y devuelve un token válido para él,
// así los tests pueden pegarle a las rutas protegidas sin pasar por el login.
export async function createUser(
  overrides: { email?: string; role?: Role; password?: string } = {},
) {
  counter += 1;
  const email = overrides.email ?? `user${counter}@task.dev`;
  const password = overrides.password ?? 'password123';

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      role: overrides.role ?? Role.USER,
    },
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user, token, password };
}
