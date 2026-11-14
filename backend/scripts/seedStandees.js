#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { StandeeKit } from '../models/StandeeKit.js';
import { QRCode } from '../models/QRCode.js';
import { generateStandeeBatch } from '../utils/standeeGenerator.js';

/**
 * Parses command-line arguments for the standee seed CLI.
 * @param {string[]} argv Command-line arguments array.
 * @returns {{ count: number, batch: string, exportCsv: string|null, dryRun: boolean }}
 */
export function parseArgs(argv = []) {
    const result = {
        count: 20,
        batch: 'batch-01',
        exportCsv: null,
        dryRun: false
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--help' || arg === '-h') {
            console.log(`
Usage: node seedStandees.js [options]

Options:
  --count, -c <number>        Number of standees to generate (default: 20)
  --batch, -b <string>        Production batch ID (default: 'batch-01')
  --export-csv, --csv <path>  Save CSV file for print vendor
  --dry-run, -d               Simulate generation without writing to database
  --help, -h                  Show help message
`);
            process.exit(0);
        } else if (arg === '--dry-run' || arg === '-d') {
            result.dryRun = true;
        } else if (arg === '--count' || arg === '-c') {
            const val = argv[++i];
            const parsed = parseInt(val, 10);
            if (Number.isNaN(parsed) || parsed <= 0) {
                throw new Error(`Invalid --count: "${val}". Must be a positive integer.`);
            }
            result.count = parsed;
        } else if (arg.startsWith('--count=')) {
            const val = arg.slice(arg.indexOf('=') + 1);
            const parsed = parseInt(val, 10);
            if (Number.isNaN(parsed) || parsed <= 0) {
                throw new Error(`Invalid --count: "${val}". Must be a positive integer.`);
            }
            result.count = parsed;
        } else if (arg === '--batch' || arg === '-b') {
            const val = argv[++i];
            if (!val || val.startsWith('-')) {
                throw new Error('Missing value for --batch');
            }
            result.batch = val;
        } else if (arg.startsWith('--batch=')) {
            result.batch = arg.slice(arg.indexOf('=') + 1);
        } else if (arg === '--export-csv' || arg === '--csv') {
            const val = argv[++i];
            if (!val || val.startsWith('-')) {
                throw new Error('Missing path for --export-csv');
            }
            result.exportCsv = val;
        } else if (arg.startsWith('--export-csv=') || arg.startsWith('--csv=')) {
            result.exportCsv = arg.slice(arg.indexOf('=') + 1);
        }
    }

    return result;
}

/**
 * Formats a list of standee kit items into standard CSV text.
 * @param {Array<{ kit_code: string, short_id: string, redirect_url?: string, status?: string, batch_id?: string }>} items
 * @param {{ baseUrl?: string, env?: object }} options
 * @returns {string} CSV text
 */
