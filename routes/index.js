import { Router } from "express";
import userRoutes from "./user.routes.js";

const routes = Router();

routes.use("/api/user", userRoutes);

export default routes;
