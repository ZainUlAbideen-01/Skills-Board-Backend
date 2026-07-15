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
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/verify-otp', authLimiter, verifyOTP);

router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-reset-otp', authLimiter, verifyResetOTPHandler);
router.post('/reset-password', authLimiter, resetPassword);

export default router