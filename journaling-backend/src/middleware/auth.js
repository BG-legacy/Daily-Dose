const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log('No auth header present');
            return res.status(401).json({ error: 'No authorization header' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('Invalid auth header format');
            return res.status(401).json({ error: 'Invalid authorization format' });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        console.log('Token received:', token.substring(0, 20) + '...');

        try {
            // Verify token with Firebase Admin
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log('Token verified for user:', decodedToken.uid);
            
            // Add user data to request object
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                // Add any other user data you need
            };
            
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authMiddleware; 