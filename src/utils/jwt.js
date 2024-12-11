const jwt = require("jsonwebtoken");

const SECRET_KEY = "kindasolutionshrms"; // Replace with a secure secret key
const TOKEN_EXPIRATION = "10d"; // Token expiration time

// Generate a JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        SECRET_KEY,
        { expiresIn: TOKEN_EXPIRATION }
    );
};

// Verify JWT Token
const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};

module.exports = {generateToken, verifyToken, SECRET_KEY}