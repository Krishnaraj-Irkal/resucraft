import express from 'express';
import rateLimit from 'express-rate-limit';
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume } from '../controllers/aiController.js';
import protect from '../middlewares/authMiddleware.js';
import { validate, aiEnhanceSchema, uploadResumeSchema } from '../middlewares/validate.js';

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    keyGenerator: (req) => req.userId,
    handler: (_req, res) => {
        res.status(429).json({
            message: 'Too many AI requests. You can make up to 20 requests per hour.',
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiRouter = express.Router();
aiRouter.post('/enhance-pro-sum', protect, aiLimiter, validate(aiEnhanceSchema), enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', protect, aiLimiter, validate(aiEnhanceSchema), enhanceJobDescription);
aiRouter.post('/upload-resume', protect, aiLimiter, validate(uploadResumeSchema), uploadResume);

export default aiRouter;