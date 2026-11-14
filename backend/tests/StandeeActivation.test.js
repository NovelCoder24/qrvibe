import test from 'node:test';
import assert from 'node:assert/strict';
import {
    verifyKitCodeHandler,
    activateStandeeHandler,
    getMyStandeesHandler
} from '../controllers/standeeController.js';

// Helper mock response
function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        }
    };
}

// ==========================================
// 1. verifyKitCodeHandler Tests
// ==========================================
test('verifyKitCodeHandler returns valid: true for unclaimed kit code', async () => {
    const req = { params: { code: 'A7K92P' } };
    const res = createMockRes();

    const mockKit = {
        kit_code: 'A7K92P',
        short_id: 'ST-100001',
        status: 'unclaimed',
        station_label: 'Counter Standee'
    };

    const mockStandeeKit = {
        findOne: async (query) => {
            if (query.kit_code === 'A7K92P') return mockKit;
            return null;
        }
    };

    await verifyKitCodeHandler(req, res, { StandeeKit: mockStandeeKit });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.valid, true);
    assert.equal(res.body.status, 'unclaimed');
    assert.equal(res.body.kitCode, 'A7K92P');
    assert.equal(res.body.shortId, 'ST-100001');
    assert.equal(res.body.stationLabel, 'Counter Standee');
    assert.equal(res.body.isClaimed, false);
});

test('verifyKitCodeHandler sanitizes input (lowercase and whitespace)', async () => {
    const req = { params: { code: '  a7k92p  ' } };
    const res = createMockRes();

    let queriedCode = null;
    const mockStandeeKit = {
        findOne: async (query) => {
            queriedCode = query.kit_code;
            return {
                kit_code: 'A7K92P',
                short_id: 'ST-100001',
                status: 'unclaimed',
                station_label: 'Counter Standee'
            };
        }
    };

    await verifyKitCodeHandler(req, res, { StandeeKit: mockStandeeKit });

    assert.equal(queriedCode, 'A7K92P');
    assert.equal(res.body.valid, true);
});

test('verifyKitCodeHandler returns valid: true and isClaimed: true for activated kit', async () => {
    const req = { params: { code: 'CLAIMD' } };
    const res = createMockRes();

    const mockStandeeKit = {
        findOne: async () => ({
            kit_code: 'CLAIMD',
            short_id: 'ST-100002',
            status: 'activated',
            station_label: 'Mirror 1'
        })
    };

    await verifyKitCodeHandler(req, res, { StandeeKit: mockStandeeKit });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.valid, true);
    assert.equal(res.body.status, 'activated');
    assert.equal(res.body.isClaimed, true);
});

test('verifyKitCodeHandler returns 404 for unknown kit code', async () => {
    const req = { params: { code: 'UNKNOWN' } };
    const res = createMockRes();

    const mockStandeeKit = {
        findOne: async () => null
    };

    await verifyKitCodeHandler(req, res, { StandeeKit: mockStandeeKit });

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.valid, false);
    assert.match(res.body.message, /not found/i);
});

test('verifyKitCodeHandler returns 400 for empty or missing code parameter', async () => {
    const req = { params: {} };
    const res = createMockRes();

    await verifyKitCodeHandler(req, res, { StandeeKit: { findOne: async () => null } });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.valid, false);
});

