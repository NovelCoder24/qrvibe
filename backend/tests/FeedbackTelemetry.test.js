import test from 'node:test';
import assert from 'node:assert/strict';
import { FeedbackEvent } from '../models/FeedbackEvent.js';
import { QRCode } from '../models/QRCode.js';
import { DailyScanStats } from '../models/DailyScanStats.js';
import { recordFeedbackEvent } from '../controllers/telemetryController.js';

test('FeedbackEvent schema validates a 5-star google_redirect event', () => {
    const event = new FeedbackEvent({
        short_id: 'testShort12',
        eventType: 'google_redirect',
        rating: 5,
        staffName: 'Riya',
        serviceOrDish: 'Keratin',
        reviewDraft: 'Had a wonderful 5-star experience with Riya!',
        deviceType: 'mobile'
    });

    const error = event.validateSync();
    assert.equal(error, undefined);
    assert.equal(event.eventType, 'google_redirect');
    assert.equal(event.rating, 5);
    assert.equal(event.staffName, 'Riya');
});

test('FeedbackEvent schema validates a 1-3 star private_feedback complaint event', () => {
    const event = new FeedbackEvent({
        short_id: 'testShort34',
        eventType: 'private_feedback',
        rating: 2,
        issues: ['Wait time', 'Staff responsiveness'],
        notes: 'Appointment was delayed by 30 minutes.',
        deviceType: 'mobile'
    });

    const error = event.validateSync();
    assert.equal(error, undefined);
    assert.equal(event.eventType, 'private_feedback');
    assert.equal(event.rating, 2);
    assert.equal(event.issues.length, 2);
    assert.equal(event.notes, 'Appointment was delayed by 30 minutes.');
});

test('FeedbackEvent schema rejects invalid eventType', () => {
    const event = new FeedbackEvent({
        eventType: 'invalid_event_type',
        rating: 5
    });

    const error = event.validateSync();
    assert.ok(error);
    assert.ok(error.errors.eventType);
});

test('FeedbackEvent schema rejects rating outside 1-5 range', () => {
    const event = new FeedbackEvent({
        eventType: 'google_redirect',
        rating: 6
    });

    const error = event.validateSync();
    assert.ok(error);
    assert.ok(error.errors.rating);
});

test('QRCode schema supports google_redirects, private_feedback, and staff_mentions counters', () => {
    const qr = new QRCode({
        user_id: '507f191e810c19729de860ea',
        short_id: 'testTlmQ1',
        target_url: 'https://qrvibe.in/s/salon',
        qr_type: 'MENU',
        stats: {
            total_scans: 10,
            google_redirects: 5,
            private_feedback: 2,
            staff_mentions: { Riya: 3, Pooja: 2 }
        }
    });

    assert.equal(qr.stats.google_redirects, 5);
    assert.equal(qr.stats.private_feedback, 2);
    assert.equal(qr.stats.staff_mentions.get('Riya'), 3);
});

test('DailyScanStats schema supports daily google_redirects and private_feedback counters', () => {
    const daily = new DailyScanStats({
        qr_id: '507f191e810c19729de860ea',
        date: '2026-11-13',
        total_scans: 40,
        unique_scans: 25,
        google_redirects: 8,
        private_feedback: 1,
        staff_reviews: { Riya: 4, Rahul: 4 }
    });

    assert.equal(daily.google_redirects, 8);
    assert.equal(daily.private_feedback, 1);
    assert.equal(daily.staff_reviews.get('Riya'), 4);
});

test('recordFeedbackEvent rejects missing or invalid eventType with 400', async () => {
    let statusCode = 0;
    let responseBody = null;

    const req = {
        body: { eventType: 'bogus_type' },
        params: {},
        headers: {}
    };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            responseBody = data;
            return this;
        }
    };

    await recordFeedbackEvent(req, res);
    assert.equal(statusCode, 400);
    assert.ok(responseBody.message.includes('Invalid eventType'));
});
