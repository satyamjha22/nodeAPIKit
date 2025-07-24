const { signupSchema } = require('../middlewares/validator');
const User = require('../models/userModal');
const { doHash } = require('../utils/hashing');

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
