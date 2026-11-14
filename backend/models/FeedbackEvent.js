import mongoose from 'mongoose';

const feedbackEventSchema = new mongoose.Schema({
    qr_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        index: true
    },
    short_id: {
        type: String,
        trim: true,
        index: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    eventType: {
        type: String,
        enum: ['google_redirect', 'private_feedback'],
        required: true,
        index: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    staffName: {
        type: String,
        trim: true,
        default: null
    },
    serviceOrDish: {
        type: String,
        trim: true,
        default: null
    },
    reviewDraft: {
        type: String,
        default: null
    },
    issues: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    userAgent: {
        type: String,
        default: null
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet', 'unknown'],
        default: 'unknown'
    }
}, { timestamps: true });

feedbackEventSchema.index({ owner_id: 1, createdAt: -1 });
feedbackEventSchema.index({ qr_id: 1, eventType: 1, createdAt: -1 });

export const FeedbackEvent = mongoose.model('FeedbackEvent', feedbackEventSchema);
