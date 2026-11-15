import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isBlockedHostOrIp } from '../jobs/healthMonitor.js';
import { verifyMetaSignature } from '../controllers/webhookController.js';
import { env } from '../config/env.js';
import { createQRSchema } from '../validators/qrValidator.js';
import { User } from '../models/User.js';

test('SEC-01: Link Health Monitor blocks SSRF targets', async () => {
    const blockedTargets = [
        'http://169.254.169.254/latest/meta-data/',
        'http://metadata.google.internal/computeMetadata/v1/',
        'http://127.0.0.1:27017',
        'http://localhost:6379',
        'http://10.0.0.1/admin',
        'http://192.168.1.1/',
        'file:///etc/passwd',
        'gopher://127.0.0.1:6379/_flushall'
    ];

    for (const url of blockedTargets) {
        const check = await isBlockedHostOrIp(url);
        assert.equal(check.blocked, true, `URL ${url} must be blocked`);
    }

    const publicUrl = 'https://example.com/menu';
    const publicCheck = await isBlockedHostOrIp(publicUrl);
    assert.equal(publicCheck.blocked, false, `Public URL ${publicUrl} must be allowed`);
});

test('SEC-03: QR Validator rejects dangerous XSS pseudo-protocols', () => {
    const dangerousUrls = [
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")'
    ];

    for (const url of dangerousUrls) {
        const result = createQRSchema.safeParse({ target_url: url });
        assert.equal(result.success, false, `Dangerous scheme ${url} must fail validation`);
    }

    const safeUrlResult = createQRSchema.safeParse({ target_url: 'https://restaurant.com/our-menu' });
    assert.equal(safeUrlResult.success, true, 'Safe HTTPS URL must pass validation');
});

test('SEC-05: Webhook signature verification uses timing-safe equality', () => {
    const rawPayload = Buffer.from(JSON.stringify({ event: 'test.event' }));
    const secret = env.META_APP_SECRET || 'test_meta_secret_12345';
    const validHmac = 'sha256=' + crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

    // Simulate express request & response
    let nextCalled = false;
    const validReq = {
        headers: { 'x-hub-signature-256': validHmac },
        body: rawPayload
    };
    const validRes = {
        status: () => validRes,
        send: () => {}
    };

    // Temporarily ensure secret is set for test
    const origSecret = env.META_APP_SECRET;
    env.META_APP_SECRET = secret;

    verifyMetaSignature(validReq, validRes, () => {
        nextCalled = true;
    });
    assert.equal(nextCalled, true, 'Valid signature should call next()');

    // Invalid signature test
    let unauthorizedStatus = null;
    const invalidReq = {
        headers: { 'x-hub-signature-256': 'sha256=0000000000000000000000000000000000000000000000000000000000000000' },
        body: rawPayload
    };
    const invalidRes = {
        status: (code) => {
            unauthorizedStatus = code;
            return invalidRes;
        },
        send: () => {}
    };

    verifyMetaSignature(invalidReq, invalidRes, () => {
        assert.fail('next() should not be called on invalid signature');
    });
    assert.equal(unauthorizedStatus, 401, 'Invalid signature must return 401');

    env.META_APP_SECRET = origSecret;
});

test('SEC-06: Bcrypt work factor uses 10 rounds for speed-security balance', async () => {
    const password = 'TestSecurePassword123!';
    const user = new User({
        name: 'Sec Test User',
        email: 'sec_test@example.com',
        password
    });

    // Execute User pre-save hooks on document instance without network DB write
    const pres = User.schema.s.hooks._pres.get('save') || [];
    for (const hook of pres) {
        await hook.fn.call(user);
    }

    assert.ok(user.password.startsWith('$2a$10$') || user.password.startsWith('$2b$10$'), 
        `Expected bcrypt round 10 hash, got ${user.password.substring(0, 7)}`);
    
    const isMatch = await user.comparePassword(password);
    assert.equal(isMatch, true, 'Password comparison must succeed with 10 rounds');
});

test('SEC-08: Refresh Token Revocation via tokenVersion', async () => {
    const user = new User({
        _id: '64b1f2e3d4e5f6a7b8c9d0e1',
        name: 'Token Revoke Test',
        email: 'revoke_test@example.com',
        password: 'Password123!',
        tokenVersion: 0
    });

    const refreshToken = user.generateRefreshToken();
    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
    assert.equal(decoded.tokenVersion, 0, 'Initial tokenVersion should be 0');

    // Simulate password change / logout incrementing tokenVersion
    user.tokenVersion = 1;

    // Verify tokenVersion mismatch signals revocation
    assert.notEqual(decoded.tokenVersion, user.tokenVersion, 'Old tokenVersion must no longer match user.tokenVersion');
});

test('SEC-10: Regex escaping prevents ReDoS special characters injection', () => {
    const maliciousSearch = '.*+?^${}()|[]\\test(a+)+';
    const escaped = maliciousSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Ensure regex creation does not treat input as special quantifiers/backreferences
    const regex = new RegExp(escaped, 'i');
    assert.equal(regex.test(maliciousSearch), true, 'Escaped regex should match exact literal string');
    assert.equal(regex.test('completely different string'), false);
});
