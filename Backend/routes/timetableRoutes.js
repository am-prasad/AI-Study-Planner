// backend/routes/timetableRoutes.js
import express from 'express';
import { createTimetable, getTimetable } from '../controllers/timetableController.js';

const router = express.Router();

router.post('/timetables', createTimetable);
router.get('/timetables/:userId', getTimetable);

export default router;

