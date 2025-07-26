const express = require('express');
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');
const authRouter = express.Router();

authRouter.post('/signup', authController.signup);
authRouter.post('/signin', authController.signin);
authRouter.post('/signout', identifier, authController.signout);

authRouter.patch('/send-verification-code', identifier, authController.sendVerificationCode);
authRouter.patch('/verify-verification-code', identifier, authController.verifyVerificationCode);

authRouter.patch('/change-password', identifier, authController.changePassword);

module.exports = authRouter;