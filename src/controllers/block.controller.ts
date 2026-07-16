import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Block from '../models/Block';
import User from '../models/User';

import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

// POST /api/blocks
export const blockUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const blockerId = req.userId!;
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(String(userId))) {
            throw new AppError('Invalid user id.', 400, 'INVALID_ID');
        }

        if (blockerId === userId) {
            throw new AppError(
                'You cannot block yourself.',
                400,
                'INVALID_OPERATION'
            );
        }

        const userExists = await User.findById(userId);

        if (!userExists) {
            throw new AppError(
                'User not found.',
                404,
                'USER_NOT_FOUND'
            );
        }

        const alreadyBlocked = await Block.findOne({
            blockerId,
            blockedId: userId,
        });

        if (alreadyBlocked) {
            throw new AppError(
                'You have already blocked this user.',
                409,
                'ALREADY_BLOCKED'
            );
        }

        const block = await Block.create({
            blockerId,
            blockedId: userId,
        });

        sendSuccess(res, block, 201);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/blocks/:userId
export const unblockUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const blockerId = req.userId!;
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(String(userId))) {
            throw new AppError('Invalid user id.', 400, 'INVALID_ID');
        }

        const block = await Block.findOneAndDelete({
            blockerId,
            blockedId: userId,
        });

        if (!block) {
            throw new AppError(
                'No block record exists for this user.',
                404,
                'BLOCK_NOT_FOUND'
            );
        }

        sendSuccess(res, {
            message: 'User unblocked successfully.',
        });
    } catch (err) {
        next(err);
    }
};