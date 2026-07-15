import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Exchange from '../models/Exchange';
import Match from '../models/Match';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

// POST /api/exchanges
export const createExchange = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const { matchId, otherUserId } = req.body;

        if (!matchId || !otherUserId) {
            throw new AppError(
                'matchId and otherUserId are required.',
                422,
                'VALIDATION_ERROR'
            );
        }

        if (!mongoose.Types.ObjectId.isValid(matchId)) {
            throw new AppError('Invalid matchId.', 400, 'INVALID_ID');
        }

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            throw new AppError('Invalid otherUserId.', 400, 'INVALID_ID');
        }

        const otherUserObjId = new mongoose.Types.ObjectId(otherUserId);
        const matchObjId = new mongoose.Types.ObjectId(matchId);

        const match = await Match.findOne({
            _id: matchObjId,
            $or: [{ userIdA: userId }, { userIdB: userId }],
        });

        if (!match) {
            throw new AppError(
                'No match exists with this id.',
                404,
                'MATCH_NOT_FOUND'
            );
        }

        const isValidParticipant =
            match.userIdA.equals(otherUserObjId) ||
            match.userIdB.equals(otherUserObjId);

        if (!isValidParticipant) {
            throw new AppError(
                'otherUserId is not a participant in this match.',
                400,
                'INVALID_REQUEST'
            );
        }

        const existingExchange = await Exchange.findOne({ matchId: matchObjId });
        if (existingExchange) {
            throw new AppError(
                'An exchange has already been recorded for this match.',
                409,
                'EXCHANGE_ALREADY_EXISTS'
            );
        }

        const exchange = await Exchange.create({
            matchId: matchObjId,
            participants: [userId, otherUserObjId],
            completedAt: new Date(),
        });

        sendSuccess(
            res,
            {
                _id: exchange._id,
                matchId: exchange.matchId,
                participants: exchange.participants,
                completedAt: exchange.completedAt,
            },
            201
        );
    } catch (err) {
        next(err);
    }
};