import express from "express";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users/users";
import channelsRouter from "./routes/channels";

const apiRouter = express.Router();
/* Mount Auth Router */
apiRouter.use("/auth", authRouter);
/* Mount Users Router */
apiRouter.use("/users", usersRouter);
/* Mount Channels Router */
apiRouter.use("/channels", channelsRouter);

export default apiRouter;
