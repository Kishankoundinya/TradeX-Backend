const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    console.log('=== USER AUTH DEBUG ===');
    console.log('Request URL:', req.url);
    
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.token;
    
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
            console.log('Token found in Authorization header');
        }
    } else {
        console.log('Token found in cookie');
    }
    
    if (!token) {
        console.log('❌ No token found');
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }
    
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('✅ Token decoded - User ID:', tokenDecode.id);
        
        if (tokenDecode.id) {
            req.user = { id: tokenDecode.id };
            next();
        } else {
            console.log('❌ No id in token');
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }
    } catch (e) {
        console.error('❌ Token verification failed:', e.message);
        return res.status(401).json({ success: false, message: e.message });
    }
}

module.exports = { userAuth };