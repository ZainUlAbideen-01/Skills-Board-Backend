import { Router } from 'express';
import { reportTarget } from '../controllers/report.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, reportTarget);

export default router;