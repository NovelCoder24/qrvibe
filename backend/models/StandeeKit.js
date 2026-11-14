import mongoose from 'mongoose';

const standeeKitSchema = new mongoose.Schema({
    kit_code: {
        type: String,
        required: [true, 'Kit code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    short_id: {
        type: String,
        required: [true, 'Short ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    status: {
        type: String,
        enum: ['unclaimed', 'activated', 'disabled'],
        default: 'unclaimed',
        index: true
    },
    station_label: {
        type: String,
        default: 'Counter Standee',
        trim: true
    },
    batch_id: {
        type: String,
        default: 'batch-01',
        index: true
    },
    assigned_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },
    assigned_qr_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        default: null,
        index: true
    },
    activated_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export const StandeeKit = mongoose.models.StandeeKit || mongoose.model('StandeeKit', standeeKitSchema);
