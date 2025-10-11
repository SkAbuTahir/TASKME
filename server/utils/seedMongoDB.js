import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        username: 'admin',
        name: 'Admin User',
        title: 'System Administrator',
        role: 'Admin',
        email: 'admin@taskme.com',
        password: hashedPassword,
        isAdmin: true,
      },
      {
        username: 'johnsmith',
        name: 'John Smith',
        title: 'Senior Developer',
        role: 'Developer',
        email: 'john.smith@taskme.com',
        password: hashedPassword,
      },
      {
        username: 'sarahjohnson',
        name: 'Sarah Johnson',
        title: 'Project Manager',
        role: 'Manager',
        email: 'sarah.johnson@taskme.com',
        password: hashedPassword,
      },
      {
        username: 'mikewilson',
        name: 'Mike Wilson',
        title: 'Kitchen Manager',
        role: 'Kitchen Staff',
        email: 'mike.wilson@taskme.com',
        password: hashedPassword,
      },
      {
        username: 'emilydavis',
        name: 'Emily Davis',
        title: 'Database Administrator',
        role: 'Developer',
        email: 'emily.davis@taskme.com',
        password: hashedPassword,
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`Created user: ${userData.name}`);
      } else {
        console.log(`User already exists: ${userData.name}`);
      }
    }

    console.log('MongoDB seeding completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    process.exit(1);
  }
};

seedUsers();