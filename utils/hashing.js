const { hash, compare } = require('bcryptjs');
const { createHmac } = require('crypto');

exports.doHash = async (value, saltValue) => {
    const result = await hash(value, saltValue);
    return result;
}

exports.doHashValidate = async (value, hashedValue) => {
    const result = await compare(value, hashedValue);
    return result;
}

exports.hmacProcess = (value, secret) => {
    const result = createHmac('sha256', secret).update(value).digest('hex');
    return result;
}