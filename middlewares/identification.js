const jwt = require('jsonwebtoken');

exports.identifier = (req, res, next) => {
    let token;
    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization?.split(' ')[1];
    } else {
        token = req.cookies['Authorization'];
    }
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const jwtVerified = jwt.verify(token, process.env.TOKEN_SECRET);
        if (jwtVerified) {
            req.user = jwtVerified;
            next();
        } else {
            throw new Error('Error verifying token');
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}