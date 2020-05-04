'use strict';

import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import { UserController } from '../controllers';

let router = new Router();

router.post('/signup', UserController.signUp);
router.post('/signup/email', UserController.signUpWithEmailOnly);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.put('/changepassword', authMiddleware, UserController.changePassword);
router.get('/verifyemail', authMiddleware, UserController.resendVerificationEmail);
router.put('/verifyemail', authMiddleware, UserController.verifyEmail);
router.post('/supportticket', authMiddleware, UserController.createSupportTicket);

// Password reset calls
router.post('/resetpassword', UserController.generateResetPasswordToken);
router.get('/resetpassword', UserController.checkResetPasswordToken);
router.put('/resetpassword', UserController.resetPassword);

module.exports = router;
