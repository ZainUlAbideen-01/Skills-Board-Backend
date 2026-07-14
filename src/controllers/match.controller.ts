import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Listing, { IListing } from '../models/Listing';
import Match from '../models/Match';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    username: string;
}

type PopulatedListing = Omit<IListing, 'userId'> & {
    _id: mongoose.Types.ObjectId;
    userId: PopulatedUser;
};

// GET /api/matches
export const getMatches = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const listingId = req.query.listingId as string | undefined;
        const myListingFilter: Record<string, unknown> = {
            userId,
            status: 'active',
        };

        if (listingId) {
            if (!mongoose.Types.ObjectId.isValid(listingId)) {
                throw new AppError('Invalid listingId.', 400, 'INVALID_ID');
            }

            const owned = await Listing.findOne({
                _id: new mongoose.Types.ObjectId(listingId),
                userId,
            });

            if (!owned) {
                throw new AppError(
                    'No listing exists with this id for the current user.',
                    404,
                    'LISTING_NOT_FOUND'
                );
            }

            myListingFilter._id = new mongoose.Types.ObjectId(listingId);
        }

        const myListings = await Listing.find(myListingFilter);
        if (myListings.length === 0) {
            sendSuccess(res, []);
            return;
        }

        const me = await User.findById(userId);
        const results = [];

        for (const myListing of myListings) {
            const oppositeType = myListing.type === 'offer' ? 'request' : 'offer';
            const geoFilter: Record<string, unknown> =
                me?.location?.lat && me?.location?.lng && myListing.radiusKm
                    ? {
                        location: {
                            $geoWithin: {
                                $centerSphere: [
                                    [me.location.lng, me.location.lat],
                                    myListing.radiusKm / 6371,
                                ],
                            },
                        },
                    }
                    : {};

            const matchingListings = (await Listing.find({
                userId: { $ne: userId },
                type: oppositeType,
                category: myListing.category,
                status: 'active',
                ...geoFilter,
            })
                .populate('userId', 'name username')
                .lean()) as unknown as PopulatedListing[];

            for (const match of matchingListings) {
                const existingMatch = await Match.findOne({
                    $or: [
                        { listingIdA: myListing._id, listingIdB: match._id },
                        { listingIdA: match._id, listingIdB: myListing._id },
                    ],
                }).lean();

                if (!existingMatch) {
                    const newMatch = await Match.create({
                        listingIdA: myListing._id,
                        listingIdB: match._id,
                        userIdA: userId,
                        userIdB: match.userId._id,
                        matchedAt: new Date(),
                    });

                    results.push({
                        _id: newMatch._id,
                        listingIdA: myListing._id,
                        listingIdB: match._id,
                        matchedUser: {
                            _id: match.userId._id,
                            name: match.userId.name,
                            username: match.userId.username,
                        },
                        matchedListing: {
                            title: match.title,
                            category: match.category,
                        },
                        matchedAt: newMatch.matchedAt,
                    });
                } else {
                    results.push({
                        _id: existingMatch._id,
                        listingIdA: existingMatch.listingIdA,
                        listingIdB: existingMatch.listingIdB,
                        matchedUser: {
                            _id: match.userId._id,
                            name: match.userId.name,
                            username: match.userId.username,
                        },
                        matchedListing: {
                            title: match.title,
                            category: match.category,
                        },
                        matchedAt: existingMatch.matchedAt,
                    });
                }
            }
        }

        sendSuccess(res, results);
    } catch (err) {
        next(err);
    }
};

// GET /api/matches/:id
export const getMatchById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const id = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid match id.', 400, 'INVALID_ID');
        }

        const match = await Match.findOne({
            _id: new mongoose.Types.ObjectId(id),
            $or: [{ userIdA: userId }, { userIdB: userId }],
        })
            .populate('listingIdA', 'title category type')
            .populate('listingIdB', 'title category type')
            .populate('userIdA', 'name username')
            .populate('userIdB', 'name username')
            .lean();

        if (!match) {
            throw new AppError('No match exists with this id.', 404, 'MATCH_NOT_FOUND');
        }

        sendSuccess(res, match);
    } catch (err) {
        next(err);
    }
};