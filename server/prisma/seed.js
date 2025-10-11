import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create users individually
  const users = [];
  
  const userData = [
    {
      email: 'admin@taskme.com',
      name: 'Admin User',
      username: 'admin',
      title: 'System Administrator',
      role: 'Admin',
      isAdmin: true,
      password: hashedPassword,
    },
    {
      email: 'john.smith@taskme.com',
      name: 'John Smith',
      username: 'johnsmith',
      title: 'Senior Developer',
      role: 'Developer',
      password: hashedPassword,
    },
    {
      email: 'sarah.johnson@taskme.com',
      name: 'Sarah Johnson',
      username: 'sarahjohnson',
      title: 'Project Manager',
      role: 'Manager',
      password: hashedPassword,
    },
    {
      email: 'mike.wilson@taskme.com',
      name: 'Mike Wilson',
      username: 'mikewilson',
      title: 'Kitchen Manager',
      role: 'Kitchen Staff',
      password: hashedPassword,
    },
    {
      email: 'emily.davis@taskme.com',
      name: 'Emily Davis',
      username: 'emilydavis',
      title: 'Database Administrator',
      role: 'Developer',
      password: hashedPassword,
    },
    {
      email: 'david.brown@taskme.com',
      name: 'David Brown',
      username: 'davidbrown',
      title: 'Team Lead',
      role: 'Manager',
      password: hashedPassword,
    },
    {
      email: 'lisa.garcia@taskme.com',
      name: 'Lisa Garcia',
      username: 'lisagarcia',
      title: 'Chef',
      role: 'Kitchen Staff',
      password: hashedPassword,
    },
    {
      email: 'robert.taylor@taskme.com',
      name: 'Robert Taylor',
      username: 'roberttaylor',
      title: 'Security Analyst',
      role: 'Security',
      password: hashedPassword,
    },
  ];

  for (const user of userData) {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existingUser) {
        const createdUser = await prisma.user.create({ data: user });
        users.push(createdUser);
      } else {
        users.push(existingUser);
      }
    } catch (error) {
      console.log(`User ${user.email} might already exist, skipping...`);
    }
  }

  console.log('Seeded users:', users.length);
  console.log('No tasks created - tasks must be assigned to existing users only');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });