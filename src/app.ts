import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { message: 'Server is running.' } });
});

app.use(errorHandler);

export default app;