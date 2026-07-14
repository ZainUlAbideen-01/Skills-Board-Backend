import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: { code: err.code, message: err.message },
        });
        return;
    }

    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong. Please try again later.',
        },
    });
};

export default errorHandler;