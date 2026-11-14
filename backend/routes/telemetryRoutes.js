import express from 'express';
import { recordFeedbackEvent } from '../controllers/telemetryController.js';

const router = express.Router();

// POST /api/telemetry/feedback
router.post('/feedback', recordFeedbackEvent);

export default router;
