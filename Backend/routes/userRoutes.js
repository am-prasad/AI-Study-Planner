// backend/routes/userRoutes.js
import express from 'express';
import { registerUser, getUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/profile/:uid', getUserProfile); // Requires authentication for production

export default router;

