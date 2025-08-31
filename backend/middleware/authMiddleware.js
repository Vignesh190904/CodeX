// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log('Auth header:', authHeader);
  console.log('Token:', token);

  if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification error:', err);
      return res.status(403).json({ message: "Invalid Token" });
    }
    console.log('Token verified, user:', user);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  console.log('Checking admin access for user:', req.user);
  console.log('User role:', req.user?.role);
  
  if (req.user && req.user.role === "admin") {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied');
    return res.status(403).json({ message: "Access Denied: Admins only" });
  }
};

module.exports = { authenticateToken, isAdmin };
