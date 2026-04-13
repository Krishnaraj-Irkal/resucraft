import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000

// Database connection
await connectDB();

app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Strip keys starting with $ or containing . from req.body to prevent NoSQL injection
// (express-mongo-sanitize is incompatible with Express 5 — req.query is read-only)
app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
        const sanitize = (obj) => {
            for (const key of Object.keys(obj)) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            }
        };
        sanitize(req.body);
    }
    next();
});

app.get('/', (_req, res) => res.send('Server is Live'))

app.use('/api/users',userRouter)
app.use('/api/resumes',resumeRouter)
app.use('/api/ai',aiRouter)

// Multer error handler — must be defined after routes
app.use((err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum allowed size is 5 MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err.message === 'Only image files (JPEG, PNG, WEBP, GIF) are allowed.') {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

app.listen(PORT, () => {
    console.log(`Server running on PORT - ${PORT}`)
})