const e = require('express');
const { signupSchema, signinSchema } = require('../middlewares/validator');
const User = require('../models/userModal');
const { doHash, doHashValidate } = require('../utils/hashing');
const jwt = require('jsonwebtoken');


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