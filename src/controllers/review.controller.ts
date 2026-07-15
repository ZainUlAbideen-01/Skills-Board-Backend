import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Exchange from '../models/Exchange';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

// POST /api/reviews
export const createReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const reviewerId = new mongoose.Types.ObjectId(req.userId);
        const { exchangeId, revieweeId, rating, comment } = req.body;

        if (!exchangeId || !revieweeId || rating === undefined) {
            throw new AppError(
                'exchangeId, revieweeId, and rating are required.',
                422,
                'VALIDATION_ERROR'
            );
        }

        if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
            throw new AppError('Invalid exchangeId.', 400, 'INVALID_ID');
        }

        if (!mongoose.Types.ObjectId.isValid(revieweeId)) {
            throw new AppError('Invalid revieweeId.', 400, 'INVALID_ID');
        }

        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            throw new AppError(
                'rating must be an integer between 1 and 5.',
                422,
                'VALIDATION_ERROR'
            );
        }

        if (comment && comment.length > 500) {
            throw new AppError(
                'comment must be 500 characters or fewer.',
                422,
                'VALIDATION_ERROR'
            );
        }

        const exchangeObjId = new mongoose.Types.ObjectId(exchangeId);
        const revieweeObjId = new mongoose.Types.ObjectId(revieweeId);

        if (reviewerId.equals(revieweeObjId)) {
            throw new AppError(
                'You cannot review yourself.',
                400,
                'INVALID_REQUEST'
            );
        }

        const exchange = await Exchange.findOne({
            _id: exchangeObjId,
            participants: reviewerId,
        });

        if (!exchange) {
            throw new AppError(
                'No exchange exists with this id, or you were not a participant.',
                404,
                'EXCHANGE_NOT_FOUND'
            );
        }

        const revieweeIsParticipant = exchange.participants.some((p) =>
            p.equals(revieweeObjId)
        );

        if (!revieweeIsParticipant) {
            throw new AppError(
                'revieweeId is not a participant in this exchange.',
                400,
                'INVALID_REQUEST'
            );
        }

        const reviewee = await User.findById(revieweeObjId);
        if (!reviewee) {
            throw new AppError(
                'No user exists with this id.',
                404,
                'USER_NOT_FOUND'
            );
        }

        const existing = await Review.findOne({
            exchangeId: exchangeObjId,
            reviewerId,
        });

        if (existing) {
            throw new AppError(
                'You have already reviewed this exchange.',
                409,
                'REVIEW_ALREADY_EXISTS'
            );
        }

        const review = await Review.create({
            exchangeId: exchangeObjId,
            reviewerId,
            revieweeId: revieweeObjId,
            rating: ratingNum,
            comment,
        });

        sendSuccess(
            res,
            {
                _id: review._id,
                exchangeId: review.exchangeId,
                reviewerId: review.reviewerId,
                revieweeId: review.revieweeId,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
            },
            201
        );
    } catch (err) {
        next(err);
    }
};

// GET /api/reviews/:userId
export const getReviewsForUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {

        const userId = req.params.userId as string;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid userId.', 400, 'INVALID_ID');
        }

        const userObjId = new mongoose.Types.ObjectId(userId);

        const user = await User.findById(userObjId);
        if (!user) {
            throw new AppError(
                'No user exists with this id.',
                404,
                'USER_NOT_FOUND'
            );
        }

        const reviews = await Review.find({ revieweeId: userObjId })
            .populate('reviewerId', 'name username photoUrl')
            .sort({ createdAt: -1 })
            .lean();

        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? Math.round(
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
                    10
                ) / 10
                : 0;

        sendSuccess(res, {
            averageRating,
            totalReviews,
            reviews,
        });
    } catch (err) {
        next(err);
    }
};