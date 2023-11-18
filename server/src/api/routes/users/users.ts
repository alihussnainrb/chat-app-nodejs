import express from "express";
import usersMeRouter from "./me";

const usersRouter = express.Router();
usersRouter.use("/me", usersMeRouter);

export default usersRouter;
