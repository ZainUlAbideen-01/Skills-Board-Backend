import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

// GET /api/messages/:userId
export const getConversation = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const myId = new mongoose.Types.ObjectId(req.userId);
        const otherId = req.params.userId as string;

        if (!mongoose.Types.ObjectId.isValid(otherId)) {
            throw new AppError('Invalid userId.', 400, 'INVALID_ID');
        }

        const otherObjId = new mongoose.Types.ObjectId(otherId);

        const otherUser = await User.findById(otherObjId);
        if (!otherUser) {
            throw new AppError('No user exists with this id.', 404, 'USER_NOT_FOUND');
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherObjId },
                { senderId: otherObjId, receiverId: myId },
            ],
        })
            .sort({ timestamp: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        sendSuccess(res, { messages, page, limit });
    } catch (err) {
        next(err);
    }
};

// GET /api/messages/conversations
export const getConversations = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const myId = new mongoose.Types.ObjectId(req.userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: myId }, { receiverId: myId }],
                },
            },
            {
                $addFields: {
                    otherUserId: {
                        $cond: {
                            if: { $eq: ['$senderId', myId] },
                            then: '$receiverId',
                            else: '$senderId',
                        },
                    },
                },
            },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: '$otherUserId',
                    lastMessage: { $first: '$content' },
                    lastMessageAt: { $first: '$timestamp' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiverId', myId] },
                                        { $eq: ['$read', false] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { lastMessageAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$userInfo.username',
                    name: '$userInfo.name',
                    photoUrl: '$userInfo.photoUrl',
                    lastMessage: 1,
                    lastMessageAt: 1,
                    unreadCount: 1,
                },
            },
        ]);

        sendSuccess(res, conversations);
    } catch (err) {
        next(err);
    }
};