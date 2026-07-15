import { Router } from 'express';
import { createReview, getReviewsForUser } from '../controllers/review.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', createReview);
router.get('/:userId', getReviewsForUser);

export default router;