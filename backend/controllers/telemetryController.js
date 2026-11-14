import { QRCode } from '../models/QRCode.js';
import { DailyScanStats } from '../models/DailyScanStats.js';
import { FeedbackEvent } from '../models/FeedbackEvent.js';

/**
 * Record a 5-Star Google redirect or 1-3 Star Private WhatsApp Feedback event
 * Route: POST /api/telemetry/feedback or POST /r/:shortId/feedback
 * Access: Public
 */
export const recordFeedbackEvent = async (req, res) => {
    try {
        const {
            shortId,
            qrId,
            eventType, // 'google_redirect' | 'private_feedback'
            rating,
            staffName,
            serviceOrDish,
            reviewDraft,
            issues,
            notes
        } = req.body;

        if (!eventType || !['google_redirect', 'private_feedback'].includes(eventType)) {
            return res.status(400).json({ message: "Invalid eventType. Must be 'google_redirect' or 'private_feedback'." });
        }

        const effectiveShortId = shortId || req.params.shortId;

        // Find associated QR code if identifier provided
        let qr = null;
        if (effectiveShortId) {
            qr = await QRCode.findOne({ short_id: effectiveShortId }).select('_id user_id short_id stats');
        } else if (qrId) {
            qr = await QRCode.findById(qrId).select('_id user_id short_id stats');
        } else if (req.user?._id) {
            // If called from merchant dashboard simulator
            qr = await QRCode.findOne({ user_id: req.user._id, isActive: true }).select('_id user_id short_id stats');
        }

        const ownerId = qr?.user_id || req.user?._id || null;
        const starRating = Number(rating) || (eventType === 'google_redirect' ? 5 : 2);
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Atomically update QRCode cumulative counters
        if (qr) {
            const qrInc = {};
            if (eventType === 'google_redirect') {
                qrInc['stats.google_redirects'] = 1;
            } else {
                qrInc['stats.private_feedback'] = 1;
            }
            if (staffName) {
                const cleanKey = String(staffName).trim().replace(/\./g, '_').replace(/\$/g, '_');
                qrInc[`stats.staff_mentions.${cleanKey}`] = 1;
            }
            QRCode.updateOne({ _id: qr._id }, { $inc: qrInc }).catch(err => {
                console.warn('[telemetryController] QRCode stats update non-fatal error:', err.message);
            });

            // 2. Atomically update DailyScanStats bucket
            const dailyInc = {};
            if (eventType === 'google_redirect') {
                dailyInc['google_redirects'] = 1;
            } else {
                dailyInc['private_feedback'] = 1;
            }
            if (staffName) {
                const cleanKey = String(staffName).trim().replace(/\./g, '_').replace(/\$/g, '_');
                dailyInc[`staff_reviews.${cleanKey}`] = 1;
            }
            DailyScanStats.updateOne(
                { qr_id: qr._id, date: todayStr },
                { $inc: dailyInc },
                { upsert: true }
            ).catch(err => {
                console.warn('[telemetryController] DailyScanStats update non-fatal error:', err.message);
            });
        }

        // 3. Create persistent detailed FeedbackEvent document
        const feedbackDoc = await FeedbackEvent.create({
            qr_id: qr?._id || null,
            short_id: effectiveShortId || qr?.short_id || null,
            owner_id: ownerId,
            eventType,
            rating: starRating,
            staffName: staffName || null,
            serviceOrDish: serviceOrDish || null,
            reviewDraft: reviewDraft || null,
            issues: Array.isArray(issues) ? issues : [],
            notes: notes || '',
            userAgent: req.headers['user-agent'] || null,
            deviceType: /mobile/i.test(req.headers['user-agent'] || '') ? 'mobile' : 'desktop'
        });

        return res.status(200).json({
            success: true,
            message: 'Feedback event recorded successfully',
            eventId: feedbackDoc._id
        });
    } catch (error) {
        console.error('[telemetryController] Error recording feedback event:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
