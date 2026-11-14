import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { QRCode } from '../models/QRCode.js';
import { StandeeKit } from '../models/StandeeKit.js';

export const getDemoSalonData = () => {
    return {
        user: {
            email: 'aura.indore@qrvibe.in',
            name: 'Aura Hair & Spa, Indore',
            businessCategory: 'salon',
            workspaceMode: 'storefront',
            phone: '9876543210'
        },
        stylists: ['Riya (Senior Stylist)', 'Rahul (Creative Director)', 'Pooja (Skin & Bridal)'],
        qr: {
            short_id: 'aura-salon',
            kit_code: 'BOX-01',
            qr_type: 'MENU',
            accessMode: 'dynamic_active',
            isActive: true,
            isActivated: true,
            target_url: `${env.FRONTEND_URL}/s/aura-salon`,
            placement: {
                city: 'Indore',
                region: 'Madhya Pradesh',
                country: 'India',
                country_code: 'IN',
                label: 'Reception Counter'
            },
            metadata: {
                businessCategory: 'salon',
                title: 'Aura Hair & Spa',
                restaurantName: 'Aura Hair & Spa, Indore',
                menuTemplate: 'immersive',
                googleReviewUrl: 'https://maps.app.goo.gl/aurasalon',
                shieldPhone: '9876543210',
                resolutionOffer: '20% off your next visit & direct resolution',
                enableReviewBooster: true,
                categories: [
                    {
                        id: 'cat-hair',
                        name: 'Hair Colour & Spa',
                        items: [
                            {
                                id: 'svc-keratin',
                                name: "L'Oréal Keratin Smooth Treatment",
                                price: 2499,
                                description: 'Formaldehyde-free intensive smoothing & frizz control for silky, salon-finish hair.',
                                duration: '60 mins',
                                brandUsed: "L'Oréal Professionnel",
                                targetGender: 'for_her',
                                isSpecial: true,
                                img: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=80'
                            },
                            {
                                id: 'svc-colour',
                                name: 'Global Hair Colour & Gloss',
                                price: 3400,
                                description: 'Full coverage rich ammonia-free tone with high-shine gloss reflection.',
                                duration: '120 mins',
                                brandUsed: 'Majirel / Inoa',
                                targetGender: 'unisex',
                                isSpecial: false,
                                img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
                            },
                            {
                                id: 'svc-moroccan',
                                name: 'Moroccanoil Deep Hydration Hair Spa',
                                price: 1800,
                                description: 'Argan oil infused deep conditioning steam ritual for damaged or coloured hair.',
                                duration: '45 mins',
                                brandUsed: 'Moroccanoil',
                                targetGender: 'for_her',
                                isSpecial: false,
                                img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80'
                            }
                        ]
                    },
                    {
                        id: 'cat-skin',
                        name: 'Facials & Skin Care',
                        items: [
                            {
                                id: 'svc-hydra',
                                name: 'Medical-Grade HydraFacial Glow',
                                price: 2100,
                                description: '4-step deep vortex cleansing, painless extraction, peptide infusion and LED light therapy.',
                                duration: '45 mins',
                                brandUsed: 'HydraFacial MD',
                                targetGender: 'unisex',
                                isSpecial: true,
                                img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
                            },
                            {
                                id: 'svc-o3',
                                name: 'O3+ Bridal Radiance D-Tan & Facial',
                                price: 2800,
                                description: 'Oxygenating brightening therapy for instant luminous complexion and tan reduction.',
                                duration: '60 mins',
                                brandUsed: 'O3+ Professional',
                                targetGender: 'for_her',
                                isSpecial: false,
                                img: 'https://images.unsplash.com/photo-1512290900672-1f55862d98c2?w=800&auto=format&fit=crop&q=80'
                            }
                        ]
                    },
                    {
                        id: 'cat-styling',
                        name: 'Bridal & Styling',
                        items: [
                            {
                                id: 'svc-bridal-pkg',
                                name: 'Pre-Bridal Luxury Grooming Package',
                                price: 4999,
                                description: 'Complete body polish, bridal facial, luxury mani-pedi and hair restructuring ritual.',
                                duration: '3 hours',
                                brandUsed: 'Dyson & Kérastase',
                                targetGender: 'for_her',
                                isSpecial: true,
                                img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80'
                            },
                            {
                                id: 'svc-fade',
                                name: "Men's Precision Fade & Beard Sculpting",
                                price: 450,
                                description: 'Hot towel prep, razor sharp gradient taper, beard oil hydration and styling.',
                                duration: '30 mins',
                                brandUsed: 'Wahl Professional',
                                targetGender: 'for_him',
                                isSpecial: false,
                                img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80'
                            }
                        ]
                    },
                    {
                        id: 'cat-nails',
                        name: 'Nails & Lashes',
                        items: [
                            {
                                id: 'svc-gel-nails',
                                name: 'Gel Nail Extensions & Chrome Art',
                                price: 1200,
                                description: 'Full cover sculpted tips, chip-resistant gel polish and mirror chrome glaze finish.',
                                duration: '60 mins',
                                brandUsed: 'OPI / Bluesky',
                                targetGender: 'for_her',
                                isSpecial: false,
                                img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80'
                            }
                        ]
                    }
                ]
            }
        }
    };
};

