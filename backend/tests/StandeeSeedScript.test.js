import test from 'node:test';
import assert from 'node:assert/strict';
import {
    parseArgs,
    formatStandeeCsv,
    seedStandeesBatch
} from '../scripts/seedStandees.js';

// ==========================================
// 1. parseArgs Tests
// ==========================================
test('parseArgs parses --count 50 --batch indore-02 --dry-run correctly', () => {
    const args = ['--count', '50', '--batch', 'indore-02', '--dry-run'];
    const parsed = parseArgs(args);

    assert.equal(parsed.count, 50);
    assert.equal(parsed.batch, 'indore-02');
    assert.equal(parsed.dryRun, true);
    assert.equal(parsed.exportCsv, null);
});

test('parseArgs applies sensible defaults when no flags are passed', () => {
    const parsed = parseArgs([]);

    assert.equal(parsed.count, 20);
    assert.equal(parsed.batch, 'batch-01');
    assert.equal(parsed.dryRun, false);
    assert.equal(parsed.exportCsv, null);
});

test('parseArgs parses --export-csv with path correctly', () => {
    const args = ['--export-csv', './printer-batch-01.csv'];
    const parsed = parseArgs(args);

    assert.equal(parsed.exportCsv, './printer-batch-01.csv');
    assert.equal(parsed.count, 20);
    assert.equal(parsed.dryRun, false);
});

test('parseArgs supports = format flags (--count=35 --batch=bhopal-01 --export-csv=out.csv)', () => {
    const args = ['--count=35', '--batch=bhopal-01', '--export-csv=out.csv', '--dry-run'];
    const parsed = parseArgs(args);

    assert.equal(parsed.count, 35);
    assert.equal(parsed.batch, 'bhopal-01');
    assert.equal(parsed.exportCsv, 'out.csv');
    assert.equal(parsed.dryRun, true);
});

test('parseArgs throws error when --count is not a positive integer', () => {
    assert.throws(() => parseArgs(['--count', 'invalid']), /Invalid --count/);
    assert.throws(() => parseArgs(['--count', '-10']), /Invalid --count/);
    assert.throws(() => parseArgs(['--count', '0']), /Invalid --count/);
});

// ==========================================
// 2. formatStandeeCsv Tests
// ==========================================
test('formatStandeeCsv produces valid CSV with headers kit_code,short_id,redirect_url,status,batch_id', () => {
    const items = [
        {
            kit_code: 'A7K92P',
            short_id: 'ST-ABC12345',
            status: 'unclaimed',
            batch_id: 'indore-salon-01'
        },
        {
            kit_code: 'B8M34X',
            short_id: 'ST-XYZ67890',
            status: 'unclaimed',
            batch_id: 'indore-salon-01'
        }
    ];

    const csv = formatStandeeCsv(items, { baseUrl: 'https://qrvibe.in' });
    const lines = csv.trim().split('\n');

    assert.equal(lines[0], 'kit_code,short_id,redirect_url,status,batch_id');
    assert.equal(lines.length, 3);
    assert.equal(lines[1], 'A7K92P,ST-ABC12345,https://qrvibe.in/r/ST-ABC12345,unclaimed,indore-salon-01');
    assert.equal(lines[2], 'B8M34X,ST-XYZ67890,https://qrvibe.in/r/ST-XYZ67890,unclaimed,indore-salon-01');
});

test('formatStandeeCsv returns single header line when items array is empty', () => {
    const csv = formatStandeeCsv([], { baseUrl: 'http://localhost:5000' });
    assert.equal(csv.trim(), 'kit_code,short_id,redirect_url,status,batch_id');
});

// ==========================================
// 3. seedStandeesBatch Tests with Mock Models
// ==========================================
test('seedStandeesBatch in dry-run mode generates preview items without saving to DB', async () => {
    let qrCreated = false;
    let kitCreated = false;

    const mockQRCode = {
        create: async () => {
            qrCreated = true;
        }
    };
    const mockStandeeKit = {
        create: async () => {
            kitCreated = true;
        }
    };

    const result = await seedStandeesBatch(
        { count: 5, batch: 'test-dry-run', dryRun: true },
        { QRCode: mockQRCode, StandeeKit: mockStandeeKit }
    );

    assert.equal(result.dryRun, true);
    assert.equal(result.count, 5);
    assert.equal(result.batchId, 'test-dry-run');
    assert.equal(result.items.length, 5);
    assert.equal(qrCreated, false);
    assert.equal(kitCreated, false);
});

test('seedStandeesBatch with mock models correctly prepares linked StandeeKit and QRCode records', async () => {
    const createdQRCodes = [];
    const createdKits = [];

    let mockIdCounter = 1;
    const mockQRCode = {
        create: async (data) => {
            const doc = { _id: `qr-id-${mockIdCounter++}`, ...data };
            createdQRCodes.push(doc);
            return doc;
        }
    };

    const mockStandeeKit = {
        create: async (data) => {
            const doc = { _id: `kit-id-${mockIdCounter++}`, ...data };
            createdKits.push(doc);
            return doc;
        }
    };

    const mockEnv = {
        FRONTEND_URL: 'https://app.qrvibe.in',
        BASE_URL: 'https://qrvibe.in'
    };

    const result = await seedStandeesBatch(
        { count: 3, batch: 'indore-batch-01', dryRun: false },
        {
            QRCode: mockQRCode,
            StandeeKit: mockStandeeKit,
            env: mockEnv
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.dryRun, false);
    assert.equal(result.count, 3);
    assert.equal(createdQRCodes.length, 3);
    assert.equal(createdKits.length, 3);

    for (let i = 0; i < 3; i++) {
        const qr = createdQRCodes[i];
        const kit = createdKits[i];

        // QRCode assertions
        assert.equal(qr.isActivated, false);
        assert.equal(qr.isActive, true);
        assert.equal(qr.qr_type, 'MENU');
        assert.ok(qr.kit_code);
        assert.ok(qr.short_id.startsWith('ST-'));
        assert.equal(qr.target_url, `https://app.qrvibe.in/activate/${qr.kit_code}`);

        // StandeeKit assertions
        assert.equal(kit.status, 'unclaimed');
        assert.equal(kit.batch_id, 'indore-batch-01');
        assert.equal(kit.kit_code, qr.kit_code);
        assert.equal(kit.short_id, qr.short_id);
        assert.equal(kit.assigned_qr_id, qr._id);
    }
});

test('seedStandeesBatch exports CSV when exportCsv option is provided', async () => {
    let writtenFile = null;
    let writtenContent = null;

    const mockFs = {
        writeFileSync: (path, content) => {
            writtenFile = path;
            writtenContent = content;
        }
    };

    const result = await seedStandeesBatch(
        { count: 4, batch: 'csv-test', dryRun: true, exportCsv: './exports/standees.csv' },
        { fs: mockFs, env: { BASE_URL: 'https://qrvibe.in' } }
    );

    assert.equal(result.csvPath, './exports/standees.csv');
    assert.equal(writtenFile, './exports/standees.csv');
    assert.ok(writtenContent.startsWith('kit_code,short_id,redirect_url,status,batch_id\n'));
    const rows = writtenContent.trim().split('\n');
    assert.equal(rows.length, 5); // 1 header + 4 rows
});
