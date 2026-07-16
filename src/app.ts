import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import listingRoutes from './routes/listing.routes';
import matchRoutes from './routes/match.routes';
import messageRoutes from './routes/message.routes';
import exchangeRoutes from './routes/exchange.routes';
import reviewRoutes from './routes/review.routes';
import blockRoutes from './routes/block.routes';
import reportRoutes from './routes/report.routes';
import errorHandler from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';

const app = express();

// Trust the reverse proxy (Render) to correctly parse client IPs for rate limiting
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blocks',blockRoutes);
app.use('/api/reports',reportRoutes)

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