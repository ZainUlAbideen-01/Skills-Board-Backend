import { Router } from 'express';
import {
  signup,
  verifyOTP,
  login,
  logout,
  forgotPassword,
  verifyResetOTPHandler,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);

router.post('/login', login);
router.post('/logout', protect, logout);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTPHandler);
router.post('/reset-password', resetPassword);

export default router;