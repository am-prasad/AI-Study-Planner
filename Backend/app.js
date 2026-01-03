// backend/app.js
import express from 'express';
import cors from 'cors';
import timetableRoutes from './routes/timetableRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { db } from './config/firebase.js'; // Ensure Firebase is initialized
import { protect } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies

// Basic route
app.get('/', (req, res) => {
  res.send('Timetable Backend API is running!');
});

// Use timetable routes
app.use('/api', protect, timetableRoutes);
app.use('/api/users', protect, userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

