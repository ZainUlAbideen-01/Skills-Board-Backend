import multer from 'multer';
import AppError from '../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (
  req,
  file,
  cb
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only image files are allowed.',
        422,
        'VALIDATION_ERROR'
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;