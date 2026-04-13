import express from 'express';
import { getUserById, getUserResumes, loginUser, registerUser, verifyEmail } from '../controllers/userController.js';
import protect from '../middlewares/authMiddleware.js';
import { validate, registerSchema, loginSchema } from '../middlewares/validate.js';

const userRouter = express.Router();

userRouter.post('/register', validate(registerSchema), registerUser);
userRouter.post('/login', validate(loginSchema), loginUser);
userRouter.get('/verify-email', verifyEmail);
userRouter.get('/data', protect, getUserById);
userRouter.get('/resumes', protect, getUserResumes);

export default userRouter;