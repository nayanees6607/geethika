const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        console.log('Auth middleware - Token received:', token ? token.substring(0, 20) + '...' : 'null');

        if (!token) {
            console.log('Auth middleware - No token provided');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';
        console.log('Auth middleware - Using secret:', secret.substring(0, 20) + '...');
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        console.log('Auth middleware - Decoded user:', decoded);
        next();
    } catch (error) {
        console.log('Auth middleware - Token verification failed:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('Authorize middleware - Required roles:', roles);
        console.log('Authorize middleware - User role:', req.user?.role);
        
        if (!req.user || !req.user.role) {
            console.log('Authorize middleware - User role not found');
            return res.status(403).json({
                message: 'Access denied: User role not found in token',
                receivedRole: req.user?.role || 'none',
                requiredRoles: roles
            });
        }

        if (!roles.includes(req.user.role)) {
            console.log('Authorize middleware - Insufficient permissions');
            return res.status(403).json({
                message: 'Access denied: Insufficient permissions',
                receivedRole: req.user.role,
                requiredRoles: roles
            });
        }
        
        console.log('Authorize middleware - Access granted');
        next();
    };
};

module.exports = { authMiddleware, authorize, protect: authMiddleware };