// ==========================================
// 2. activateStandeeHandler Tests
// ==========================================
test('activateStandeeHandler successfully claims kit atomically and configures new QRCode', async () => {
    const req = {
        user: { _id: 'user_salon_001', name: 'Aura Salon Studio', businessCategory: 'salon' },
        body: {
            kitCode: 'a7k92p',
            stationLabel: 'Mirror Station 2',
            salonName: 'Aura Studio & Spa',
            googleReviewUrl: 'https://g.page/r/aurastudio/review',
            shieldPhone: '+919876543210',
            resolutionOffer: 'Free head massage on your next booking',
            rateCard: {
                categories: [
                    {
                        id: 'cat_hair',
                        name: 'Hair Cuts & Styling',
                        items: [
                            { id: 'item_1', name: 'Precision Fade', price: 600, duration: '45m', brandUsed: 'Schwarzkopf', targetGender: 'for_him' }
                        ]
                    }
                ]
            }
        }
    };
    const res = createMockRes();

    let updatedKitDoc = {
        _id: 'kit_doc_001',
        kit_code: 'A7K92P',
        short_id: 'ST-100001',
        status: 'activated',
        station_label: 'Mirror Station 2',
        assigned_user_id: 'user_salon_001',
        assigned_qr_id: null,
        activated_at: new Date(),
        save: async function () { return this; }
    };

    let qrSaved = null;

    class MockQRCodeInstance {
        constructor(data = {}) {
            Object.assign(this, {
                _id: 'qr_doc_999',
                short_id: data.short_id,
                stats: { total_scans: 0 },
                metadata: {}
            }, data);
        }
        async save() {
            qrSaved = this;
            return this;
        }
    }

    const mockStandeeKit = {
        findOneAndUpdate: async (filter, update) => {
            if (filter.kit_code === 'A7K92P' && filter.status === 'unclaimed') {
                return updatedKitDoc;
            }
            return null;
        },
        findOne: async () => updatedKitDoc
    };

    const mockQRCode = MockQRCodeInstance;
    mockQRCode.findOne = async () => null; // QR does not exist yet; will be created
    mockQRCode.findById = async () => null;

    await activateStandeeHandler(req, res, { StandeeKit: mockStandeeKit, QRCode: mockQRCode });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /activated successfully/i);
    assert.ok(res.body.liveUrl);
    assert.ok(res.body.menuUrl);

    // Verify QR configuration
    assert.ok(qrSaved);
    assert.equal(qrSaved.user_id, 'user_salon_001');
    assert.equal(qrSaved.short_id, 'ST-100001');
    assert.equal(qrSaved.isActive, true);
    assert.equal(qrSaved.isActivated, true);
    assert.equal(qrSaved.qr_type, 'MENU');
    assert.equal(qrSaved.placement.label, 'Mirror Station 2');
    assert.equal(qrSaved.placement.country, 'India');
    assert.equal(qrSaved.placement.country_code, 'IN');

    // Verify Salon Lookbook Metadata
    assert.equal(qrSaved.metadata.businessCategory, 'salon');
    assert.equal(qrSaved.metadata.title, 'Aura Studio & Spa');
    assert.equal(qrSaved.metadata.restaurantName, 'Aura Studio & Spa');
    assert.equal(qrSaved.metadata.googleReviewUrl, 'https://g.page/r/aurastudio/review');
    assert.equal(qrSaved.metadata.shieldPhone, '+919876543210');
    assert.equal(qrSaved.metadata.resolutionOffer, 'Free head massage on your next booking');
    assert.equal(qrSaved.metadata.enableReviewBooster, true);
    assert.equal(qrSaved.metadata.categories.length, 1);
    assert.equal(qrSaved.metadata.categories[0].items[0].name, 'Precision Fade');

    // Verify updatedKit received assigned_qr_id
    assert.equal(updatedKitDoc.assigned_qr_id, 'qr_doc_999');
});

test('activateStandeeHandler rejects already activated kit with 409 Conflict', async () => {
    const req = {
        user: { _id: 'user_attacker' },
        body: { kitCode: 'A7K92P', stationLabel: 'Mirror 1' }
    };
    const res = createMockRes();

    const mockStandeeKit = {
        findOneAndUpdate: async () => null, // Atomic claim condition failed
        findOne: async () => ({
            kit_code: 'A7K92P',
            status: 'activated',
            assigned_user_id: 'user_legit_owner'
        })
    };

    await activateStandeeHandler(req, res, { StandeeKit: mockStandeeKit, QRCode: {} });

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already.*activated/i);
});

