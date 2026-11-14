import test from 'node:test';
import assert from 'node:assert/strict';
import { getDemoSalonData, seedDemoSalon } from '../scripts/seedDemoSalon.js';

test('getDemoSalonData returns structured Aura Hair & Spa salon with 8 services and 3 stylists', () => {
    const data = getDemoSalonData();
    assert.equal(data.user.name, 'Aura Hair & Spa, Indore');
    assert.equal(data.user.businessCategory, 'salon');
    assert.equal(data.qr.short_id, 'aura-salon');
    assert.equal(data.qr.metadata.businessCategory, 'salon');

    const allItems = data.qr.metadata.categories.flatMap(c => c.items);
    assert.equal(allItems.length, 8);
    assert.ok(allItems.some(item => item.name.includes('Keratin')));
    assert.ok(allItems.some(item => item.name.includes('HydraFacial')));
    assert.ok(allItems.some(item => item.name.includes('Global Hair Colour')));
    assert.ok(data.stylists.some(s => s.includes('Riya')));
    assert.ok(data.stylists.some(s => s.includes('Rahul')));
    assert.ok(data.stylists.some(s => s.includes('Pooja')));
});

test('seedDemoSalon in dry-run mode returns payload without saving to DB', async () => {
    const result = await seedDemoSalon({ dryRun: true });
    assert.equal(result.success, true);
    assert.equal(result.dryRun, true);
    assert.equal(result.data.qr.short_id, 'aura-salon');
});

test('seedDemoSalon with mock models correctly upserts User, StandeeKit, and QRCode', async () => {
    const calls = [];
    const mockUser = {
        findOneAndUpdate: async (filter, update) => {
            calls.push({ model: 'User', filter, update });
            return { _id: 'user_aura_123', ...update };
        }
    };
    const mockKit = {
        findOneAndUpdate: async (filter, update) => {
            calls.push({ model: 'StandeeKit', filter, update });
            return { _id: 'kit_box01_123', ...update };
        }
    };
    const mockQR = {
        findOneAndUpdate: async (filter, update) => {
            calls.push({ model: 'QRCode', filter, update });
            return { _id: 'qr_aura_123', ...update };
        }
    };

    const result = await seedDemoSalon({
        dryRun: false,
        models: { User: mockUser, StandeeKit: mockKit, QRCode: mockQR }
    });

    assert.equal(result.success, true);
    assert.equal(calls.length, 3);
    assert.equal(calls[0].model, 'User');
    assert.equal(calls[1].model, 'QRCode');
    assert.equal(calls[2].model, 'StandeeKit');
});
