import asyncHandler from "express-async-handler";
import prisma from "../utils/prisma.js";

// GET - Get all users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
      role: true,
      isActive: true,
    },
    where: {
      isActive: true,
    },
  });

  res.status(200).json(users);
});

// GET - Get all tasks with user details
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Transform the data to match the frontend format
  const transformedTasks = tasks.map(task => ({
    id: task.id,
    name: task.title,
    assignedTo: task.assignedTo.name,
    category: task.category || 'General',
    priority: task.priority,
    createdOn: task.createdAt.toISOString().slice(0, 16).replace('T', ' '),
    dueDate: task.dueDate.toISOString().slice(0, 16).replace('T', ' '),
    createdBy: task.createdBy.name,
    status: task.stage === 'TODO' ? 'Pending' : 
            task.stage === 'IN_PROGRESS' ? 'Ongoing' : 
            task.stage === 'COMPLETED' ? 'Done' : 'Pending',
    isOverdue: task.dueDate < new Date() && task.stage !== 'COMPLETED',
    isGroup: task.isGroup,
    hasIssues: task.hasIssues,
    isTrashed: task.isTrashed,
  }));

  res.status(200).json(transformedTasks);
});

// POST - Create new task (only allows assignment to existing users)
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, stage, dueDate, category, assignedToId, createdById } = req.body;

  // Verify both users exist
  const [assignedUser, createdByUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: assignedToId } }),
    prisma.user.findUnique({ where: { id: createdById } })
  ]);

  if (!assignedUser) {
    return res.status(400).json({ message: 'Assigned user does not exist' });
  }

  if (!createdByUser) {
    return res.status(400).json({ message: 'Creator user does not exist' });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      stage: stage || 'TODO',
      dueDate: new Date(dueDate),
      category,
      assignedToId,
      createdById,
    },
    include: {
      assignedTo: { select: { name: true } },
      createdBy: { select: { name: true } }
    }
  });

  res.status(201).json({ message: 'Task created successfully', task });
});