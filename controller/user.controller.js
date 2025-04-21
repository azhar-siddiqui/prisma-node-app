import prisma from "../db/db.config.js";
import { userSchema } from "../schema/userSchema.js";
import { asyncHandler } from "../utils/helper.js";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseUtils.js";

export const getAllUsers = asyncHandler(async (req, resp) => {
  // Fetch all users from the database
  const users = await prisma.user.findMany();
  // Return success response
  return sendSuccessResponse(resp, 200, "Users retrieved successfully", users);
});

export const getUserById = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  // Fetch the user from the database
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  // If user does not exist, return error
  if (!user) {
    return sendErrorResponse(resp, 404, "User not found");
  }

  // Return the user data
  return sendSuccessResponse(resp, 200, "Users retrieved successfully", {
    data: user,
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
  });
  // Return success response
  return sendSuccessResponse(resp, 201, "User created successfully", newUser);
});

export const updateUser = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  // Validate the request body using the same Joi schema
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

  // Check if the user exists in the database
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  // If the user does not exist, throw an error
  if (!existingUser) {
    return sendErrorResponse(resp, 404, "User not found");
  }

  // Check if the incoming data is the same as existing data
  if (
    name === existingUser.name &&
    email === existingUser.email &&
    password === existingUser.password
  ) {
    return sendErrorResponse(
      resp,
      400,
      "No changes detected. Please update at least one field."
    );
  }

  // Check if the email is being updated to an already existing email
  if (email !== existingUser.email) {
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

  // If the user exists, update the user
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      password,
      updated_at: new Date(), // Update the `updated_at` field
    },
  });

  // Return success response
  return sendSuccessResponse(
    resp,
    200,
    "User updated successfully",
    updatedUser
  );
});

export const deleteUser = asyncHandler(async (req, resp) => {
  const { id } = req.params;

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
  const validUserIds = ids.filter(
    (id) => typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id)
  );

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
