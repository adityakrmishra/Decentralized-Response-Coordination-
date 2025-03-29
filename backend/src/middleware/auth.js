import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/User.schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError.Unauthorized('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.sub)
      .select('-password -__v -refreshToken')
      .lean();

    if (!user) {
      throw createError.Unauthorized('User not found');
    }

    if (user.status !== 'active') {
      throw createError.Forbidden('Account deactivated');
    }

    req.user = {
      id: user._id,
      roles: user.roles,
      walletAddress: user.walletAddress,
      permissions: user.permissions
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error = createError.Unauthorized('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      error = createError.Unauthorized('Invalid token');
    }
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.roles.some(role => allowedRoles.includes(role))) {
      return next(createError.Forbidden('Insufficient privileges'));
    }
    
    if (req.user.permissions.includes('suspend')) {
      return next(createError.Forbidden('Account suspended'));
    }

    next();
  };
};

export const checkOwnership = (modelName, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const model = require(`../models/${modelName}.schema.js`).default;
      const resource = await model.findById(req.params[paramName]);

      if (!resource) {
        return next(createError.NotFound('Resource not found'));
      }

      if (!resource.owner.equals(req.user.id)) {
        return next(createError.Forbidden('Resource ownership required'));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { timestamp: now, count: 1 });
    } else {
      const entry = requests.get(ip);
      
      if (now - entry.timestamp < windowMs) {
        if (entry.count >= max) {
          return next(createError.TooManyRequests('Rate limit exceeded'));
        }
        entry.count++;
      } else {
        entry.timestamp = now;
        entry.count = 1;
      }
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - requests.get(ip).count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(
      (requests.get(ip).timestamp + windowMs) / 1000
    ));

    next();
  };
};
