import asyncHandler from "express-async-handler";
import { createTask as createTaskModel, findTaskById, getAllTasks, updateTask as updateTaskModel, deleteTask, addTaskActivity } from "../models/taskModel.js";
import { findUserById } from "../models/userModel.js";
import { prisma } from "../utils/connectDB.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } = req.body;

    // Alert users of the task
    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text = text + ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(date).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    let newLinks = null;
    if (links) {
      newLinks = links?.split(",");
    }

    const task = await createTaskModel({
      title,
      team,
      stage: stage?.toLowerCase(),
      date: new Date(date),
      priority: priority?.toLowerCase(),
      assets: assets || [],
      activities: [activity],
      links: newLinks || [],
      description,
    });

    // TODO: Create notification system with Prisma

    res.status(200).json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const task = await findTaskById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    // Alert users of the task
    let text = "New task has been assigned to you";
    if (task.team?.length > 1) {
      text = text + ` and ${task.team?.length - 1} others.`;
    }

    text = text + ` The task priority is set a ${task.priority} priority, so check and act accordingly. The task date is ${new Date(task.date).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const newTask = await createTaskModel({
      title: "Duplicate - " + task.title,
      team: task.team.map(user => user.id),
      stage: task.stage,
      date: task.date,
      priority: task.priority,
      assets: task.assets,
      links: task.links,
      description: task.description,
      activities: [activity],
      subTasks: task.subTasks.map(({ id, taskId, ...subTask }) => subTask),
    });

    res.status(200).json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, team, stage, priority, assets, links, description } = req.body;

  try {
    let newLinks = [];
    if (links) {
      newLinks = links.split(",");
    }

    const updatedTask = await updateTaskModel(id, {
      title,
      date: new Date(date),
      priority: priority?.toLowerCase(),
      assets: assets || [],
      stage: stage?.toLowerCase(),
      links: newLinks,
      description,
    });

    // Update team associations
    if (team) {
      await prisma.task.update({
        where: { id },
        data: {
          team: {
            set: team.map(userId => ({ id: userId }))
          }
        }
      });
    }

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    await updateTaskModel(id, {
      stage: stage?.toLowerCase().replace(' ', '_')
    });

    res.status(200).json({ status: true, message: "Task stage changed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    await prisma.subTask.update({
      where: { id: subTaskId },
      data: { isCompleted: status }
    });

    res.status(200).json({
      status: true,
      message: status ? "Task has been marked completed" : "Task has been marked uncompleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  try {
    await prisma.subTask.create({
      data: {
        title,
        date: date ? new Date(date) : null,
        tag,
        isCompleted: false,
        taskId: id
      }
    });

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { stage, isTrashed, search } = req.query;

  console.log('getTasks called with:', { userId, isAdmin, stage, isTrashed, search });

  let where = { isTrashed: isTrashed === 'true' };

  if (!isAdmin) {
    where.team = {
      some: {
        id: userId
      }
    };
  }

  if (stage) {
    where.stage = stage.toUpperCase().replace(' ', '_');
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { stage: { contains: search.toUpperCase().replace(' ', '_'), mode: 'insensitive' } },
      { priority: { contains: search.toUpperCase(), mode: 'insensitive' } },
    ];
  }

  console.log('Query:', where);

  const tasks = await prisma.task.findMany({
    where,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          title: true,
          email: true
        }
      },
      activities: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      },
      subTasks: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('Found tasks:', tasks.length);

  res.status(200).json({
    status: true,
    tasks,
  });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await findTaskById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch task", error);
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;

  try {
    await addTaskActivity(id, {
      type,
      activity,
      by: userId,
    });

    res.status(200).json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await updateTaskModel(id, { isTrashed: true });

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await prisma.task.delete({ where: { id } });
    } else if (actionType === "deleteAll") {
      await prisma.task.deleteMany({ where: { isTrashed: true } });
    } else if (actionType === "restore") {
      await updateTaskModel(id, { isTrashed: false });
    } else if (actionType === "restoreAll") {
      await prisma.task.updateMany(
        { where: { isTrashed: true } },
        { data: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    let taskWhere = { isTrashed: false };
    if (!isAdmin) {
      taskWhere.team = {
        some: {
          id: userId
        }
      };
    }

    const allTasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            role: true,
            title: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const users = isAdmin ? await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    }) : [];

    // Group tasks by stage and calculate counts
    const groupedTasks = allTasks?.reduce((result, task) => {
      const stage = task.stage.toLowerCase().replace('_', ' ');
      result[stage] = (result[stage] || 0) + 1;
      return result;
    }, {});

    const graphData = Object.entries(
      allTasks?.reduce((result, task) => {
        const priority = task.priority.toLowerCase();
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // Calculate total tasks
    const totalTasks = allTasks.length;
    const last10Task = allTasks?.slice(0, 10);

    // Combine results into a summary object
    const summary = {
      totalTasks,
      last10Task,
      users,
      tasks: groupedTasks,
      graphData,
    };

    res.status(200).json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
};
