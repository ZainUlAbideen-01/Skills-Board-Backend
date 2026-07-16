import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Report from '../models/Report';
import User from '../models/User';
import Listing from '../models/Listing';

import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

// POST /api/reports
export const reportTarget = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.userId) {
            throw new AppError(
                'Invalid or expired token.',
                401,
                'UNAUTHENTICATED'
            );
        }

        const {
            targetType,
            targetId,
            reason,
            details,
        } = req.body;

        // Required fields
        if (!targetType) {
            throw new AppError(
                'targetType is required.',
                422,
                'VALIDATION_ERROR'
            );
        }

        if (!targetId) {
            throw new AppError(
                'targetId is required.',
                422,
                'VALIDATION_ERROR'
            );
        }

        if (!reason) {
            throw new AppError(
                'reason is required.',
                422,
                'VALIDATION_ERROR'
            );
        }

        // Validate target type
        if (!['user', 'listing'].includes(targetType)) {
            throw new AppError(
                'targetType must be either user or listing.',
                422,
                'VALIDATION_ERROR'
            );
        }

        // Validate reason
        if (
            !['spam', 'abuse', 'inappropriate', 'other'].includes(reason)
        ) {
            throw new AppError(
                'reason must be one of: spam, abuse, inappropriate, other.',
                422,
                'VALIDATION_ERROR'
            );
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            throw new AppError(
                'Invalid target id.',
                400,
                'INVALID_ID'
            );
        }

        // Validate details length
        if (details && details.length > 500) {
            throw new AppError(
                'details must be 500 characters or fewer.',
                422,
                'VALIDATION_ERROR'
            );
        }

        // Check target exists
        if (targetType === 'user') {
            const user = await User.findById(targetId);

            if (!user) {
                throw new AppError(
                    'No user exists with this id.',
                    404,
                    'USER_NOT_FOUND'
                );
            }
        } else {
            const listing = await Listing.findById(targetId);

            if (!listing) {
                throw new AppError(
                    'No listing exists with this id.',
                    404,
                    'LISTING_NOT_FOUND'
                );
            }
        }

        const report = await Report.create({
            reporterId: req.userId,
            targetType,
            targetId,
            reason,
            details,
        });

        sendSuccess(
            res,
            {
                _id: report._id,
                reporterId: report.reporterId,
                targetType: report.targetType,
                targetId: report.targetId,
                reason: report.reason,
                details: report.details,
                status: report.status,
                createdAt: report.createdAt,
            },
            201
        );
    } catch (err) {
        next(err);
    }
};


