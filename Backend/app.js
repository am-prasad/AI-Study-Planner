// backend/app.js
import express from 'express';
import cors from 'cors';
import timetableRoutes from './routes/timetableRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { db } from './config/firebase.js'; // Ensure Firebase is initialized
import { protect } from './middleware/authMiddleware.js';
import { registerUser } from './controllers/userController.js'; // Import registerUser
import { uploadSyllabusPdf } from './controllers/timetableController.js'; // Import new PDF upload controller
import multer from 'multer'; // Import multer for file uploads

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer(); // No disk storage needed, files will be in memory (buffer)

app.use(cors()); // Enable CORS for frontend communication

// Basic route
app.get('/', (req, res) => {
  res.send('Timetable Backend API is running!');
});

// Public route for user registration (Firebase Auth handled by frontend, then profile created in Firestore)
app.post('/api/users/register', express.json(), protect, registerUser);

// New route for PDF uploads, protected by auth middleware. Multer handles body parsing here.
app.post('/api/upload-syllabus-pdf', protect, upload.single('syllabusPdf'), uploadSyllabusPdf);

// Protected routes that require JSON parsing
app.use('/api', express.json(), protect, timetableRoutes);
app.use('/api/users', express.json(), protect, userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

