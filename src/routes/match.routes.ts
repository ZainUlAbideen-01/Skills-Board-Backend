import { Router } from 'express';
import { getMatches, getMatchById } from '../controllers/match.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getMatches);
router.get('/:id', getMatchById);

export default router;