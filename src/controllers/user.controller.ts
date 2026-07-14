import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import AppError from '../utils/AppError';
import { uploadImage } from '../utils/cloudinary';
// GET /api/users/me
export const getCurrentUser = async (
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

    sendSuccess(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      location: user.location,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {

    //to test if req.file reponds
    console.log("========== CONTROLLER ==========");
console.log("req.file:", req.file);
console.log("req.body:", req.body);
console.log("================================");
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new AppError(
        'No user exists with this id.',
        404,
        'USER_NOT_FOUND'
      );
    }

    sendSuccess(res, {
      _id: user._id,
      name: user.name,
      photoUrl: user.photoUrl,
      location: user.location,
      bio: user.bio,
    });
  } catch (err) {
    next(err);
  }
};




const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

export const editUserProfile = async (
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
      username,
      name,
      bio,
      city,
      neighborhood,
      lat,
      lng,
    } = req.body;

    // Username
    if (username !== undefined) {
      if (!isValidUsername(username)) {
        throw new AppError(
          'username must be 3-20 characters and contain only letters, numbers, or underscores.',
          422,
          'VALIDATION_ERROR'
        );
      }

      const usernameTaken = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (usernameTaken) {
        throw new AppError(
          'This username is already taken.',
          409,
          'USERNAME_TAKEN'
        );
      }

      user.username = username.toLowerCase();
    }

    // Name
    if (name !== undefined) {
      user.name = name;
    }

    // Bio
    if (bio !== undefined) {
      if (bio.length > 300) {
        throw new AppError(
          'bio must be 300 characters or fewer.',
          422,
          'VALIDATION_ERROR'
        );
      }

      user.bio = bio;
    }

    // Location
    if (
      city !== undefined ||
      neighborhood !== undefined ||
      lat !== undefined ||
      lng !== undefined
    ) {
      user.location = {
        city,
        neighborhood,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
      };
    }

    // Upload image
    if (req.file) {
      const imageUrl = await uploadImage(req.file);
      user.photoUrl = imageUrl;
     
    }
     if (!req.file) {
      console.log('hiii')
     
    }

     

    await user.save();

    sendSuccess(res, {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      photoUrl: user.photoUrl || "no photo",
      location: user.location,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};