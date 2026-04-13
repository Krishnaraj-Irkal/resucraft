import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume } from '../controllers/resumeController.js';
import upload from '../config/multer.js';
import { validate, createResumeSchema } from '../middlewares/validate.js';

const resumeRouter = express.Router();
resumeRouter.post('/create', protect, validate(createResumeSchema), createResume);
resumeRouter.put('/update', protect, upload.single('image'), updateResume);
resumeRouter.delete('/delete/:resumeId', protect, deleteResume);
resumeRouter.get('/get/:resumeId', protect, getResumeById);
resumeRouter.get('/public/:resumeId', getPublicResumeById);

export default resumeRouter;