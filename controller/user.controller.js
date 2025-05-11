import prisma from "../db/db.config.js";
import { updateUserSchema, userSchema } from "../schema/userSchema.js";
import { asyncHandler, isValidUUID } from "../utils/helper.js";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseUtils.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The user's UUID
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The user's creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The user's last update timestamp
 *       required:
 *         - id
 *         - email
 *         - created_at
 *         - updated_at
 *     CreateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *       required:
 *         - email
 *         - password
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *     DeleteMultipleUsersInput:
 *       type: object
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of user UUIDs to delete
 *       required:
 *         - ids
 */

export const getAllUsers = asyncHandler(async (req, resp) => {
  // Fetch all users from the database
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
    },
  });
  // Return success response
  return sendSuccessResponse(resp, 200, "Users retrieved successfully", users);
});

export const getUserById = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  // Fetch the user from the database
  if (!id || !isValidUUID(id)) {
    return sendErrorResponse(resp, 400, "Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
    },
  });

  // If user does not exist, return error
  if (!user) {
    return sendErrorResponse(resp, 404, "User not found");
  }

  // Return the user data
  return sendSuccessResponse(resp, 200, "Users retrieved successfully", {
    user,
  });
});

export const createUser = asyncHandler(async (req, resp) => {
  const { name, email, password } = req.body;

  // Check if all fields are empty
  if (!name && !email && !password) {
    return sendErrorResponse(
      resp,
      400,
      "All fields are required. Please provide name, email, and password."
    );
  }

  // Validate the request body using Joi
  const { error } = userSchema.validate(
    { name, email, password },
    { abortEarly: false }
  );

  // If validation fails, return the error messages
  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return sendErrorResponse(resp, 400, errorMessages);
  }

  // Check if the email already exists
  const isEmailExisted = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isEmailExisted) {
    return sendErrorResponse(
      resp,
      400,
      "Email already exists. Please use a different email."
    );
  }

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
    },
  });
  // Return success response
  return sendSuccessResponse(resp, 201, "User created successfully", newUser);
});

export const updateUser = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!id || !isValidUUID(id)) {
    return sendErrorResponse(resp, 400, "Invalid user ID");
  }

  // Validate the request body
  const { error } = updateUserSchema.validate(
    { name, email, password },
    { abortEarly: false }
  );

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return sendErrorResponse(resp, 400, errorMessages);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) {
    return sendErrorResponse(resp, 404, "User not found");
  }

  // Check if at least one field is provided
  if (name === undefined && email === undefined && password === undefined) {
    return sendErrorResponse(
      resp,
      400,
      "No changes detected. Please provide at least one field to update."
    );
  }

  // Check if all provided fields match existing data
  const noChanges =
    (name === undefined || name === existingUser.name) &&
    (email === undefined || email === existingUser.email) &&
    (password === undefined || password === existingUser.password);

  if (noChanges) {
    return sendErrorResponse(
      resp,
      400,
      "No changes detected. Please provide different values."
    );
  }

  // Check if the email is being updated to an already existing email
  if (email !== undefined && email !== existingUser.email) {
    const isEmailExisted = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailExisted) {
      return sendErrorResponse(
        resp,
        400,
        "Email already exists. Please use a different email."
      );
    }
  }

  // Build the data object with only provided fields
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (password !== undefined) updateData.password = password;
  updateData.updated_at = new Date();

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
    },
  });

  return sendSuccessResponse(resp, 200, "User updated successfully", {
    data: updatedUser,
  });
});

export const deleteUser = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  if (!id || !isValidUUID(id)) {
    return sendErrorResponse(resp, 400, "Invalid user ID");
  }

  // Check if the user exists
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) {
    return sendErrorResponse(resp, 404, "User not found");
  }

  // Delete the user
  await prisma.user.delete({
    where: {
      id,
    },
  });

  return sendErrorResponse(resp, 200, "User deleted successfully");
});

export const deleteMultipleUsers = asyncHandler(async (req, resp) => {
  const { ids } = req.body; // Expecting an array of user IDs

  // Validate the request body
  if (!Array.isArray(ids) || ids.length === 0) {
    return sendErrorResponse(
      resp,
      400,
      "Invalid request. Provide an array of user IDs."
    );
  }

  // Validate UUID format (standard length: 36 characters)
  const validUserIds = ids.filter((id) => isValidUUID(id));

  if (validUserIds.length !== ids.length) {
    return sendErrorResponse(resp, 400, "Invalid user IDs");
  }

  // Check if all users exist before deleting
  const existingUsers = await prisma.user.findMany({
    where: {
      id: { in: validUserIds },
    },
  });

  if (existingUsers.length === 0) {
    return sendErrorResponse(resp, 404, "No matching users found.");
  }

  // Delete users
  await prisma.user.deleteMany({
    where: {
      id: { in: validUserIds },
    },
  });

  return sendSuccessResponse(resp, 200, "Users deleted successfully");
});
