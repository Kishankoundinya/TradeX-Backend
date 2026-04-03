const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.token;
    
    if (!token) {
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }
    
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (tokenDecode.id) {
            req.user = { id: tokenDecode.id };
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }
    } catch (e) {
        return res.status(401).json({ success: false, message: e.message });
    }
}

module.exports = { userAuth };