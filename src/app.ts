import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import matchRoutes from './routes/match.routes';
import messageRoutes from './routes/message.routes';

import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Server is running.',
        },
    });
});

// Global Error Handler
app.use(errorHandler);

export default app;