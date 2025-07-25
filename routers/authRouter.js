const express = require('express');
const authController = require('../controllers/authController');

const authRouter = express.Router();

authRouter.post('/signup', authController.signup);
authRouter.post('/signin', authController.signin);
authRouter.post('/signout', authController.signout);

authRouter.patch('/send-verification-code', authController.sendVerificationCode);
authRouter.patch('/verify-verification-code', authController.verifyVerificationCode);

module.exports = authRouter;