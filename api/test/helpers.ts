import { Role } from '@prisma/client';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/hash';
import { signAccessToken } from '../src/utils/jwt';

// borrar users se lleva puestas sus tasks (onDelete: Cascade)
export async function resetDb(): Promise<void> {
  await prisma.user.deleteMany();
}

let counter = 0;

// devuelvo el token ya firmado para no loguearme en cada test
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
