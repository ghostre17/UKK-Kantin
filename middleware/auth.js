const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token not found" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { refresh_token: token } });

        if (!user || user.refresh_token === null) return res.status(401).json({ message: "Invalid token" });

        req.user = decoded;

        next();
    } catch (err) {
        res.status(500).json({ message: "Invalid token" });
    }
};

const authRole = (role) => (req, res, next) => {
    if (!role.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
};

module.exports = {
    authenticate,
    authRole
};
