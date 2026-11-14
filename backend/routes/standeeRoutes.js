import express from 'express';
import {
    verifyKitCodeHandler,
    activateStandeeHandler,
    getMyStandeesHandler
} from '../controllers/standeeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: verify a kit code before claiming
router.get('/verify/:code', verifyKitCodeHandler);

// Protected: activate/bind a standee to merchant's account
router.post('/activate', protect, activateStandeeHandler);

// Protected: fetch all standees for the merchant
router.get('/my-standees', protect, getMyStandeesHandler);

export default router;
