import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL Connected successfully');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
export default connectDB;
