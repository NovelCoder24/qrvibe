import { StandeeKit } from '../models/StandeeKit.js';
import { QRCode } from '../models/QRCode.js';
import { env } from '../config/env.js';

/**
 * Public Verification Endpoint:
 * Validates a physical standee kit code before claiming.
 * Route: GET /api/standees/verify/:code
 */
export async function verifyKitCodeHandler(req, res, deps = {}) {
    try {
        const rawCode = req.params?.code;
        if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
            return res.status(400).json({ valid: false, message: 'Kit code is required' });
        }

        const code = rawCode.trim().toUpperCase();
        const StandeeKitModel = deps.StandeeKit || StandeeKit;

        const kit = await StandeeKitModel.findOne({ kit_code: code });

        if (!kit) {
            return res.status(404).json({ valid: false, message: 'Kit code not found' });
        }

        return res.json({
            valid: true,
            status: kit.status,
            kitCode: kit.kit_code,
            shortId: kit.short_id,
            stationLabel: kit.station_label,
            isClaimed: kit.status === 'activated'
        });
    } catch (error) {
        console.error('Error verifying kit code:', error);
        return res.status(500).json({ valid: false, message: 'Internal server error verifying kit code' });
    }
}

/**
 * Protected Atomic Activation Endpoint:
 * Claims the standee kit atomically, binds it to the authenticated merchant,
 * and initializes or updates the linked QRCode with rate card lookbook metadata.
 * Route: POST /api/standees/activate
 */
export async function activateStandeeHandler(req, res, deps = {}) {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const {
            kitCode,
            stationLabel,
            salonName,
            rateCard,
            googleReviewUrl,
            shieldPhone,
            resolutionOffer,
            existingQrId
        } = req.body || {};

        if (!kitCode || typeof kitCode !== 'string' || !kitCode.trim()) {
            return res.status(400).json({ success: false, message: 'Kit code is required' });
        }

        const code = kitCode.trim().toUpperCase();
        const cleanLabel = (stationLabel && stationLabel.trim()) || 'Counter Standee';

        const StandeeKitModel = deps.StandeeKit || StandeeKit;
        const QRCodeModel = deps.QRCode || QRCode;

        // 1. ATOMIC CLAIM: Only transitions from 'unclaimed' to prevent double-claim race conditions
        const updatedKit = await StandeeKitModel.findOneAndUpdate(
            { kit_code: code, status: 'unclaimed' },
            {
                $set: {
                    status: 'activated',
                    station_label: cleanLabel,
                    assigned_user_id: req.user._id,
                    activated_at: new Date()
                }
            },
            { new: true }
        );

        if (!updatedKit) {
            // Distinguish already activated vs non-existent kit
            const existingKit = await StandeeKitModel.findOne({ kit_code: code });
            if (!existingKit) {
                return res.status(404).json({ success: false, message: 'Kit code not found' });
            }
            if (existingKit.status !== 'unclaimed') {
                return res.status(409).json({ success: false, message: 'This standee kit has already been activated' });
            }
            return res.status(409).json({ success: false, message: 'Standee kit cannot be activated' });
        }

        // 2. LINK / INITIALIZE QRCODE
        let qr = null;
        if (updatedKit.assigned_qr_id) {
            qr = await QRCodeModel.findById(updatedKit.assigned_qr_id);
        }
        if (!qr && updatedKit.short_id) {
            qr = await QRCodeModel.findOne({ short_id: updatedKit.short_id });
        }
        if (!qr) {
            qr = new QRCodeModel({
                short_id: updatedKit.short_id
            });
        }

        qr.user_id = req.user._id;
        qr.isActive = true;
        qr.isActivated = true;
        qr.qr_type = 'MENU';
        qr.placement = {
            ...(qr.placement || {}),
            label: cleanLabel,
            country: 'India',
            country_code: 'IN'
        };

        const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
        const baseUrl = env.BASE_URL || 'http://localhost:5000';

        if (existingQrId) {
            let existingQr = null;
            try {
                existingQr = await QRCodeModel.findOne({ _id: existingQrId, user_id: req.user._id });
            } catch (err) {
                // Ignore CastError if existingQrId is not a valid ObjectId
            }

            if (existingQr) {
                qr.target_url = `${frontendUrl}/menu/${existingQr.short_id}`;
                qr.metadata = {
                    businessCategory: existingQr.metadata?.businessCategory || req.user.businessCategory || 'salon',
                    title: existingQr.metadata?.title || salonName || req.user.name || 'Salon Lookbook',
                    restaurantName: existingQr.metadata?.restaurantName || salonName || req.user.name || 'Salon Lookbook',
                    categories: existingQr.metadata?.categories || rateCard?.categories || [],
                    googleReviewUrl: googleReviewUrl || existingQr.metadata?.googleReviewUrl || '',
                    shieldPhone: shieldPhone || existingQr.metadata?.shieldPhone || '',
                    resolutionOffer: resolutionOffer || existingQr.metadata?.resolutionOffer || '20% off your next visit',
                    enableReviewBooster: true
                };
            } else {
                qr.target_url = `${frontendUrl}/menu/${qr.short_id}`;
                qr.metadata = {
                    businessCategory: req.user.businessCategory || 'salon',
                    title: salonName || req.user.name || 'Salon Lookbook',
                    restaurantName: salonName || req.user.name || 'Salon Lookbook',
                    categories: rateCard?.categories || [],
                    googleReviewUrl: googleReviewUrl || '',
                    shieldPhone: shieldPhone || '',
                    resolutionOffer: resolutionOffer || '20% off your next visit',
                    enableReviewBooster: true
                };
            }
        } else {
            qr.target_url = `${frontendUrl}/menu/${qr.short_id}`;
            qr.metadata = {
                businessCategory: req.user.businessCategory || 'salon',
                title: salonName || req.user.name || 'Salon Lookbook',
                restaurantName: salonName || req.user.name || 'Salon Lookbook',
                categories: rateCard?.categories || [],
                googleReviewUrl: googleReviewUrl || '',
                shieldPhone: shieldPhone || '',
                resolutionOffer: resolutionOffer || '20% off your next visit',
                enableReviewBooster: true
            };
        }

        await qr.save();

        // 3. PERSIST BIDIRECTIONAL RELATIONSHIP
        if (!updatedKit.assigned_qr_id || String(updatedKit.assigned_qr_id) !== String(qr._id)) {
            updatedKit.assigned_qr_id = qr._id;
            await updatedKit.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Standee activated successfully',
            standee: updatedKit,
            qr,
            liveUrl: `${baseUrl}/r/${qr.short_id}`,
            menuUrl: `${frontendUrl}/menu/${qr.short_id}`
        });
    } catch (error) {
        console.error('Error activating standee:', error);
        return res.status(500).json({ success: false, message: 'Internal server error activating standee' });
    }
}

/**
 * Protected Merchant Standees Endpoint:
 * Retrieves all standees registered to the authenticated user.
 * Route: GET /api/standees/my-standees
 */
export async function getMyStandeesHandler(req, res, deps = {}) {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const StandeeKitModel = deps.StandeeKit || StandeeKit;
        const standees = await StandeeKitModel.find({ assigned_user_id: req.user._id })
            .populate('assigned_qr_id')
            .sort({ activated_at: -1 });

        return res.json({ success: true, standees });
    } catch (error) {
        console.error('Error fetching merchant standees:', error);
        return res.status(500).json({ success: false, message: 'Internal server error fetching standees' });
    }
}
