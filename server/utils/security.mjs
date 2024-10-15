import crypto from 'crypto';

import { CustomError } from './errorHandle.mjs';

const generateRandom = (length) => crypto.randomBytes(length).toString('base64');


const generateHash = (password, salt) => {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    return hash.digest('base64');
}


const isAuthenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized', type: 'UNAUTHENTICATED' });
}


const isauthorized = (req, roles) => {

    if (!req.isAuthenticated()) {
        throw new CustomError('Unauthorized', 'UNAUTHENTICATED', 401);
    }

    if (!roles.includes(req?.user?.role?.toLowerCase())) {
        throw new CustomError('Forbidden', 'UNAUTHORIZED', 403);
    }

    return true;
}

export { generateRandom, generateHash, isAuthenticatedUser, isauthorized as authorized};  