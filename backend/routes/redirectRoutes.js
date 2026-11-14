import express from 'express';
import { redirectQR, getPublicQR, recordGpsTelemetry } from '../controllers/redirectController.js';
import { recordFeedbackEvent } from '../controllers/telemetryController.js';

const router = express.Router();

// Public endpoint to get QR data by shortId (for landing pages)
router.get('/info/:shortId', getPublicQR);

// Telemetry endpoint for high-precision GPS reporting
router.post('/:shortId/telemetry', recordGpsTelemetry);

// Feedback endpoint for 5-star Google redirects & 1-3 star WhatsApp complaints
router.post('/:shortId/feedback', recordFeedbackEvent);

// The catch-all route for short IDs
// GET /r/x7d9Ak
router.get('/:shortId', redirectQR);

export default router;
