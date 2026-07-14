import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { initSocket } from './config/socket';
import env from './config/env';

const start = async () => {
  await connectDB();
  await connectRedis();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();