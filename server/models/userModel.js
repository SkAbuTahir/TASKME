import bcrypt from "bcryptjs";
import { prisma } from "../utils/connectDB.js";

// User utility functions
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// User model functions
export const createUser = async (userData) => {
  const hashedPassword = await hashPassword(userData.password);
  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });
};

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      tasks: true,
    },
  });
};

export const updateUser = async (id, userData) => {
  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }
  return await prisma.user.update({
    where: { id },
    data: userData,
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      username: true,
      name: true,
      title: true,
      role: true,
      email: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
