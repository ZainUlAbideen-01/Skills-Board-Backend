import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { message: 'Server is running.' } });
});

app.use(errorHandler);

export default app;