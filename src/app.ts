import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/match.routes';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { message: 'Server is running.' } });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;