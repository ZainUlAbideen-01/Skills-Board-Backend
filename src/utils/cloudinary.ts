import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import AppError from './AppError';

export const uploadImage = async (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'profile-images',
        resource_type: 'image',
      },
      (
        error: Error | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error || !result) {
          return reject(
            new AppError(
              'Failed to upload image.',
              500,
              'UPLOAD_FAILED'
            )
          );
        }

        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};