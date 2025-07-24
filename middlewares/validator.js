const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] } // Allow specific TLDs for email validation
    }),
    password: Joi.string().min(6).required().pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]+$')).messages({
        'string.pattern.base': 'Password must be alphanumeric and between 6 to 30 characters long'
    })
});

module.exports = {
    signupSchema
};