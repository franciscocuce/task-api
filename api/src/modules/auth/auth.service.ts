import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { comparePassword, hashPassword } from '../../utils/hash';
import { signAccessToken } from '../../utils/jwt';
import { LoginInput, RegisterInput } from './auth.dto';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'El email ya está registrado');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: await hashPassword(input.password),
    },
  });

  return buildAuthResponse(user.id, user.email, user.role);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await comparePassword(input.password, user.password))) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  return buildAuthResponse(user.id, user.email, user.role);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  return user;
}

function buildAuthResponse(id: string, email: string, role: Role) {
  const accessToken = signAccessToken({ sub: id, role });
  return { accessToken, user: { id, email, role } };
}
