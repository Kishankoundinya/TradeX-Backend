const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    
    const token = req.cookies.token; 
    
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