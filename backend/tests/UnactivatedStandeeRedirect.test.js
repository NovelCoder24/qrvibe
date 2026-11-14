import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { resolveUnactivatedRedirect, redirectQR, handleRedirect } from '../controllers/redirectController.js';
import { QRCode } from '../models/QRCode.js';
import { env } from '../config/env.js';

// Helper mock response
function createMockRes() {
    return {
        statusCode: 200,
        redirectUrl: null,
        body: null,
        redirect(first, second) {
            if (typeof first === 'number') {
                this.statusCode = first;
                this.redirectUrl = second;
            } else {
                this.statusCode = 302;
                this.redirectUrl = first;
            }
            return this;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(data) {
            this.body = data;
            return this;
        }
    };
}

describe('resolveUnactivatedRedirect', () => {
    test('routes unactivated standee QR to frontend activation page using kit_code', () => {
        const qr = {
            short_id: 'STAND-01',
            isActivated: false,
            kit_code: 'BOX-01'
        };
        const target = resolveUnactivatedRedirect(qr, 'https://qrvibe.in');
        assert.equal(target, 'https://qrvibe.in/activate/BOX-01');
    });

    test('falls back to short_id if kit_code is missing or empty', () => {
        const qr = {
            short_id: 'ST-9281',
            isActivated: false
        };
        const target = resolveUnactivatedRedirect(qr, 'https://qrvibe.in');
        assert.equal(target, 'https://qrvibe.in/activate/ST-9281');
    });

    test('trims trailing slashes from frontendUrl and encodes special characters', () => {
        const qr = {
            short_id: 'ST-SPACE 1',
            isActivated: false
        };
        const target = resolveUnactivatedRedirect(qr, 'https://qrvibe.in///');
        assert.equal(target, 'https://qrvibe.in/activate/ST-SPACE%201');
    });

    test('returns null for active activated QRs', () => {
        const qr = {
            short_id: 'MENU-99',
            isActivated: true,
            kit_code: 'BOX-01'
        };
        const target = resolveUnactivatedRedirect(qr, 'https://qrvibe.in');
        assert.equal(target, null);
    });

    test('returns null when isActivated is undefined', () => {
        const qr = {
            short_id: 'MENU-99'
        };
        const target = resolveUnactivatedRedirect(qr, 'https://qrvibe.in');
        assert.equal(target, null);
    });

    test('returns null when qr is null or undefined', () => {
        assert.equal(resolveUnactivatedRedirect(null, 'https://qrvibe.in'), null);
        assert.equal(resolveUnactivatedRedirect(undefined, 'https://qrvibe.in'), null);
    });
});

describe('handleRedirect (Hot Path Unactivated Standee Interceptor)', () => {
    test('redirects immediately with 302 to activation target when qr.isActivated === false', async () => {
        const req = {
            params: { shortId: 'ST-UNACTIVATED' },
            headers: { 'user-agent': 'Mozilla/5.0' },
            query: {}
        };
        const res = createMockRes();

        const mockQr = {
            _id: new mongoose.Types.ObjectId(),
            short_id: 'ST-UNACTIVATED',
            kit_code: 'BOX-88',
            isActivated: false,
            isActive: true
        };

        const mockQRCode = {
            findOne: (query) => ({
                populate: async () => {
                    if (query.short_id === 'ST-UNACTIVATED') return mockQr;
                    return null;
                }
            })
        };

        const handler = handleRedirect || redirectQR;
        await handler(req, res, { QRCode: mockQRCode });

        assert.equal(res.statusCode, 302);
        const expectedBase = (env.FRONTEND_URL || '').replace(/\/+$/, '');
        assert.equal(res.redirectUrl, `${expectedBase}/activate/BOX-88`);
    });

    test('redirects with fallback to short_id if kit_code is not present', async () => {
        const req = {
            params: { shortId: 'ST-SHORTID-ONLY' },
            headers: { 'user-agent': 'Mozilla/5.0' },
            query: {}
        };
        const res = createMockRes();

        const mockQr = {
            _id: new mongoose.Types.ObjectId(),
            short_id: 'ST-SHORTID-ONLY',
            isActivated: false,
            isActive: true
        };

        const mockQRCode = {
            findOne: (query) => ({
                populate: async () => mockQr
            })
        };

        const handler = handleRedirect || redirectQR;
        await handler(req, res, { QRCode: mockQRCode });

        assert.equal(res.statusCode, 302);
        const expectedBase = (env.FRONTEND_URL || '').replace(/\/+$/, '');
        assert.equal(res.redirectUrl, `${expectedBase}/activate/ST-SHORTID-ONLY`);
    });
});

describe('QRCode Schema (isActivated and kit_code support)', () => {
    test('allows pre-printed unactivated standee QR to exist without user_id', () => {
        const qr = new QRCode({
            short_id: 'ST-PREPRINT-01',
            target_url: 'https://placeholder.qrvibe.in',
            isActivated: false,
            kit_code: 'BOX-77'
        });

        const err = qr.validateSync();
        assert.equal(err, undefined);
        assert.equal(qr.isActivated, false);
        assert.equal(qr.kit_code, 'BOX-77');
    });

    test('requires user_id when isActivated is true or defaulted', () => {
        const qr = new QRCode({
            short_id: 'ST-STANDARD-01',
            target_url: 'https://qrvibe.in',
            isActivated: true
        });

        const err = qr.validateSync();
        assert.notEqual(err, undefined);
        assert.ok(err.errors.user_id);
    });

    test('sanitizes kit_code to uppercase and trimmed', () => {
        const qr = new QRCode({
            short_id: 'ST-SAN-01',
            target_url: 'https://qrvibe.in',
            isActivated: false,
            kit_code: '  box-42  '
        });

        assert.equal(qr.kit_code, 'BOX-42');
    });
});
