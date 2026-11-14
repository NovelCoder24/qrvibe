import crypto from 'node:crypto';

/**
 * 32-character unambiguous uppercase alphanumeric charset.
 * Excludes easily confusable characters: 0 (zero), O (capital o), 1 (one), I (capital i).
 */
export const KIT_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates an unambiguous alphanumeric code for physical standee kits.
 * @param {number} length Default is 6 characters.
 * @returns {string} Clean uppercase code.
 */
export function generateKitCode(length = 6) {
    let result = '';
    const charsetLen = KIT_CHARSET.length;
    for (let i = 0; i < length; i++) {
        const idx = crypto.randomInt(0, charsetLen);
        result += KIT_CHARSET[idx];
    }
    return result;
}

/**
 * Generates an unambiguous short ID prefixed with 'ST-'.
 * @param {number} length Number of random characters after 'ST-'. Default 8.
 * @returns {string} e.g. 'ST-7B9MNP42'
 */
export function generateStandeeShortId(length = 8) {
    let result = '';
    const charsetLen = KIT_CHARSET.length;
    for (let i = 0; i < length; i++) {
        const idx = crypto.randomInt(0, charsetLen);
        result += KIT_CHARSET[idx];
    }
    return `ST-${result}`;
}

/**
 * Generates a batch of distinct, collision-free standee kit objects.
 * @param {number} count Number of kits to generate (default: 10).
 * @param {string} batchId Identifier for the production batch (default: 'batch-01').
 * @returns {Array<{ kit_code: string, short_id: string, batch_id: string, status: string }>}
 */
export function generateStandeeBatch(count = 10, batchId = 'batch-01') {
    const items = [];
    const usedCodes = new Set();
    const usedShortIds = new Set();

    while (items.length < count) {
        const code = generateKitCode(6);
        const shortId = generateStandeeShortId(8);

        if (!usedCodes.has(code) && !usedShortIds.has(shortId)) {
            usedCodes.add(code);
            usedShortIds.add(shortId);
            items.push({
                kit_code: code,
                short_id: shortId,
                batch_id: batchId,
                status: 'unclaimed'
            });
        }
    }

    return items;
}
