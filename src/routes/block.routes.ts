import { Router } from 'express';
import {
    blockUser,
    unblockUser,
} from '../controllers/block.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, blockUser);
router.delete('/:userId', protect, unblockUser);

export default router;