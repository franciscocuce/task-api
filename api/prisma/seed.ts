import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@task.dev' },
    update: {},
    create: {
      email: 'admin@task.dev',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@task.dev' },
    update: {},
    create: {
      email: 'user@task.dev',
      password: passwordHash,
      role: Role.USER,
    },
  });

  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.task.createMany({
    data: [
      { title: 'Configurar el entorno', status: TaskStatus.DONE, userId: user.id },
      { title: 'Escribir los tests', status: TaskStatus.IN_PROGRESS, userId: user.id },
      { title: 'Preparar el deploy', status: TaskStatus.TODO, userId: user.id },
    ],
  });

  console.log(`Seed listo: admin=${admin.email}, user=${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