export function formatStandeeCsv(items = [], options = {}) {
    const baseUrl = options.baseUrl || (options.env?.BASE_URL) || (env && env.BASE_URL) || 'http://localhost:5000';
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

    const headers = ['kit_code', 'short_id', 'redirect_url', 'status', 'batch_id'];
    const rows = items.map(item => {
        const redirectUrl = item.redirect_url || `${cleanBaseUrl}/r/${item.short_id}`;
        return [
            item.kit_code,
            item.short_id,
            redirectUrl,
            item.status || 'unclaimed',
            item.batch_id || 'batch-01'
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates and seeds a batch of physical standee kits and unactivated QR codes.
 * Supports dry-run execution and dependency injection for unit testing.
 * @param {{ count?: number, batch?: string, batchId?: string, dryRun?: boolean, exportCsv?: string|null, items?: Array }} options
 * @param {{ QRCode?: object, StandeeKit?: object, env?: object, fs?: object, generateStandeeBatch?: Function }} deps
 * @returns {Promise<{ success: boolean, dryRun: boolean, count: number, batchId: string, items: Array, standees: Array, qrs: Array, csvContent: string|null, csvPath: string|null }>}
 */
export async function seedStandeesBatch(options = {}, deps = {}) {
    const count = options.count ?? 20;
    const batchId = options.batch || options.batchId || 'batch-01';
    const dryRun = Boolean(options.dryRun);
    const exportCsvPath = options.exportCsv || null;

    const configEnv = deps.env || env;
    const frontendUrl = (configEnv.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const baseUrl = (configEnv.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

    const QRCodeModel = deps.QRCode || QRCode;
    const StandeeKitModel = deps.StandeeKit || StandeeKit;
    const fsModule = deps.fs || fs;
    const batchGenerator = deps.generateStandeeBatch || generateStandeeBatch;

    // Generate collision-free batch
    const items = options.items || batchGenerator(count, batchId);

    // If dry run, do not write to MongoDB
    if (dryRun) {
        let csvContent = null;
        if (exportCsvPath && fsModule) {
            csvContent = formatStandeeCsv(items, { baseUrl });
            const dir = path.dirname(exportCsvPath);
            if (dir && dir !== '.' && typeof fsModule.mkdirSync === 'function') {
                try {
                    fsModule.mkdirSync(dir, { recursive: true });
                } catch (e) {
                    // Ignore directory creation errors if existing
                }
            }
            fsModule.writeFileSync(exportCsvPath, csvContent, 'utf8');
        }

        return {
            success: true,
            dryRun: true,
            count: items.length,
            batchId,
            items,
            standees: [],
            qrs: [],
            csvContent,
            csvPath: exportCsvPath
        };
    }

    // Persist to MongoDB
    const createdQrs = [];
    const createdStandees = [];

    for (const item of items) {
        // 1. Create unactivated QRCode
        const qrPayload = {
            short_id: item.short_id,
            kit_code: item.kit_code,
            qr_type: 'MENU',
            target_url: `${frontendUrl}/activate/${item.kit_code}`,
            isActivated: false,
            isActive: true,
            accessMode: 'dynamic_active'
        };

        let qr;
        if (typeof QRCodeModel.create === 'function') {
            qr = await QRCodeModel.create(qrPayload);
        } else {
            qr = new QRCodeModel(qrPayload);
            if (typeof qr.save === 'function') await qr.save();
        }

        // 2. Create StandeeKit record linked to qr._id
        const standeePayload = {
            kit_code: item.kit_code,
            short_id: item.short_id,
            batch_id: item.batch_id || batchId,
            status: item.status || 'unclaimed',
            station_label: 'Counter Standee',
            assigned_qr_id: qr._id
        };

        let kit;
        if (typeof StandeeKitModel.create === 'function') {
            kit = await StandeeKitModel.create(standeePayload);
        } else {
            kit = new StandeeKitModel(standeePayload);
            if (typeof kit.save === 'function') await kit.save();
        }

        createdQrs.push(qr);
        createdStandees.push(kit);
    }

    let csvContent = null;
    if (exportCsvPath && fsModule) {
        csvContent = formatStandeeCsv(items, { baseUrl });
        const dir = path.dirname(exportCsvPath);
        if (dir && dir !== '.' && typeof fsModule.mkdirSync === 'function') {
            try {
                fsModule.mkdirSync(dir, { recursive: true });
            } catch (e) {
                // Ignore directory creation errors if existing
            }
        }
        fsModule.writeFileSync(exportCsvPath, csvContent, 'utf8');
    }

    return {
        success: true,
        dryRun: false,
        count: createdStandees.length,
        batchId,
        items,
        standees: createdStandees,
        qrs: createdQrs,
        csvContent,
        csvPath: exportCsvPath
    };
}

/**
 * Main CLI entrypoint.
 */
export async function main() {
    try {
        const options = parseArgs(process.argv.slice(2));

        console.log('\n🚀 QRVibe Physical Standee Batch Generator');
        console.log('============================================');
        console.log(`📦 Batch ID:   ${options.batch}`);
        console.log(`🔢 Quantity:   ${options.count}`);
        console.log(`🛠️ Mode:       ${options.dryRun ? 'DRY-RUN (Simulated)' : 'PRODUCTION SEED'}`);
        if (options.exportCsv) {
            console.log(`📄 CSV Export: ${options.exportCsv}`);
        }
        console.log('--------------------------------------------');

        if (!options.dryRun) {
            console.log('🔌 Connecting to MongoDB...');
            await mongoose.connect(env.MONGO_URI);
            console.log('✅ Connected to MongoDB.');
        }

        const result = await seedStandeesBatch(options);

        console.log('\n📋 Generated Standees Summary:');
        const summaryTable = (result.items || []).slice(0, 15).map(item => ({
            'Kit Code': item.kit_code,
            'Short ID': item.short_id,
            'Batch ID': item.batch_id,
            'Status': item.status,
            'Redirect URL': `${(env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '')}/r/${item.short_id}`
        }));
        console.table(summaryTable);
        if (result.count > 15) {
            console.log(`... and ${result.count - 15} more standees.`);
        }

        if (options.exportCsv) {
            console.log(`\n💾 Printer CSV saved to: ${options.exportCsv}`);
        }

        if (!options.dryRun) {
            console.log(`\n✨ Successfully seeded ${result.count} standee kits and unactivated QR codes into MongoDB!`);
            await mongoose.disconnect();
            console.log('🔒 Disconnected from MongoDB cleanly.');
        } else {
            console.log(`\n✨ Dry-run preview completed successfully for ${result.count} kits. No database changes were made.`);
        }

        return result;
    } catch (error) {
        console.error('\n❌ Error executing seedStandees script:', error.message || error);
        if (mongoose.connection && mongoose.connection.readyState !== 0) {
            try {
                await mongoose.disconnect();
            } catch (err) {
                // Ignore disconnect errors during fatal exit
            }
        }
        process.exit(1);
    }
}

// Auto-run if executed directly
const currentFilePath = fileURLToPath(import.meta.url);
const executedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedFilePath === currentFilePath || (process.argv[1] && process.argv[1].endsWith('seedStandees.js'))) {
    main();
}
