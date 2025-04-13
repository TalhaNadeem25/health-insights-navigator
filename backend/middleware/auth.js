import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
    
    // Add user ID to request object
    req.userId = decoded.userId;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Permission denied. Required role: ' + roles.join(' or ') });
    }
    next();
  };
}; 