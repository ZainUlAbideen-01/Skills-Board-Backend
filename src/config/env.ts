import dotenv from 'dotenv';
dotenv.config();

const env = {
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    BREVO_API_KEY: process.env.BREVO_API_KEY || '',
    MAIL_FROM: process.env.MAIL_FROM || 'noreply@skillexchange.com'
};

if (!env.MONGO_URI) throw new Error('MONGO_URI is not defined in .env');
if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not defined in .env');
if (!env.BREVO_API_KEY) console.warn('WARNING: BREVO_API_KEY is not defined in .env');

export default env;