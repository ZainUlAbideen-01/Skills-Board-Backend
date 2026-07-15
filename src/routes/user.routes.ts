import { Router } from 'express';
import {
 getCurrentUser,getUserById,editUserProfile
} from '../controllers/user.controller';
import { protect } from '../middleware/auth';


const router = Router();

router.get('/me',protect ,getCurrentUser);
router.get('/:id',protect,getUserById);
router.put('/me',protect,editUserProfile);

export default router;