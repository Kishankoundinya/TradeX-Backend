const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    console.log('=== USER AUTH DEBUG ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.token;
    console.log('Token from cookie:', token ? `${token.substring(0, 20)}...` : 'No cookie token');
    
    if (!token) {
        // Check Authorization header
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
            console.log('Token from header:', token ? `${token.substring(0, 20)}...` : 'No header token');
        }
    }
    
    if (!token) {
        console.log('❌ No token found in cookie or header');
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }
    
    try {
        console.log('Verifying token...');
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Token decoded successfully:', tokenDecode);
        
        if (tokenDecode.id) {
            req.user = { id: tokenDecode.id };
            console.log('✅ User authenticated with ID:', req.user.id);
            next();
        } else {
            console.log('❌ Token has no id field');
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }
    } catch (e) {
        console.error('❌ Token verification failed:', e.message);
        return res.status(401).json({ success: false, message: e.message });
    }
}

module.exports = { userAuth };