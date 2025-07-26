const e = require('express');
const { signupSchema, signinSchema, verifyCodeSchema, changePasswordSchema } = require('../middlewares/validator');
const User = require('../models/userModal');
const { doHash, doHashValidate, hmacProcess } = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transport = require('../middlewares/sendMail');

exports.signup = async (req, res) => {
    // Handle user signup logic here
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await doHash(password, 10);

        const newUser = new User({
            email: value.email,
            password: hashedPassword
        });

        const result = await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: result._id,
                email: result.email,
                verified: result.verified
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.signin = async (req, res) => {
    // Handle user signin logic here
    const { email, password } = req.body;
    try {
        const { error, value } = signinSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist' });
        }
        const isPasswordValid = await doHashValidate(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials !' });
        }
        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '8h' }
        );
        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day  
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production

        });
        res.status(200).json({
            success: true,
            message: 'Signin successful',
            token: token,
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

exports.signout = async (req, res) => {
    // Handle user signout logic here
    res.clearCookie('Authorization')
        .status(200)
        .json({ success: true, message: 'Signout successful' });
};

exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }
        // console.log('Existing User:', existingUser);

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: 'you are already verified' });
        }
        const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // Generate a 6-digit code
        console.log(existingUser.email, verificationCode);
        console.log('Email:', process.env.NODE_CODE_SENDING_EMAIL_ADDRESS);
        console.log('Pass Length:', process.env.NODE_CODE_SENDING_EMAIL_PASSWORD?.length); // Just check length


        let info;
        try {
            info = await transport.sendMail({
                from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
                to: existingUser.email,
                subject: 'Verification Code',
                html: `
                    <div style="text-align: center; font-family: sans-serif;">
                    <h2>Verification Code</h2>
                    <p>Your code is:</p>
                    <p style="font-size: 24px; font-weight: bold;">${verificationCode}</p>
                    </div>
                `,
            });
        } catch (mailError) {
            // Handle email sending errors (like wrong password, etc.)
            console.error('Email sending error:', mailError);
            return res.status(500).json({ success: false, message: 'Failed to send verification code. Please check email configuration.' });
        }

        if (info.accepted[0] === existingUser.email) {
            const hashedCode = hmacProcess(verificationCode, process.env.HMAC_VERIFICATION_CODE_SECRET);
            existingUser.verificationCode = hashedCode;
            existingUser.verificationCodeValidation = Date.now()
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'Verification code sent successfully' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to send verification code' });
        }

    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}
exports.verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;
    try {
        const { error, value } = verifyCodeSchema.validate({ email, providedCode });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select('+verificationCode +verificationCodeValidation');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist' });
        }
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: 'You are already verified' });
        }
        console.log(existingUser.verificationCode, existingUser.verificationCodeValidation);
        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: 'somthing went wrong, please try again' });
        }
        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) { // 5 minutes
            return res.status(400).json({ success: false, message: 'Verification code expired' });
        }
        const hashedCode = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        if (hashedCode === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'User verified successfully' });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

exports.changePassword = async (req, res) => {
    const {oldPassword, newPassword } = req.body;
    const { userId, verified } = req.user;
    try {
        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        if (!verified) {
            return res.status(401).json({ success: false, message: 'You are not verified user' });
        }
        const existingUser = await User.findOne({ _id: userId }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist' });
        }
        const isOldPasswordValid = await doHashValidate(oldPassword, existingUser.password);
        if (!isOldPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid old password' });
        }
        const hashedNewPassword = await doHash(newPassword, 12);
        existingUser.password = hashedNewPassword;
        await existingUser.save();
        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
 
}