import jwt from 'jsonwebtoken';
import env from '../config/env';

export const signToken = (userId: string): string => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
};

export const verifyToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
};

export const getTokenTTL = (token: string): number => {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded?.exp) return 0;
    return decoded.exp - Math.floor(Date.now() / 1000);
};