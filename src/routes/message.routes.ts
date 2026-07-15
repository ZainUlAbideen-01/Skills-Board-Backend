import { Router } from 'express';
import { getConversation, getConversations } from '../controllers/message.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getConversation);

export default router;