import dotenv from 'dotenv';
dotenv.config();

const env = {
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    MAIL_HOST: process.env.MAIL_HOST || '',
    MAIL_PORT: parseInt(process.env.MAIL_PORT || '587'),
    MAIL_USER: process.env.MAIL_USER || '',
    MAIL_PASS: process.env.MAIL_PASS || '',
    MAIL_FROM: process.env.MAIL_FROM || ''
    
};

if (!env.MONGO_URI) throw new Error('MONGO_URI is not defined in .env');
if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not defined in .env');
if (!env.MAIL_USER) throw new Error('MAIL_USER is not defined in .env');
if (!env.MAIL_PASS) throw new Error('MAIL_PASS is not defined in .env');

export default env;