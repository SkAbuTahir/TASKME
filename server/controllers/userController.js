import asyncHandler from "express-async-handler";
import { createUser, findUserByEmail, findUserById, getAllUsers, updateUser, matchPassword } from "../models/userModel.js";
import createJWT from "../utils/index.js";
import { prisma } from "../utils/connectDB.js";

// POST request - login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid email or password." });
  }

  if (!user?.isActive) {
    return res.status(401).json({
      status: false,
      message: "User account has been deactivated, contact the administrator",
    });
  }

  const isMatch = await matchPassword(password, user.password);

  if (user && isMatch) {
    createJWT(res, user.id);

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Invalid email or password" });
  }
});

// POST - Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password, isAdmin, role, title } = req.body;

  // Generate username from email if not provided
  const finalUsername = username || email.split('@')[0];

  // Check if user exists by email or username
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username: finalUsername.toLowerCase() }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(400).json({ 
        status: false, 
        message: "Email address already exists" 
      });
    } else {
      return res.status(400).json({ 
        status: false, 
        message: "Username is already taken" 
      });
    }
  }

  // Create new user
  const user = await createUser({
    username: finalUsername.toLowerCase(),
    name,
    email: email.toLowerCase(),
    password,
    isAdmin: isAdmin || false,
    role: role || 'user',
    title: title || 'Member',
  });

  if (user) {
    isAdmin ? createJWT(res, user.id) : null;

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } else {
    return res
      .status(400)
      .json({ status: false, message: "Invalid user data" });
  }
});

// POST -  Logout user / clear cookie
const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const getTeamList = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let where = { isActive: true };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { role: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      title: true,
      role: true,
      email: true,
      isActive: true
    }
  });
  
  console.log('Found users:', users.length);
  res.status(200).json(users);
});

// @GET  - get user notifications
const getNotificationsList = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  // TODO: Implement notifications with Prisma
  res.status(200).json([]);
});

// @GET  - get user task status
const getUserTaskStatus = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          stage: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(users);
});

// @GET  - get user notifications
const markNotificationRead = asyncHandler(async (req, res) => {
  try {
    // TODO: Implement with Prisma
    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.log(error);
  }
});

// PUT - Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { _id } = req.body;

  const id =
    isAdmin && userId === _id
      ? userId
      : isAdmin && userId !== _id
      ? _id
      : userId;

  const user = await findUserById(id);

  if (user) {
    const updatedUser = await updateUser(id, {
      name: req.body.name || user.name,
      title: req.body.title || user.title,
      role: req.body.role || user.role,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(201).json({
      status: true,
      message: "Profile Updated Successfully.",
      user: userWithoutPassword,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

// PUT - active/disactivate user profile
const activateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await findUserById(id);

  if (user) {
    const updatedUser = await updateUser(id, {
      isActive: req.body.isActive
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(201).json({
      status: true,
      message: `User account has been ${
        updatedUser?.isActive ? "activated" : "disabled"
      }`,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const user = await findUserById(userId);

  if (user) {
    await updateUser(userId, {
      password: req.body.password
    });

    res.status(201).json({
      status: true,
      message: `Password changed successfully.`,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

// DELETE - delete user account
const deleteUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id }
  });

  res.status(200).json({ status: true, message: "User deleted successfully" });
});

export {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  getUserTaskStatus,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
};
