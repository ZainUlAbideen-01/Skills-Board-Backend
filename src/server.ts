import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import env from './config/env';

const start = async () => {
    await connectDB();
    await connectRedis();
    app.listen(env.PORT, () => {
        console.log(`Server running on port ${env.PORT}`);
    });
};

start();