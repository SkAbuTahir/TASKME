import { prisma } from "../utils/connectDB.js";

// Task model functions
export const createTask = async (taskData) => {
  const { team, activities, subTasks, ...taskInfo } = taskData;
  
  return await prisma.task.create({
    data: {
      ...taskInfo,
      priority: taskInfo.priority?.toUpperCase() || 'NORMAL',
      stage: taskInfo.stage?.toUpperCase().replace(' ', '_') || 'TODO',
      team: team ? {
        connect: team.map(userId => ({ id: userId }))
      } : undefined,
      activities: activities ? {
        create: activities.map(activity => ({
          type: activity.type?.toUpperCase() || 'ASSIGNED',
          activity: activity.activity,
          date: activity.date || new Date(),
          userId: activity.by
        }))
      } : undefined,
      subTasks: subTasks ? {
        create: subTasks
      } : undefined
    },
    include: {
      team: true,
      activities: {
        include: {
          user: true
        }
      },
      subTasks: true
    }
  });
};

export const findTaskById = async (id) => {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      team: true,
      activities: {
        include: {
          user: true
        },
        orderBy: {
          date: 'desc'
        }
      },
      subTasks: true
    }
  });
};

export const getAllTasks = async (filters = {}) => {
  const where = {
    isTrashed: false,
    ...filters
  };
  
  return await prisma.task.findMany({
    where,
    include: {
      team: true,
      activities: {
        include: {
          user: true
        }
      },
      subTasks: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const updateTask = async (id, taskData) => {
  const { team, activities, subTasks, ...taskInfo } = taskData;
  
  return await prisma.task.update({
    where: { id },
    data: {
      ...taskInfo,
      priority: taskInfo.priority?.toUpperCase(),
      stage: taskInfo.stage?.toUpperCase().replace(' ', '_'),
    },
    include: {
      team: true,
      activities: {
        include: {
          user: true
        }
      },
      subTasks: true
    }
  });
};

export const deleteTask = async (id) => {
  return await prisma.task.update({
    where: { id },
    data: { isTrashed: true }
  });
};

export const addTaskActivity = async (taskId, activityData) => {
  return await prisma.activity.create({
    data: {
      taskId,
      type: activityData.type?.toUpperCase() || 'ASSIGNED',
      activity: activityData.activity,
      date: activityData.date || new Date(),
      userId: activityData.by
    },
    include: {
      user: true
    }
  });
};
