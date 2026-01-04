// backend/routes/timetableRoutes.js
import express from 'express';
import { getTimetable, generateTimetableFromText, updateTimetable } from '../controllers/timetableController.js';

const router = express.Router();

router.post('/timetables/generate-text', generateTimetableFromText); // New route for text-based timetable generation
router.get('/timetables/:userId', getTimetable);
router.put('/timetables/:timetableId', updateTimetable); // New route for updating timetables

export default router;

