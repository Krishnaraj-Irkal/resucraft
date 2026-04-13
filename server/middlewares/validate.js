import { z } from 'zod';

// ── Reusable schemas ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
    email: z.string().trim().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[0-9!@#$%^&*]/, 'Password must contain at least one number or special character'),
});

export const loginSchema = z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const createResumeSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
});

export const aiEnhanceSchema = z.object({
    userContent: z.string().trim().min(1, 'Content is required').max(5000, 'Content must be under 5000 characters'),
});

export const uploadResumeSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
    resumeText: z.string().trim().min(1, 'Resume text is required').max(20000, 'Resume text is too large'),
});

// ── Middleware factory ────────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds 400 with the first validation error message.
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.errors[0].message;
        return res.status(400).json({ message });
    }
    req.body = result.data; // use the sanitized + coerced values
    next();
};
