// backend/middleware/authMiddleware.js
import { admin } from '../config/firebase.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // Attach user information to the request
      next();
    } catch (error) {
      console.error("Error verifying authentication token:", error);
      res.status(401).send({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).send({ message: "Not authorized, no token" });
  }
};

export { protect };

