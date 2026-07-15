import { Response, NextFunction } from 'express';
import Listing from '../models/Listing';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';

// POST /api/listings
export const createListing = async (
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

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError(
        'No user exists with this id.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const {
      type,
      title,
      category,
      description,
      availability,
      radiusKm,
      status,
    } = req.body;

    // Type
    if (!type) {
      throw new AppError(
        'type is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    if (!['offer', 'request'].includes(type)) {
      throw new AppError(
        'type must be either offer or request.',
        422,
        'VALIDATION_ERROR'
      );
    }

    // Title
    if (!title) {
      throw new AppError(
        'title is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    // Category
    if (!category) {
      throw new AppError(
        'category is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    // Description
    if (!description) {
      throw new AppError(
        'description is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    // Radius
    if (radiusKm === undefined || radiusKm === null) {
      throw new AppError(
        'radiusKm is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    if (Number(radiusKm) <= 0) {
      throw new AppError(
        'radiusKm must be greater than 0.',
        422,
        'VALIDATION_ERROR'
      );
    }

    // Status-> optional
    if (
      status !== undefined &&
      !['active', 'closed'].includes(status)
    ) {
      throw new AppError(
        'status must be either active or closed.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const listing = await Listing.create({
      userId: user._id,
      type,
      title,
      category,
      description,
      availability,
      radiusKm: Number(radiusKm),
      status,
      location:
        user.location?.lat !== undefined &&
        user.location?.lng !== undefined
          ? {
              type: 'Point',
              coordinates: [
                user.location.lng,
                user.location.lat,
              ],
            }
          : undefined,
    });

    sendSuccess(
      res,
      {
        _id: listing._id,
        userId: listing.userId,
        type: listing.type,
        title: listing.title,
        category: listing.category,
        description: listing.description,
        availability: listing.availability,
        radiusKm: listing.radiusKm,
        status: listing.status,
        location: listing.location,
        createdAt: listing.createdAt,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};


// GET /api/listings/:id
export const getListingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new AppError(
        'No listing exists with this id.',
        404,
        'LISTING_NOT_FOUND'
      );
    }

    sendSuccess(res, {
      _id: listing._id,
      userId: listing.userId,
      type: listing.type,
      title: listing.title,
      category: listing.category,
      description: listing.description,
      availability: listing.availability,
      radiusKm: listing.radiusKm,
      status: listing.status,
      location: listing.location,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/listings/:id
export const updateListing = async (
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

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new AppError(
        'No listing exists with this id.',
        404,
        'LISTING_NOT_FOUND'
      );
    }

    if (listing.userId.toString() !== req.userId) {
      throw new AppError(
        'You are not authorized to update this listing.',
        403,
        'FORBIDDEN'
      );
    }

    const {
      type,
      title,
      category,
      description,
      availability,
      radiusKm,
      status,
    } = req.body;

    // Type
    if (type !== undefined) {
      if (!['offer', 'request'].includes(type)) {
        throw new AppError(
          'type must be either offer or request.',
          422,
          'VALIDATION_ERROR'
        );
      }

      listing.type = type;
    }

    // Title
    if (title !== undefined) {
      if (!title.trim()) {
        throw new AppError(
          'title cannot be empty.',
          422,
          'VALIDATION_ERROR'
        );
      }

      listing.title = title;
    }

    // Category
    if (category !== undefined) {
      if (!category.trim()) {
        throw new AppError(
          'category cannot be empty.',
          422,
          'VALIDATION_ERROR'
        );
      }

      listing.category = category;
    }

    // Description
    if (description !== undefined) {
      if (!description.trim()) {
        throw new AppError(
          'description cannot be empty.',
          422,
          'VALIDATION_ERROR'
        );
      }

      listing.description = description;
    }

    // Availability
    if (availability !== undefined) {
      listing.availability = availability;
    }

    // Radius
    if (radiusKm !== undefined) {
      if (Number(radiusKm) <= 0) {
        throw new AppError(
          'radiusKm must be greater than 0.',
          422,
          'VALIDATION_ERROR'
        );
      }

      listing.radiusKm = Number(radiusKm);
    }

    // Status
    if (status !== undefined) {
      if (!['active', 'closed'].includes(status)) {
        throw new AppError(
          'status must be either active or closed.',
          422,
          'VALIDATION_ERROR'
        );
      }

      listing.status = status;
    }

    await listing.save();

    sendSuccess(res, {
      _id: listing._id,
      userId: listing.userId,
      type: listing.type,
      title: listing.title,
      category: listing.category,
      description: listing.description,
      availability: listing.availability,
      radiusKm: listing.radiusKm,
      status: listing.status,
      location: listing.location,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};


// DELETE /api/listings/:id
export const deleteListing = async (
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

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new AppError(
        'No listing exists with this id.',
        404,
        'LISTING_NOT_FOUND'
      );
    }

    if (listing.userId.toString() !== req.userId) {
      throw new AppError(
        'You are not authorized to delete this listing.',
        403,
        'FORBIDDEN'
      );
    }

    await listing.deleteOne();

    sendSuccess(res, {
      message: 'Listing deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/mine
export const getMyListings = async (
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

    const { status } = req.query;

    const filter: Record<string, unknown> = {
      userId: req.userId,
    };

    if (status !== undefined) {
      if (
        status !== 'active' &&
        status !== 'closed'
      ) {
        throw new AppError(
          'status must be either active or closed.',
          422,
          'VALIDATION_ERROR'
        );
      }

      filter.status = status;
    }

    const listings = await Listing.find(filter).sort({
      createdAt: -1,
    });

    sendSuccess(res, listings);
  } catch (err) {
    next(err);
  }
};


// GET /api/listings/search
export const searchListings = async (
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

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError(
        'No user exists with this id.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const {
      category,
      keyword,
      radiusKm,
    } = req.query;

    const pipeline: any[] = [];

    
    // Geo Search
    
    if (
      radiusKm !== undefined &&
      user.location?.lat !== undefined &&
      user.location?.lng !== undefined
    ) {
      pipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              user.location.lng,
              user.location.lat,
            ],
          },
          distanceField: 'distance',
          maxDistance:
            Number(radiusKm) * 1000,
          spherical: true,
        },
      });
    }

   
    // Build Filters
    
    const match: Record<string, unknown> = {
      userId: {
        $ne: user._id,
      },
      status: 'active',
    };

    if (category) {
      match.category = category;
    }

    if (keyword) {
      match.$or = [
        {
          title: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ];
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    const listings = await Listing.aggregate(
      pipeline
    );

    sendSuccess(res, listings);
  } catch (err) {
    next(err);
  }
};