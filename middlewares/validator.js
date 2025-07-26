const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] } // Allow specific TLDs for email validation
    }),
    password: Joi.string().min(6).required().pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]+$')).messages({
        'string.pattern.base': 'Password must be alphanumeric and between 6 to 30 characters long'
    })
});

const signinSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] }
    }),
    password: Joi.string().min(6).required().pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]+$')).messages({
        'string.pattern.base': 'Password must be alphanumeric and between 6 to 30 characters long'
    })
});

const verifyCodeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] }
    }),
    providedCode: Joi.number().min(100000).max(999999).required().messages({
        'number.base': 'Verification code must be a 6-digit number'
    })
});

const changePasswordSchema = Joi.object({
    newPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]+$')),
	oldPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]+$')),
});

module.exports = {
    signupSchema,
    signinSchema,
    verifyCodeSchema,
    changePasswordSchema
};