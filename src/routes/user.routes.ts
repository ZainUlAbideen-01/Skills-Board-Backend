import { Router } from 'express';
import {
 getCurrentUser,getUserById,editUserProfile
} from '../controllers/user.controller';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/me',protect ,getCurrentUser);
router.get('/:id',protect,getUserById);
router.put('/me',protect,upload.single("photo"),editUserProfile);

export default router;