test('activateStandeeHandler returns 404 when kit does not exist', async () => {
    const req = {
        user: { _id: 'user_123' },
        body: { kitCode: 'DOESNOTEXIST' }
    };
    const res = createMockRes();

    const mockStandeeKit = {
        findOneAndUpdate: async () => null,
        findOne: async () => null
    };

    await activateStandeeHandler(req, res, { StandeeKit: mockStandeeKit, QRCode: {} });

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not found/i);
});

test('activateStandeeHandler returns 401 when user is not authenticated', async () => {
    const req = {
        user: null,
        body: { kitCode: 'A7K92P' }
    };
    const res = createMockRes();

    await activateStandeeHandler(req, res, {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
});

test('activateStandeeHandler supports linking to existingQrId', async () => {
    const req = {
        user: { _id: 'user_salon_001', name: 'Luxe Salon' },
        body: {
            kitCode: 'A7K92P',
            stationLabel: 'Mirror 4',
            existingQrId: 'qr_existing_555'
        }
    };
    const res = createMockRes();

    const updatedKitDoc = {
        _id: 'kit_doc_001',
        kit_code: 'A7K92P',
        short_id: 'ST-100001',
        status: 'activated',
        assigned_user_id: 'user_salon_001',
        save: async function () { return this; }
    };

    const existingQrDoc = {
        _id: 'qr_existing_555',
        short_id: 'EXISTING-SHORT',
        user_id: 'user_salon_001',
        metadata: {
            businessCategory: 'salon',
            title: 'Luxe Salon Lookbook',
            categories: [{ name: 'Bridal' }]
        }
    };

    let qrSaved = null;
    class MockQRCodeInstance {
        constructor(data = {}) {
            Object.assign(this, {
                _id: 'qr_doc_new_st',
                short_id: data.short_id
            }, data);
        }
        async save() {
            qrSaved = this;
            return this;
        }
    }

    const mockStandeeKit = {
        findOneAndUpdate: async () => updatedKitDoc,
        findOne: async () => updatedKitDoc
    };

    const mockQRCode = MockQRCodeInstance;
    mockQRCode.findById = async (id) => null;
    mockQRCode.findOne = async (filter) => {
        if (filter._id === 'qr_existing_555') return existingQrDoc;
        return null;
    };

    await activateStandeeHandler(req, res, { StandeeKit: mockStandeeKit, QRCode: mockQRCode });

    assert.equal(res.statusCode, 200);
    assert.ok(qrSaved);
    assert.match(qrSaved.target_url, /EXISTING-SHORT/);
    assert.equal(qrSaved.metadata.title, 'Luxe Salon Lookbook');
});

// ==========================================
// 3. getMyStandeesHandler Tests
// ==========================================
test('getMyStandeesHandler returns standees for authenticated merchant', async () => {
    const req = { user: { _id: 'user_salon_001' } };
    const res = createMockRes();

    const mockStandeesList = [
        {
            kit_code: 'A7K92P',
            short_id: 'ST-100001',
            status: 'activated',
            station_label: 'Reception',
            assigned_qr_id: { _id: 'qr_1', short_id: 'ST-100001', stats: { total_scans: 42 } }
        },
        {
            kit_code: 'B8M31X',
            short_id: 'ST-100002',
            status: 'activated',
            station_label: 'Mirror 1',
            assigned_qr_id: { _id: 'qr_2', short_id: 'ST-100002', stats: { total_scans: 15 } }
        }
    ];

    const mockStandeeKit = {
        find: (query) => {
            assert.equal(query.assigned_user_id, 'user_salon_001');
            return {
                populate: (field) => {
                    assert.equal(field, 'assigned_qr_id');
                    return {
                        sort: (sortObj) => mockStandeesList
                    };
                }
            };
        }
    };

    await getMyStandeesHandler(req, res, { StandeeKit: mockStandeeKit });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.standees.length, 2);
    assert.equal(res.body.standees[0].station_label, 'Reception');
});

test('getMyStandeesHandler rejects unauthenticated request with 401', async () => {
    const req = { user: null };
    const res = createMockRes();

    await getMyStandeesHandler(req, res, {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
});