export const seedDemoSalon = async ({ dryRun = false, models = {} } = {}) => {
    const data = getDemoSalonData();

    if (dryRun) {
        return { success: true, dryRun: true, data };
    }

    const UserModel = models.User || User;
    const QRModel = models.QRCode || QRCode;
    const KitModel = models.StandeeKit || StandeeKit;

    // 1. Upsert Demo User
    const user = await UserModel.findOneAndUpdate(
        { email: data.user.email },
        {
            $set: {
                ...data.user,
                // placeholder hashed password if creating new
                password: '$2a$10$YourHashedPasswordPlaceholderForDemo1234'
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. Upsert QRCode
    const qr = await QRModel.findOneAndUpdate(
        { short_id: data.qr.short_id },
        {
            $set: {
                ...data.qr,
                user_id: user._id
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. Upsert StandeeKit
    const kit = await KitModel.findOneAndUpdate(
        { kit_code: data.qr.kit_code },
        {
            $set: {
                kit_code: data.qr.kit_code,
                short_id: data.qr.short_id,
                batch_id: 'indore-salon-demo',
                station_label: 'Reception Counter',
                status: 'activated',
                assigned_user_id: user._id,
                assigned_qr_id: qr._id,
                activated_at: new Date()
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
        success: true,
        dryRun: false,
        user,
        qr,
        kit,
        demoUrl: `${env.FRONTEND_URL}/s/aura-salon`,
        shortUrl: `${env.BASE_URL}/r/aura-salon`
    };
};

// Direct script execution
const isMain = process.argv[1] && (process.argv[1].endsWith('seedDemoSalon.js') || process.argv[1].includes('seedDemoSalon'));
if (isMain) {
    const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
    
    (async () => {
        try {
            console.log(`\n💈 Seeding Aura Hair & Spa Demo Salon (${isDryRun ? 'DRY RUN' : 'MONGODB'})...`);
            if (!isDryRun) {
                await mongoose.connect(env.MONGO_URI);
                console.log(' Connected to MongoDB:', env.MONGO_URI.replace(/\/\/.*@/, '//***@'));
            }

            const res = await seedDemoSalon({ dryRun: isDryRun });
            console.log('\n✅ Demo Salon Seed Complete!');
            console.log(' Salon:', res.user?.name || res.data?.user?.name);
            console.log(' Lookbook URL:', res.demoUrl || `${env.FRONTEND_URL}/s/aura-salon`);
            console.log(' Standee Redirect:', res.shortUrl || `${env.BASE_URL}/r/aura-salon`);
            console.log(' Kit Code:', 'BOX-01');
            console.log(' Services Seeded: 8 top services across 4 categories');
            console.log(' Stylists: Riya, Rahul, Pooja\n');

            if (!isDryRun) {
                await mongoose.disconnect();
            }
            process.exit(0);
        } catch (err) {
            console.error('\n❌ Error seeding demo salon:', err.message);
            process.exit(1);
        }
    })();
}
