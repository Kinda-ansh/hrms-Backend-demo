const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/jwt");

// Middleware to verify JWT and extract user data
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access token missing" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);  // Log the error
        res.status(403).json({ message: "Invalid or expired token" });
    }
};


// Middleware to check user roles and permissions
const roleMiddleware = (requiredRoles) => (req, res, next) => {
    const { role } = req.user;
    if (!requiredRoles.includes(role)) {
        return res.status(403).json({ message: "Sorry, You don't have permissions!" });
    }
    next();
};


module.exports = {authMiddleware, roleMiddleware}