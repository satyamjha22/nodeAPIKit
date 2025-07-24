const { hash } = require('bcryptjs');

exports.doHash = async (value, saltValue) => {
    const result = await hash(value, saltValue);
    return result;
} 