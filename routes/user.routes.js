import { Router } from "express";
import {
  createUser,
  deleteMultipleUsers,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controller/user.controller.js";
import { methodChecker } from "../utils/methodCheckerUtils.js";

const userRoutes = Router();

userRoutes
  .route("/")
  .get(methodChecker(["GET"]), getAllUsers)
  .post(methodChecker(["POST"]), createUser)
  .delete(methodChecker(["DELETE"]), deleteMultipleUsers);

userRoutes
  .route("/:id")
  .get(methodChecker(["GET"]), getUserById)
  .patch(methodChecker(["PATCH"]), updateUser)
  .delete(methodChecker(["DELETE"]), deleteUser);

export default userRoutes;
