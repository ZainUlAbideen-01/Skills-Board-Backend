import { Router } from 'express';
import { createExchange } from '../controllers/exchange.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', createExchange);

export default router;