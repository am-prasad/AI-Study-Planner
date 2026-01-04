// backend/routes/userRoutes.js
import express from 'express';
import { registerUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/:uid', getUserProfile); // Requires authentication for production
router.put('/profile/:uid', updateUserProfile); // Requires authentication

export default router;

