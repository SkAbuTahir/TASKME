import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taskme.com' },
    update: {},
    create: {
      username: 'admin',
      name: 'Admin User',
      title: 'Administrator',
      role: 'admin',
      email: 'admin@taskme.com',
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
    },
  });

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@taskme.com' },
    update: {},
    create: {
      username: 'john_doe',
      name: 'John Doe',
      title: 'Developer',
      role: 'user',
      email: 'john@taskme.com',
      password: hashedPassword,
      isAdmin: false,
      isActive: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@taskme.com' },
    update: {},
    create: {
      username: 'jane_smith',
      name: 'Jane Smith',
      title: 'Designer',
      role: 'user',
      email: 'jane@taskme.com',
      password: hashedPassword,
      isAdmin: false,
      isActive: true,
    },
  });

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Project Database',
      description: 'Migrate from MongoDB to PostgreSQL',
      priority: 'HIGH',
      stage: 'IN_PROGRESS',
      date: new Date(),
      assets: [],
      links: [],
      team: {
        connect: [{ id: adminUser.id }, { id: user1.id }]
      },
      activities: {
        create: [
          {
            type: 'ASSIGNED',
            activity: 'Task has been assigned to the team',
            userId: adminUser.id,
          }
        ]
      },
      subTasks: {
        create: [
          {
            title: 'Update database schema',
            isCompleted: false,
          },
          {
            title: 'Migrate existing data',
            isCompleted: false,
          }
        ]
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design User Interface',
      description: 'Create modern UI components for the task manager',
      priority: 'MEDIUM',
      stage: 'TODO',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assets: [],
      links: [],
      team: {
        connect: [{ id: user2.id }]
      },
      activities: {
        create: [
          {
            type: 'ASSIGNED',
            activity: 'UI design task assigned',
            userId: adminUser.id,
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully!');
  console.log('Created users:', { adminUser, user1, user2 });
  console.log('Created tasks:', { task1, task2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });