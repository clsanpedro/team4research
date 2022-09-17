import express from 'express';

import { confirmAccount, formForgotPassword, formSignIn, formSignUp, enrol, resetPassword, validateToken, newPassword, authenticate } from '../controllers/userController.js';

const router = express.Router();

router.get ( '/signin', formSignIn ); // login
router.post ( '/signin', authenticate ); // login


router.get ( '/signup', formSignUp); // registro
router.post ( '/signup', enrol); // registro POST


router.get ( '/confirm/:token', confirmAccount);

router.get ( '/reset-password', formForgotPassword); // olvido de password get
router.post ( '/reset-password', resetPassword); // olvido de password get

// Save new pwd
router.get('/forgot-password/:token', validateToken);
router.post('/forgot-password/:token', newPassword);

export default router; 