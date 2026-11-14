import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKitCode, generateStandeeBatch, KIT_CHARSET } from '../utils/standeeGenerator.js';
import { StandeeKit } from '../models/StandeeKit.js';

test('KIT_CHARSET excludes ambiguous characters (0, O, 1, I)', () => {
    assert.equal(KIT_CHARSET.includes('0'), false);
    assert.equal(KIT_CHARSET.includes('O'), false);
    assert.equal(KIT_CHARSET.includes('1'), false);
    assert.equal(KIT_CHARSET.includes('I'), false);
    assert.equal(KIT_CHARSET.length, 32);
});

test('generateKitCode generates clean 6-character uppercase alphanumeric code without ambiguous characters', () => {
    for (let i = 0; i < 20; i++) {
        const code = generateKitCode();
        assert.equal(code.length, 6);
        assert.match(code, /^[2-9A-HJ-NP-Z]{6}$/); // Excludes 0, O, 1, I
    }
});

test('generateKitCode respects custom length parameter', () => {
    const code8 = generateKitCode(8);
    assert.equal(code8.length, 8);
    assert.match(code8, /^[2-9A-HJ-NP-Z]{8}$/);
});

test('generateStandeeBatch generates distinct collision-free codes and short IDs', () => {
    const batch = generateStandeeBatch(25, 'indore-salon-01');
    assert.equal(batch.length, 25);
    const codes = new Set(batch.map(k => k.kit_code));
    const shortIds = new Set(batch.map(k => k.short_id));
    assert.equal(codes.size, 25);
    assert.equal(shortIds.size, 25);
    assert.equal(batch[0].batch_id, 'indore-salon-01');
    assert.equal(batch[0].status, 'unclaimed');
    assert.ok(batch[0].short_id.startsWith('ST-'));
});

test('generateStandeeBatch works with default parameters', () => {
    const batch = generateStandeeBatch();
    assert.equal(batch.length, 10);
    assert.equal(batch[0].batch_id, 'batch-01');
    assert.equal(batch[0].status, 'unclaimed');
    assert.ok(batch[0].short_id.startsWith('ST-'));
});

test('StandeeKit schema validates valid kit document with defaults', () => {
    const kit = new StandeeKit({
        kit_code: 'A7K92P',
        short_id: 'ST-ABC12345'
    });
    const error = kit.validateSync();
    assert.equal(error, undefined);
    assert.equal(kit.status, 'unclaimed');
    assert.equal(kit.station_label, 'Counter Standee');
    assert.equal(kit.batch_id, 'batch-01');
    assert.equal(kit.assigned_user_id, null);
    assert.equal(kit.assigned_qr_id, null);
    assert.equal(kit.activated_at, null);
});

test('StandeeKit schema requires kit_code and short_id', () => {
    const kitWithoutCode = new StandeeKit({ short_id: 'ST-12345678' });
    const err1 = kitWithoutCode.validateSync();
    assert.ok(err1);
    assert.ok(err1.errors.kit_code);

    const kitWithoutShortId = new StandeeKit({ kit_code: 'A7K92P' });
    const err2 = kitWithoutShortId.validateSync();
    assert.ok(err2);
    assert.ok(err2.errors.short_id);
});

test('StandeeKit schema validates status enum', () => {
    ['unclaimed', 'activated', 'disabled'].forEach(status => {
        const kit = new StandeeKit({
            kit_code: 'A7K92P',
            short_id: 'ST-12345678',
            status
        });
        assert.equal(kit.validateSync(), undefined);
    });

    const invalidKit = new StandeeKit({
        kit_code: 'A7K92P',
        short_id: 'ST-12345678',
        status: 'pending_payment'
    });
    const err = invalidKit.validateSync();
    assert.ok(err);
    assert.ok(err.errors.status);
});

test('StandeeKit converts kit_code to uppercase and trims', () => {
    const kit = new StandeeKit({
        kit_code: '  a7k92p  ',
        short_id: '  ST-12345678  '
    });
    assert.equal(kit.kit_code, 'A7K92P');
    assert.equal(kit.short_id, 'ST-12345678');
});
