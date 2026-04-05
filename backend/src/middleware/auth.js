const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            position: user.position,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
    );
}

function authMiddleware(req, res, next) {
    let token = req.cookies?.token;
    
    if (!token) {
        const authHeader = req.headers.authorization || "";
        token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    }

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }
        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole,
    generateToken,
};


