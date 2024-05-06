import { Router } from "express";
import { createNewUser, loginUserRoute, getCurrentUser, updateUserScore } from "../controllers/users.js";


const userRouter = Router();

userRouter.get('/getcurrentuser', getCurrentUser);
userRouter.post('/login', loginUserRoute);
userRouter.post('/register', createNewUser);
userRouter.post('/updateuserscore', updateUserScore);

export default userRouter;