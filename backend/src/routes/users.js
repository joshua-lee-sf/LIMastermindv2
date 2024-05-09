import { Router } from "express";
import { createNewUser, loginUserRoute, getCurrentUser, updateUserScore, restoreUserController } from "../controllers/users.js";
import { restoreUser } from "../../config.js";

const userRouter = Router();

userRouter.get('/getcurrentuser', getCurrentUser);
userRouter.get('/restoreuser', restoreUser, restoreUserController)
userRouter.post('/login', loginUserRoute);
userRouter.post('/register', createNewUser);
userRouter.post('/updateuserscore', updateUserScore);

export default userRouter;