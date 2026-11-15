import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { qrcode } from '../utils/qrcode.js';
import { parseMenuPhotos } from '../api/axios';
import { findCatalogImage, getDefaultImageForVertical } from '../utils/imageCatalog';
import '../styles/StorefrontDashboard.css';

/* ==============================================================================
   VOCABULARY & DICTIONARIES (Salon, Cafe, Clinic)
   ============================================================================== */
const VOC = {
  salon: {
    name: 'Salon & Spa',
    blurb: 'Hair, skin, bridal, nails',
    tpl: 'salon rate card',
    nav: 'Lookbook & Offers',
    t2: 'Lookbook & Rate Card',
    ban: 'Pinned festive & bridal banner',
    lb: 'Top stylists this month',
    lbS: 'Staff leaderboard',
    pre: 'Stylist · ',
    chip: 'Service chips',
    mod: 'Show “onwards”',
    sig: 'Signature',
    nm: 'Salon name',
    ph: 'Add stylist, e.g. Pooja',
    role: 'stylists',
    rate: 'Rate your stylist'
  },
  cafe: {
    name: 'Cafe & Bakery',
    blurb: 'Coffee, food, bakes',
    tpl: 'café menu',
    nav: 'Menu & Specials',
    t2: 'Visual Menu & Specials',
    ban: 'Pinned chef’s special & combo',
    lb: 'Top staff mentions',
    lbS: 'Staff mentions',
    pre: 'Server · ',
    chip: 'Dish chips',
    mod: 'Mark as “Bestseller”',
    sig: 'Chef’s pick',
    nm: 'Café name',
    ph: 'Add server, e.g. Pooja',
    role: 'servers',
    rate: 'Rate your meal'
  },
  clinic: {
    name: 'Clinic',
    blurb: 'Skin, dental, aesthetics',
    tpl: 'treatment & fee guide',
    nav: 'Treatments & Fees',
    t2: 'Treatment & Fee Guide',
    ban: 'Pinned clinic package & timings',
    lb: 'Doctor & specialist mentions',
    lbS: 'Doctor leaderboard',
    pre: 'Dr. ',
    chip: 'Treatment chips',
    mod: 'Show “consultation onwards”',
    sig: 'Featured',
    nm: 'Clinic name',
    ph: 'Add doctor, e.g. Pooja',
    role: 'doctors',
    rate: 'Rate your visit'
  }
};

const ART = {
  hero: '<path class="sa" d="M20 100V50a30 30 0 0160 0v50"/><path class="sa" d="M32 100V54a18 18 0 0136 0v46"/><circle class="sf" cx="76" cy="20" r="6"/>',
  hair: '<path class="sa" d="M10 38c12-14 20 14 32 0s20 14 32 0 12 8 16 8"/><path class="sa" d="M10 56c12-14 20 14 32 0s20 14 32 0"/><path class="sa" d="M10 74c12-14 20 14 32 0s20 14 32 0"/>',
  face: '<circle class="sa" cx="50" cy="48" r="24"/><path class="sa" d="M40 55q10 10 20 0"/><circle class="sf" cx="42" cy="44" r="2.2"/><circle class="sf" cx="58" cy="44" r="2.2"/>',
  bride: '<path class="sa" d="M50 18l8 18 18 2-14 12 5 18-17-10-17 10 5-18-14-12 18-2z"/>',
  nails: '<ellipse class="sa" cx="26" cy="60" rx="8" ry="15"/><ellipse class="sa" cx="46" cy="52" rx="8" ry="17"/><ellipse class="sa" cx="66" cy="56" rx="8" ry="16"/><circle class="sf" cx="46" cy="40" r="3"/>',
  lash: '<path class="sa" d="M12 62q38-34 76 0"/><path class="sa" d="M22 55l-6-12M36 47l-3-14M50 44V29M64 47l3-14M78 55l6-12"/>',
  standee: '<rect class="sa" x="32" y="22" width="36" height="56" rx="4"/><rect class="sf" x="42" y="36" width="16" height="16"/>',
  cup: '<path class="sa" d="M28 40h40v22a14 14 0 01-14 14H42a14 14 0 01-14-14zM68 46h6a8 8 0 010 16h-6"/>',
  cross: '<path class="sa" d="M42 24h16v18h18v16H58v18H42V58H24V42h18z"/>'
};

const mk = (n, c, p, on, m, sig, a, img) => ({
  n,
  c,
  p,
  on,
  m,
  sig,
  av: 1,
  a,
  img: img || findCatalogImage(n, c, 'cafe')
});

const DEF = {
  salon: {
    cats: ['All', 'Hair Colour & Spa', 'Facials & Skin', 'Bridal', 'Nails & Lashes'],
    staff: [
      { n: 'Riya', k: 14 },
      { n: 'Rahul', k: 9 },
      { n: 'Simran', k: 5 },
      { n: 'Pooja', k: 3 }
    ],
    chips: ['Colour & gloss', 'Keratin', 'Facial', 'Bridal'],
    sv: [
      { n: "L’Oréal Keratin Smooth Treatment", c: 'Hair Colour & Spa', p: 2499, on: 1, m: '60 mins · L’Oréal Professionnel', sig: 1, av: 1, a: 'hair', i: 'svc-keratin', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80' },
      { n: 'Global Colour & Gloss', c: 'Hair Colour & Spa', p: 3400, on: 0, m: '120 mins', sig: 0, av: 1, a: 'hair', i: 'svc-colour', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
      { n: 'HydraFacial Glow', c: 'Facials & Skin', p: 2100, on: 0, m: '45 mins', sig: 0, av: 1, a: 'face', i: 'svc-facial', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
      { n: 'Pre-Bridal Glow Package', c: 'Bridal', p: 1999, on: 1, m: '3 hours', sig: 1, av: 1, a: 'bride', i: 'svc-bridal', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80' },
      { n: 'Gel Nail Art', c: 'Nails & Lashes', p: 850, on: 0, m: '60 mins', sig: 0, av: 1, a: 'nails', i: 'svc-nails', img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80' },
      { n: 'Lash Lift & Tint', c: 'Nails & Lashes', p: 1200, on: 0, m: '45 mins', sig: 0, av: 0, a: 'lash', i: 'svc-lash', img: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  cafe: {
    cats: ['All', 'Coffee', 'Mains', 'Bakes'],
    staff: [
      { n: 'Riya', k: 14 },
      { n: 'Rahul', k: 9 },
      { n: 'Simran', k: 5 },
      { n: 'Pooja', k: 3 }
    ],
    chips: ['Cold Brew', 'Truffle Pasta', 'Croissant', 'Signature Latte'],
    sv: [
      mk('Cold Brew', 'Coffee', 180, 0, 'Single origin', 1, 'cup', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'),
      mk('Signature Latte', 'Coffee', 220, 0, '12 oz', 0, 'cup', 'https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?auto=format&fit=crop&w=600&q=80'),
      mk('Truffle Pasta', 'Mains', 420, 1, 'Vegetarian', 1, 'standee', 'https://images.unsplash.com/photo-1621996346565-e3d5d62810b4?auto=format&fit=crop&w=600&q=80'),
      mk('Almond Croissant', 'Bakes', 160, 0, 'Baked fresh daily', 0, 'bride', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80')
    ]
  },
  clinic: {
    cats: ['All', 'Consultation', 'Skin', 'Laser'],
    staff: [
      { n: 'Riya', k: 14 },
      { n: 'Rahul', k: 9 },
      { n: 'Simran', k: 5 },
      { n: 'Pooja', k: 3 }
    ],
    chips: ['HydraFacial', 'Laser', 'Acne care', 'Consultation'],
    sv: [
      mk('General Consultation', 'Consultation', 500, 1, '15 mins', 0, 'cross', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'),
      mk('HydraFacial', 'Skin', 2500, 0, '45 mins', 1, 'face', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'),
      mk('Laser Hair Reduction', 'Laser', 3000, 1, 'Per session', 0, 'cross', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80')
    ]
  }
};

const KEY = 'qv-dash';
const UPI = 'yourvpa@upi';
const WA_PHONE = '91XXXXXXXXXX';

const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => (s || 'my-store').toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-store';

/* Level-H Real QR SVG Generator with Center Logo / Initial Monogram */
function generateQrSvg(url, storeName, logo) {
  try {
    const q = qrcode(0, 'H');
    q.addData(url);
    q.make();
    const n = q.getModuleCount();
    const m = n / 2;
    const hole = (x, y) => Math.hypot(x + 0.5 - m, y + 0.5 - m) <= n * 0.13;
    const dk = (x, y) => q.isDark(y, x) && !hole(x, y);
    let d = '';
    for (let y = 0; y < n; y++) {
      let x = 0;
      while (x < n) {
        if (dk(x, y)) {
          let w = 1;
          while (x + w < n && dk(x + w, y)) w++;
          d += `M${x} ${y}h${w}v1h-${w}z`;
          x += w;
        } else {
          x++;
        }
      }
    }
    const r = n * 0.115;
    const initial = esc((storeName || 'Q')[0].toUpperCase());
    const lg = logo
      ? `<clipPath id="lc"><circle cx="${m}" cy="${m}" r="${r}"/></clipPath><image href="${logo}" x="${m - r}" y="${m - r}" width="${2 * r}" height="${2 * r}" clip-path="url(#lc)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="${m}" cy="${m}" r="${r}" class="k"/><text x="${m}" y="${m + n * 0.045}" text-anchor="middle" font-size="${n * 0.13}" class="a" font-family="Instrument Serif,serif">${initial}</text>`;
    return `<svg viewBox="-4 -4 ${n + 8} ${n + 8}" role="img" aria-label="Scannable QR code for ${esc(url)}"><rect class="c" x="-4" y="-4" width="${n + 8}" height="${n + 8}"/><path d="${d}"/>${lg}</svg>`;
  } catch (err) {
    return `<svg viewBox="0 0 100 100"><rect class="c" width="100" height="100"/><text x="50" y="50" text-anchor="middle" class="k">QR</text></svg>`;
  }
}

/* Vector Artwork Component */
const ArtSvg = ({ artKey }) => {
  const content = ART[artKey] || ART.standee;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="sb" width="100" height="100" />
      <g dangerouslySetInnerHTML={{ __html: content }} />
    </svg>
  );
};

/* Google Review Parser */
function parseReviewLink(v) {
  if (!v) return '';
  v = v.trim();
  if (/^ChIJ[\w-]{8,}$/.test(v)) return 'https://search.google.com/local/writereview?placeid=' + v;
  try {
    const u = new URL(v);
    if (/(^|\.)(google\.com|g\.page|goo\.gl)$/.test(u.hostname)) return u.href;
  } catch (e) {}
  return '';
}

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth || {});

  // Main UI Tab: 0 = Overview, 1 = Lookbook/Menu, 2 = Reviews, 3 = Standee & Studio
  const [tab, setTab] = useState(0);

  // Active theme
  const [theme, setTheme] = useState('default');

  // Storefront & Vertical config
  const [storefront, setStorefront] = useState({
    isOnboarded: false,
    type: 'salon',
    fresh: false,
    kit: 'BOX-01',
    plan: 'trial',
    trialLeft: 5,
    review: ''
  });

  // Identity state
  const [storeName, setStoreName] = useState('Aura Hair & Spa');
  const [subtitle, setSubtitle] = useState('Hair, skin & bridal studio');
  const [receptionWhatsApp, setReceptionWhatsApp] = useState('9876543210');
  const [instagram, setInstagram] = useState('@aurahairspa');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('9876543210');
  const [digestWhatsApp, setDigestWhatsApp] = useState('9876543210');
  const [digestActive, setDigestActive] = useState(true);
  const [logo, setLogo] = useState(null);

  // Google Maps state
  const [googleUrl, setGoogleUrl] = useState('');
  const [googleMsg, setGoogleMsg] = useState('');

  // Kit hardware state
  const [kitEditing, setKitEditing] = useState(false);
  const [kitInput, setKitInput] = useState('');

  // Pinned festive banner state
  const [bannerActive, setBannerActive] = useState(true);
  const [offerTitle, setOfferTitle] = useState('Pre-Bridal & Festive Glow Package');
  const [offerPrice, setOfferPrice] = useState('₹1,999 onwards');
  const [offerDesc, setOfferDesc] = useState('Includes Hydra-Cleanup, Detan, Hair Spa & Manicure');

  // Categories, Services, Staff, Chips
  const [selectedCat, setSelectedCat] = useState('All');
  const [categories, setCategories] = useState(DEF.salon.cats);
  const [services, setServices] = useState(DEF.salon.sv);
  const [staff, setStaff] = useState(DEF.salon.staff);
  const [chips, setChips] = useState(DEF.salon.chips);
  const [newStaffInput, setNewStaffInput] = useState('');
  const [newChipInput, setNewChipInput] = useState('');

  // ROI count values
  const [roiScans, setRoiScans] = useState(0);
  const [roiGoogle, setRoiGoogle] = useState(0);
  const [roiFeedback, setRoiFeedback] = useState(0);

  // Modals & Sheets
  const [activeSheet, setActiveSheet] = useState(null); // 'svc' | 'cat' | 'stage' | 'upgrade' | 'guest' | null
  const [editingSvcIndex, setEditingSvcIndex] = useState(-1);
  const [svcForm, setSvcForm] = useState({ n: '', c: '', p: '', m: '', on: 0, sig: 0, img: '' });
  const [svcError, setSvcError] = useState('');

  const [newCatInput, setNewCatInput] = useState('');
  const [catError, setCatError] = useState('');

  const [stagedRows, setStagedRows] = useState([]);
  const [isStagingDemo, setIsStagingDemo] = useState(true);
  const [isStagingReading, setIsStagingReading] = useState(false);

  // Guest simulator state
  const [guestState, setGuestState] = useState({ star: 0, staff: '', svc: [], text: '', edited: false });

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    t: 'salon',
    nm: '',
    wa: '',
    g: '',
    st: ['', '', ''],
    mode: '',
    file: null,
    kit: ''
  });
  const [wizardError, setWizardError] = useState('');

  // Toast
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = msg => {
    setToastText(msg);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // Vocabulary for current vertical
  const v = VOC[storefront.type] || VOC.salon;

  // Store slug & Live URL
  const currentSlug = useMemo(() => slugify(storeName), [storeName]);
  const liveUrl = `https://qrvibe.in/s/${currentSlug}`;

  // Formatter for services
  const formatSvcPrice = s => {
    return inr(s.p) + (s.on ? (storefront.type === 'salon' ? ' onwards' : storefront.type === 'clinic' ? ' consultation onwards' : '') : '');
  };

  /* --------------------------------------------------------------------------
     INITIAL LOAD / HYDRATION
     -------------------------------------------------------------------------- */
  useEffect(() => {
    document.title = 'QRVibe · Storefront dashboard';
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.st) setStorefront(prev => ({ ...prev, ...d.st }));
        if (d.S) {
          if (d.S.cats) setCategories(d.S.cats);
          if (d.S.sv) {
            const vertical = d.st?.type || storefront.type || 'salon';
            const enriched = d.S.sv.map(s => ({
              ...s,
              img: s.img || findCatalogImage(s.n, s.c, vertical)
            }));
            setServices(enriched);
          }
          if (d.S.staff) setStaff(d.S.staff);
          if (d.S.chips) setChips(d.S.chips);
          if (d.S.logo) setLogo(d.S.logo);
          if (d.S.cat) setSelectedCat(d.S.cat);
        }
        if (d.v) {
          if (d.v.nm) setStoreName(d.v.nm);
          if (d.v.wa) setOwnerWhatsApp(d.v.wa);
          if (d.v.g) setGoogleUrl(d.v.g);
        }
        if (d.theme) setTheme(d.theme);
      } else {
        // Seed from Redux user if available
        if (user) {
          const nm = user.businessName || user.name || 'Aura Hair & Spa';
          setStoreName(nm);
          if (user.phone) setOwnerWhatsApp(user.phone);
          if (user.googleReviewUrl) setGoogleUrl(user.googleReviewUrl);
        }
        // First time visitor: launch setup wizard
        setWizardOpen(true);
      }
    } catch (e) {
      console.error('Failed to load dashboard state:', e);
    }
  }, []);

  /* --------------------------------------------------------------------------
     PERSISTENCE
     -------------------------------------------------------------------------- */
  const persistState = () => {
    try {
      const payload = {
        st: storefront,
        S: {
          type: storefront.type,
          cat: selectedCat,
          cats: categories,
          sv: services,
          staff,
          chips,
          logo
        },
        v: {
          nm: storeName,
          wa: ownerWhatsApp,
          g: googleUrl
        },
        theme
      };
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch (e) {}
  };

  useEffect(() => {
    persistState();
  }, [storefront, categories, services, staff, chips, logo, storeName, ownerWhatsApp, googleUrl, theme, selectedCat]);

  /* --------------------------------------------------------------------------
     ANIMATED COUNTERS ON TAB 0
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (tab === 0) {
      const targetScans = storefront.fresh ? 0 : 342;
      const targetGoogle = storefront.fresh ? 0 : 28;
      const targetFeedback = storefront.fresh ? 0 : 3;

      const t0 = performance.now();
      const duration = 1100;

      let rafId;
      const animate = t => {
        const k = Math.min(1, (t - t0) / duration);
        const ease = 1 - Math.pow(1 - k, 3);
        setRoiScans(Math.round(targetScans * ease));
        setRoiGoogle(Math.round(targetGoogle * ease));
        setRoiFeedback(Math.round(targetFeedback * ease));
        if (k < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };
      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
    }
  }, [tab, storefront.fresh]);

  /* --------------------------------------------------------------------------
     RANKING CALCULATIONS
     -------------------------------------------------------------------------- */
  const sortedStaff = useMemo(() => {
    return [...staff].sort((a, b) => b.k - a.k);
  }, [staff]);

  const maxK = useMemo(() => {
    return Math.max(1, ...staff.map(s => s.k));
  }, [staff]);

  /* --------------------------------------------------------------------------
     WHATSAPP LINKS
     -------------------------------------------------------------------------- */
  const lbWhatsAppHref = useMemo(() => {
    const text = sortedStaff.map((s, i) => `${i + 1}. ${v.pre}${s.n}: ${s.k} reviews`).join('\n');
    return 'https://wa.me/?text=' + encodeURIComponent(`${v.lbS} this month\n${text}`);
  }, [sortedStaff, v]);

  const shareLiveWhatsAppHref = useMemo(() => {
    return 'https://wa.me/?text=' + encodeURIComponent(`Book and browse at ${storeName}: ${liveUrl}`);
  }, [storeName, liveUrl]);

  const orderTagsWhatsAppHref = useMemo(() => {
    return `https://wa.me/${WA_PHONE}?text=` + encodeURIComponent(`Hi QRVibe, I want extra mirror tags for ${storeName}`);
  }, [storeName]);

  /* --------------------------------------------------------------------------
     STAND-ALONE 4x6 STAND-EE PRINT VIEW (PDF EXPORT)
     -------------------------------------------------------------------------- */
  const handleDownload4x6Pdf = () => {
    const w = window.open('', '_blank');
    if (!w) {
      showToast('Allow pop-ups to print');
      return;
    }

    const themeColors = {
      default: { ink: '#2B1E19', bg: '#FBF9F6', acc: '#E5A93C' },
      obsidian: { ink: '#14161A', bg: '#F7F8FA', acc: '#C9CED6' },
      forest: { ink: '#16302A', bg: '#F8F6EF', acc: '#D9C49A' }
    }[theme] || { ink: '#2B1E19', bg: '#FBF9F6', acc: '#E5A93C' };

    const qrMarkup = generateQrSvg(liveUrl, storeName, logo);
    const cleanUrl = liveUrl.replace('https://', '');

    w.document.write(`<!doctype html>
<html>
<head>
<title>4x6 standee - ${esc(storeName)}</title>
<style>
:root { --ink: ${themeColors.ink}; --bg: ${themeColors.bg}; --acc: ${themeColors.acc}; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
@page { size: 4in 6in; margin: 0; }
body { margin: 0; display: grid; place-items: center; min-height: 100vh; background: #fff; font-family: "Georgia", serif; }
.c4 { width: 4in; height: 6in; background: var(--ink); color: var(--bg); padding: .3in; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
.nm { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; font-family: monospace; color: var(--acc); }
.sh { font-size: 30px; line-height: 1.05; }
.q { background: var(--bg); border-radius: 12px; padding: 6px; }
svg { display: block; width: 100%; height: auto; }
path, .k { fill: var(--ink); }
.c { fill: var(--bg); }
.a { fill: var(--acc); }
.u { font: 11px monospace; letter-spacing: .06em; opacity: .8; }
.ft { font: 600 14px sans-serif; }
.ft b { color: var(--acc); letter-spacing: 3px; display: block; font-size: 20px; }
</style>
</head>
<body>
<div class="c4">
  <div class="nm">${esc(storeName)}</div>
  <div class="sh">Scan to book,<br>browse &amp; rate</div>
  <div class="q">${qrMarkup}</div>
  <div class="u">${esc(cleanUrl)} · Phone camera, not GPay</div>
  <div class="ft"><b>★★★★★</b>${esc(v.rate)} in 1 tap</div>
</div>
<script>onload = () => print();<\/script>
</body>
</html>`);
    w.document.close();
  };

  /* --------------------------------------------------------------------------
     RATE CARD PHOTO SNAP (OCR & AI READER)
     -------------------------------------------------------------------------- */
  const readRateCard = async file => {
    if (!file) return;

    setIsStagingReading(true);
    setActiveSheet('stage');

    try {
      const currentCategory = storefront.type || 'salon';
      const data = await parseMenuPhotos({
        files: [file],
        businessCategory: currentCategory,
        autoFillPhotos: true
      });

      let extractedRows = [];
      if (Array.isArray(data.items) && data.items.length > 0) {
        extractedRows = data.items.map(item => ({
          n: item.name || item.itemName || 'Service',
          p: Number(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0,
          m: item.duration || (item.brandUsed ? `${item.brandUsed}` : item.description ? item.description.slice(0, 45) : ''),
          c: item.category || categories[1] || 'General',
          img: item.img || findCatalogImage(item.name || item.itemName, item.category || '', currentCategory),
          sig: 0,
          av: 1,
          a: currentCategory === 'cafe' ? 'cup' : currentCategory === 'clinic' ? 'cross' : 'hair'
        }));
      } else if (Array.isArray(data.categories) && data.categories.length > 0) {
        for (const cat of data.categories) {
          for (const item of (cat.items || [])) {
            extractedRows.push({
              n: item.name || item.itemName || 'Service',
              p: Number(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0,
              m: item.duration || (item.brandUsed ? `${item.brandUsed}` : item.description ? item.description.slice(0, 45) : ''),
              c: cat.name || item.category || categories[1] || 'General',
              img: item.img || findCatalogImage(item.name || item.itemName, cat.name, currentCategory),
              sig: 0,
              av: 1,
              a: currentCategory === 'cafe' ? 'cup' : currentCategory === 'clinic' ? 'cross' : 'hair'
            });
          }
        }
      }

      if (extractedRows.length > 0) {
        setStagedRows(extractedRows);
        setIsStagingDemo(false);
        showToast(`✨ Extracted ${extractedRows.length} items from rate card`);
      } else {
        throw new Error('No readable rate card items found');
      }
    } catch (err) {
      console.warn('AI Rate Card Reader fallback:', err.message);
      // Fallback to sample items if AI service is offline or unreadable
      const demoSamples = (DEF[storefront.type]?.sv || DEF.salon.sv).map(s => ({
        n: s.n,
        p: s.p,
        m: s.m,
        c: s.c,
        img: s.img || findCatalogImage(s.n, s.c, storefront.type || 'salon'),
        sig: s.sig,
        av: 1,
        a: s.a
      }));
      setStagedRows(demoSamples);
      setIsStagingDemo(true);
      showToast(err.response?.data?.message || 'Using sample rate card preview (Check GEMINI_API_KEY)');
    } finally {
      setIsStagingReading(false);
    }
  };

  const handleSnapFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    readRateCard(file);
  };

  const handleSaveStagedRows = () => {
    const newCats = [...categories];
    stagedRows.forEach(r => {
      const cat = r.c || categories[1] || 'General';
      if (!newCats.includes(cat) && cat !== 'All') {
        newCats.push(cat);
      }
    });
    setCategories(newCats);

    const newServices = stagedRows.map(r => ({
      n: r.n,
      c: r.c || (categories[1] || 'General'),
      p: Number(r.p) || 0,
      on: 0,
      m: r.m || '',
      sig: 0,
      av: 1,
      a: r.a || (storefront.type === 'cafe' ? 'cup' : storefront.type === 'clinic' ? 'cross' : 'hair'),
      img: r.img || findCatalogImage(r.n, r.c, storefront.type || 'salon')
    }));

    setServices(prev => [...prev, ...newServices]);
    setSelectedCat('All');
    setActiveSheet(null);
    showToast(`${stagedRows.length} services saved to ${v.nav}`);
  };

  /* --------------------------------------------------------------------------
     SERVICE EDITOR SHEET
     -------------------------------------------------------------------------- */
  const openSvcSheet = index => {
    setEditingSvcIndex(index);
    setSvcError('');
    if (index >= 0) {
      const s = services[index];
      setSvcForm({
        n: s.n,
        c: s.c,
        p: String(s.p),
        m: s.m || '',
        on: s.on || 0,
        sig: s.sig || 0,
        img: s.img || findCatalogImage(s.n, s.c, storefront.type)
      });
    } else {
      const defaultCat = selectedCat === 'All' ? categories[1] || 'General' : selectedCat;
      setSvcForm({
        n: '',
        c: defaultCat,
        p: '',
        m: '',
        on: 0,
        sig: 0,
        img: ''
      });
    }
    setActiveSheet('svc');
  };

  const handleSaveSvc = () => {
    const name = svcForm.n.trim();
    const price = svcForm.p.replace(/\D/g, '');
    if (!name) {
      setSvcError('Give the service a name');
      return;
    }
    if (price === '') {
      setSvcError('Enter a price');
      return;
    }

    const artKey = storefront.type === 'cafe' ? 'cup' : storefront.type === 'clinic' ? 'cross' : 'hair';
    const finalImg = svcForm.img?.trim() || findCatalogImage(name, svcForm.c, storefront.type);
    const updated = {
      n: name,
      c: svcForm.c,
      p: Number(price),
      m: svcForm.m.trim(),
      on: svcForm.on ? 1 : 0,
      sig: svcForm.sig ? 1 : 0,
      av: editingSvcIndex >= 0 ? services[editingSvcIndex].av : 1,
      a: editingSvcIndex >= 0 ? services[editingSvcIndex].a || artKey : artKey,
      img: finalImg
    };

    if (editingSvcIndex >= 0) {
      setServices(prev => {
        const copy = [...prev];
        copy[editingSvcIndex] = updated;
        return copy;
      });
      showToast('Service updated');
    } else {
      setServices(prev => [...prev, updated]);
      showToast('Service added');
    }

    if (selectedCat !== 'All' && selectedCat !== updated.c) {
      setSelectedCat(updated.c);
    }
    setActiveSheet(null);
  };

  const handleDeleteSvc = () => {
    if (editingSvcIndex >= 0 && window.confirm('Delete this service?')) {
      setServices(prev => prev.filter((_, i) => i !== editingSvcIndex));
      setActiveSheet(null);
      showToast('Service deleted');
    }
  };

  /* --------------------------------------------------------------------------
     NEW CATEGORY SHEET
     -------------------------------------------------------------------------- */
  const handleAddCategory = () => {
    const name = newCatInput.trim();
    if (!name) {
      setCatError('Enter a category name');
      return;
    }
    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      setCatError('That category already exists');
      return;
    }
    setCategories(prev => [...prev, name]);
    setSelectedCat(name);
    setNewCatInput('');
    setCatError('');
    setActiveSheet(null);
    showToast('Category added');
  };

  /* --------------------------------------------------------------------------
     GOOGLE REVIEW LINK SAVE & VERIFY
     -------------------------------------------------------------------------- */
  const handleSaveGoogleReview = () => {
    const parsed = parseReviewLink(googleUrl);
    if (!parsed) {
      setGoogleMsg('That does not look like a Google review link or Place ID. Paste the link from your Business Profile, or a Place ID starting with ChIJ.');
      return;
    }
    setGoogleUrl(parsed);
    setStorefront(prev => ({ ...prev, review: parsed }));
    setGoogleMsg('Format looks right. Press “Test” to confirm it opens your Google review box.');
    showToast('Link saved');
  };

  /* --------------------------------------------------------------------------
     GUEST PREVIEW PHONE SIMULATOR
     -------------------------------------------------------------------------- */
  const openGuestPreview = () => {
    setGuestState({
      star: 0,
      staff: '',
      svc: [],
      text: `I visited ${storeName}. `,
      edited: false
    });
    setActiveSheet('guest');
  };

  const updateGuestReviewText = (stars, selectedStaff, selectedServices) => {
    let t = `I visited ${storeName}`;
    if (selectedServices.length > 0) {
      t += ` for ${selectedServices.join(' and ')}`;
    }
    if (selectedStaff) {
      t += `. ${selectedStaff} looked after me`;
    }
    t += `. `;
    return t;
  };

  /* --------------------------------------------------------------------------
     FIRST-TIME SETUP WIZARD
     -------------------------------------------------------------------------- */
  const openWizardModal = () => {
    setWizardStep(0);
    setWizardError('');
    setWizardData({
      t: storefront.type,
      nm: storefront.isOnboarded ? storeName : '',
      wa: storefront.isOnboarded ? ownerWhatsApp : '',
      g: storefront.isOnboarded ? googleUrl : '',
      st: storefront.isOnboarded
        ? staff.slice(0, 3).map(s => s.n).concat(['', '', '']).slice(0, 3)
        : ['', '', ''],
      mode: '',
      file: null,
      kit: storefront.isOnboarded ? storefront.kit : ''
    });
    setWizardOpen(true);
  };

  const handleFinishWizard = () => {
    const selectedVertical = wizardData.t;
    const defaultData = DEF[selectedVertical] || DEF.salon;

    setStorefront(prev => ({
      ...prev,
      isOnboarded: true,
      fresh: true,
      type: selectedVertical,
      kit: wizardData.kit.trim().toUpperCase() || 'BOX-01'
    }));

    setStoreName(wizardData.nm.trim() || 'Aura Hair & Spa');
    setOwnerWhatsApp(wizardData.wa.replace(/\D/g, '') || '9876543210');

    if (wizardData.g.trim()) {
      const parsed = parseReviewLink(wizardData.g.trim());
      setGoogleUrl(parsed || wizardData.g.trim());
      if (parsed) setStorefront(prev => ({ ...prev, review: parsed }));
    }

    const enteredStaff = wizardData.st.filter(Boolean);
    if (enteredStaff.length >= 2) {
      setStaff(enteredStaff.map(n => ({ n, k: 0 })));
    } else {
      setStaff(defaultData.staff.map(s => ({ n: s.n, k: 0 })));
    }

    setCategories([...defaultData.cats]);
    setSelectedCat('All');
    setChips([...defaultData.chips]);

    if (wizardData.mode === 'tpl') {
      setServices(JSON.parse(JSON.stringify(defaultData.sv)));
    } else {
      setServices([]);
    }

    setWizardOpen(false);
    setTab(0);
    showToast('Your storefront is set up');

    if (wizardData.mode === 'photo' && wizardData.file) {
      setTimeout(() => {
        setTab(1);
        handleSnapFileChange({ target: { files: [wizardData.file] } });
      }, 700);
    }
  };

  /* --------------------------------------------------------------------------
     LOGO FILE UPLOADER
     -------------------------------------------------------------------------- */
  const handleLogoUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      showToast('Logo added to your QR code');
    };
    reader.readAsDataURL(file);
  };

  /* --------------------------------------------------------------------------
     FILTERED SERVICES LIST
     -------------------------------------------------------------------------- */
  const filteredServices = useMemo(() => {
    return services.filter(s => selectedCat === 'All' || s.c === selectedCat);
  }, [services, selectedCat]);

  return (
    <div className="sf-dash" data-theme={theme}>
      <div className="app">
        {/* ====================================================================
            SIDEBAR NAVIGATION
            ==================================================================== */}
        <nav className="side" aria-label="Dashboard">
          <div className="brand">
            <svg width="24" height="24" viewBox="0 0 22 22" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" rx="2" fill="var(--acc)" />
              <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
              <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
              <rect x="13" y="13" width="4" height="4" fill="var(--acc)" />
            </svg>
            QRVibe
          </div>

          <div className="store">
            <span className="lbl" style={{ color: 'var(--dm)' }}>Storefront</span>
            <b className="sn">{storeName}</b>
          </div>

          <div className="tabs" id="tabs">
            <span
              className="ind"
              id="ind"
              style={{ transform: `translateY(${tab * 50}px)` }}
            />
            <button
              className={`tab ${tab === 0 ? 'on' : ''}`}
              onClick={() => setTab(0)}
            >
              <svg viewBox="0 0 24 24">
                <path d="M4 11l8-7 8 7v9H4z" />
                <path d="M10 20v-6h4v6" />
              </svg>
              <span>Overview</span>
            </button>
            <button
              className={`tab ${tab === 1 ? 'on' : ''}`}
              onClick={() => setTab(1)}
            >
              <svg viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="M4 17l5-4 4 3 3-2 4 3" />
              </svg>
              <span>{v.nav}</span>
            </button>
            <button
              className={`tab ${tab === 2 ? 'on' : ''}`}
              onClick={() => setTab(2)}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.9 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" />
              </svg>
              <span>Reviews &amp; Feedback</span>
            </button>
            <button
              className={`tab ${tab === 3 ? 'on' : ''}`}
              onClick={() => setTab(3)}
            >
              <svg viewBox="0 0 24 24">
                <rect x="4" y="4" width="6" height="6" />
                <rect x="14" y="4" width="6" height="6" />
                <rect x="4" y="14" width="6" height="6" />
                <path d="M14 14h2v2h-2zM18 18h2v2h-2z" />
              </svg>
              <span>Standee &amp; Studio</span>
            </button>
          </div>

          <div className="plan" id="plan">
            {storefront.plan === 'trial' ? (
              <>
                <b>7-Day Trial · {storefront.trialLeft} days left</b>
                <div className="bar" style={{ background: 'var(--ink)', margin: '8px 0 10px' }}>
                  <i style={{ width: `${((7 - storefront.trialLeft) / 7) * 100}%`, background: 'var(--acc)' }} />
                </div>
                <button
                  className="btn hn"
                  style={{ minHeight: '38px', width: '100%' }}
                  onClick={() => setActiveSheet('upgrade')}
                >
                  Upgrade · ₹2,499
                </button>
              </>
            ) : (
              <>
                <b>Annual Storefront Pass</b>
                <div>₹2,499 / year · Active</div>
              </>
            )}
            <button
              className="link"
              style={{ color: 'var(--dm)', borderColor: 'var(--dm)', marginTop: '12px' }}
              onClick={openWizardModal}
            >
              Re-open setup wizard
            </button>
            {user && (
              <button
                className="link"
                style={{ color: 'var(--dm)', borderColor: 'transparent', marginTop: '16px', opacity: 0.7 }}
                onClick={() => {
                  dispatch(logout());
                  navigate('/login');
                }}
              >
                Sign out ({user.name || user.email})
              </button>
            )}
          </div>
        </nav>

        {/* ====================================================================
            MOBILE TOP NAVIGATION BAR (< 900px)
            ==================================================================== */}
        <header className="sf-mobile-bar" aria-label="Storefront Mobile Navigation">
          <div className="sf-mobile-brand">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" rx="2" fill="var(--acc)" />
              <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
              <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
              <rect x="13" y="13" width="4" height="4" fill="var(--acc)" />
            </svg>
            <div className="sf-mobile-store-info">
              <span className="sf-mobile-store-name">{storeName}</span>
              <span className="sf-mobile-live-tag">
                <i /> Live
              </span>
            </div>
          </div>

          <div className="sf-mobile-actions">
            {storefront.plan === 'trial' ? (
              <button
                className="sf-mobile-trial-btn"
                onClick={() => setActiveSheet('upgrade')}
                aria-label="Upgrade storefront plan"
              >
                Trial · {storefront.trialLeft}d
              </button>
            ) : (
              <span className="sf-mobile-active-pill">Annual Pass</span>
            )}

            <button
              className="sf-mobile-account-btn"
              onClick={() => setActiveSheet('account')}
              aria-label="Storefront account and settings"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </header>

        {/* ====================================================================
            MAIN VIEWPORT
            ==================================================================== */}
        <main>
          {/* ------------------------------------------------------------------
              TAB 0: OVERVIEW
              ------------------------------------------------------------------ */}
          {tab === 0 && (
            <section className="pane on" id="p0">
              <div className="hero" style={{ '--i': 0 }}>
                <div className="ph">
                  <ArtSvg artKey="hero" />
                </div>
                <span className="live">
                  <i />Live · <span className="sn">{storeName}</span>
                </span>
                <div>
                  <h1>Your front desk, this month.</h1>
                </div>
                <div className="acts">
                  <button className="btn" onClick={openGuestPreview}>
                    Preview live page ↗
                  </button>
                  <a
                    className="btn hn"
                    href={shareLiveWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Share link on WhatsApp
                  </a>
                </div>
              </div>

              <div className="roi">
                <div className="stat dk" style={{ '--i': 1 }}>
                  <div className="lbl">Lookbook scans</div>
                  <div className="n">{roiScans}</div>
                  <p>{storefront.fresh ? 'Your first scans appear here' : 'views this month'}</p>
                </div>
                <div className="stat" style={{ '--i': 2 }}>
                  <div className="lbl">5★ Google redirects</div>
                  <div className="n">{roiGoogle}</div>
                  <p>{storefront.fresh ? 'Reviews sent to Google appear here' : 'reviews sent to Google'}</p>
                </div>
                <div className="stat" style={{ '--i': 3 }}>
                  <div className="lbl">Private feedback</div>
                  <div className="n">{roiFeedback}</div>
                  <p>{storefront.fresh ? 'Private messages appear here' : 'guests wrote to you first'}</p>
                </div>
              </div>

              <div className="strip" style={{ '--i': 4 }}>
                <button
                  className="btn"
                  onClick={() => setTab(1)}
                >
                  + Pin festive offer
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setTab(1);
                    openSvcSheet(-1);
                  }}
                >
                  + Add new service
                </button>
                <button
                  className="btn"
                  onClick={() => setTab(2)}
                >
                  + Add {v.role === 'stylists' ? 'stylist name' : v.role === 'servers' ? 'staff name' : 'doctor / specialist'}
                </button>
              </div>

              <div className="card" style={{ '--i': 5 }}>
                <div className="head">
                  <div>
                    <h2>{v.lb}</h2>
                    <div className="sub">Ranked by name taps in 5★ reviews</div>
                  </div>
                  <button className="link" onClick={() => setTab(2)}>
                    View full leaderboard →
                  </button>
                </div>
                <div id="topSt">
                  {sortedStaff.slice(0, 3).map((s, idx) => (
                    <div className="rk" key={s.n}>
                      <span className="num">{idx + 1}</span>
                      <div>
                        <b>{v.pre}{s.n}</b>
                        <div className="bar">
                          <i style={{ width: `${(s.k / maxK) * 100}%` }} />
                        </div>
                      </div>
                      <span className="num">{s.k}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------------
              TAB 1: LOOKBOOK & OFFERS / MENU & SPECIALS
              ------------------------------------------------------------------ */}
          {tab === 1 && (
            <section className="pane on" id="p1">
              <div className="top" style={{ '--i': 0 }}>
                <div>
                  <h1>{v.t2}</h1>
                  <p>What guests see when they scan your standee.</p>
                </div>
                <button className="btn" onClick={() => openSvcSheet(-1)}>
                  + Add service
                </button>
              </div>

              <div className="card" style={{ '--i': 1 }}>
                <div className="head">
                  <div>
                    <h2>{v.ban}</h2>
                    <div className="sub">Sits at the top of the guest’s phone screen</div>
                  </div>
                  <div className="tg">
                    <span>{bannerActive ? 'Active' : 'Hidden'}</span>
                    <button
                      className="sw"
                      role="switch"
                      aria-checked={bannerActive}
                      aria-label="Show banner"
                      onClick={() => {
                        const next = !bannerActive;
                        setBannerActive(next);
                        showToast(next ? 'Banner pinned' : 'Banner hidden');
                      }}
                    />
                  </div>
                </div>

                <div className="offer">
                  <div className="fg">
                    <label className="f w2">
                      Offer title
                      <input
                        type="text"
                        value={offerTitle}
                        onChange={e => setOfferTitle(e.target.value)}
                      />
                    </label>
                    <label className="f">
                      Offer price
                      <input
                        type="text"
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                      />
                    </label>
                    <label className="f">
                      One-line description
                      <input
                        type="text"
                        value={offerDesc}
                        onChange={e => setOfferDesc(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className={`pv ${bannerActive ? '' : 'off'}`}>
                    <div className="lbl">Festive offer</div>
                    <h3>{offerTitle}</h3>
                    <b>{offerPrice}</b>
                    <p>{offerDesc}</p>
                  </div>
                </div>
              </div>

              <label className="snap" style={{ '--i': 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleSnapFileChange}
                />
                <svg viewBox="0 0 24 24">
                  <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                <div>
                  <b>Snap a photo of your paper rate card to add services</b>
                  <span>We read the services and prices so you do not type them. You review before saving.</span>
                </div>
              </label>

              <div className="pills" style={{ '--i': 3 }}>
                {categories.map(c => (
                  <button
                    key={c}
                    className={`pill ${selectedCat === c ? 'on' : ''}`}
                    onClick={() => setSelectedCat(c)}
                  >
                    {c}
                  </button>
                ))}
                <button
                  className="pill add"
                  onClick={() => {
                    setNewCatInput('');
                    setCatError('');
                    setActiveSheet('cat');
                  }}
                >
                  + New category
                </button>
              </div>

              <div className="tgs" style={{ '--i': 4 }}>
                {filteredServices.length ? (
                  filteredServices.map((s, idx) => {
                    const realIndex = services.indexOf(s);
                    return (
                      <div
                        className={`svc ${s.av ? '' : 'na'}`}
                        key={s.n + idx}
                        style={{ animation: `sfIn .5s ${idx * 60}ms cubic-bezier(.2,.7,.2,1) backwards` }}
                      >
                        <div
                          className={`ph ${s.img ? 'has' : ''}`}
                          style={s.img ? { backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                          {!s.img && <ArtSvg artKey={s.a || 'standee'} />}
                        </div>
                        <div>
                          <h3>
                            {s.n}
                            {s.sig ? <span className="star">★ {v.sig}</span> : null}
                            {storefront.type === 'cafe' && s.on ? <span className="star">Bestseller</span> : null}
                          </h3>
                          <span className="meta">{s.m}</span>
                          <div className="pr-row">
                            <input
                              className="pr"
                              type="text"
                              inputmode="numeric"
                              value={s.p}
                              aria-label="Price"
                              onChange={e => {
                                const newP = Number(e.target.value.replace(/\D/g, '')) || 0;
                                setServices(prev => {
                                  const copy = [...prev];
                                  copy[realIndex] = { ...copy[realIndex], p: newP };
                                  return copy;
                                });
                              }}
                            />
                            <label>
                              <input
                                type="checkbox"
                                checked={!!s.on}
                                onChange={e => {
                                  const newOn = e.target.checked ? 1 : 0;
                                  setServices(prev => {
                                    const copy = [...prev];
                                    copy[realIndex] = { ...copy[realIndex], on: newOn };
                                    return copy;
                                  });
                                }}
                              />
                              {v.mod}
                            </label>
                            <span className="seen">
                              Guests see <b>{formatSvcPrice(s)}</b>
                            </span>
                          </div>
                        </div>

                        <div className="tgs">
                          <button
                            className="btn"
                            style={{ minHeight: '40px' }}
                            onClick={() => openSvcSheet(realIndex)}
                          >
                            Edit
                          </button>
                          <div className="tg">
                            <button
                              className="sw"
                              role="switch"
                              aria-checked={!!s.av}
                              aria-label="Available"
                              onClick={() => {
                                const nextAv = s.av ? 0 : 1;
                                setServices(prev => {
                                  const copy = [...prev];
                                  copy[realIndex] = { ...copy[realIndex], av: nextAv };
                                  return copy;
                                });
                                showToast(nextAv ? 'Service available' : 'Hidden from guests');
                              }}
                            />
                            Available
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="card">
                    <p>Nothing here yet. Add a service or snap your rate card.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------------
              TAB 2: REVIEWS & FEEDBACK
              ------------------------------------------------------------------ */}
          {tab === 2 && (
            <section className="pane on" id="p2">
              <div className="top" style={{ '--i': 0 }}>
                <div>
                  <h1>Reviews &amp; Feedback</h1>
                  <p>Everything behind your Google review flow.</p>
                </div>
              </div>

              <div className="card" style={{ '--i': 1 }}>
                <div className="head">
                  <div>
                    <h2>{v.lbS}</h2>
                    <div className="sub">Monthly 5★ reviews that name each {v.role}</div>
                  </div>
                  <a
                    className="btn hn"
                    href={lbWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Send leaderboard to my WhatsApp
                  </a>
                </div>

                <div id="lb">
                  {sortedStaff.map((s, idx) => (
                    <div className="rk" key={s.n}>
                      <span className="num">{idx + 1}</span>
                      <div>
                        <span className="chip dk">
                          {v.pre}{s.n}
                        </span>
                        <span className="sub">{s.k} reviews this month</span>
                        <div className="bar">
                          <i style={{ width: `${(s.k / maxK) * 100}%` }} />
                        </div>
                      </div>
                      <button
                        className="link"
                        aria-label={`Remove ${s.n}`}
                        onClick={() => {
                          if (staff.length > 2) {
                            setStaff(prev => prev.filter(item => item.n !== s.n));
                          } else {
                            showToast('Keep at least 2 staff names');
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="add">
                  <input
                    type="text"
                    value={newStaffInput}
                    placeholder={v.ph}
                    onChange={e => setNewStaffInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = newStaffInput.trim();
                        if (!val) return;
                        if (!staff.some(s => s.n.toLowerCase() === val.toLowerCase())) {
                          setStaff(prev => [...prev, { n: val, k: 0 }]);
                        }
                        setNewStaffInput('');
                        showToast(`${v.role === 'doctors' ? 'Doctor' : 'Staff'} added`);
                      }
                    }}
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const val = newStaffInput.trim();
                      if (!val) return;
                      if (!staff.some(s => s.n.toLowerCase() === val.toLowerCase())) {
                        setStaff(prev => [...prev, { n: val, k: 0 }]);
                      }
                      setNewStaffInput('');
                      showToast(`${v.role === 'doctors' ? 'Doctor' : 'Staff'} added`);
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="row2" style={{ '--i': 2 }}>
                <div className="card">
                  <h2>{v.chip}</h2>
                  <div className="sub">4 to 6 services guests can tap below the {v.role} chips</div>
                  <div className="chips" style={{ marginTop: '16px' }}>
                    {chips.map((c, i) => (
                      <span className="chip" key={c + i}>
                        {c}
                        <button
                          aria-label="Remove"
                          onClick={() => setChips(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="add">
                    <input
                      type="text"
                      value={newChipInput}
                      placeholder="e.g. Balayage"
                      onChange={e => setNewChipInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = newChipInput.trim();
                          if (!val) return;
                          if (chips.length >= 6) return showToast('Keep it to 6 chips');
                          setChips(prev => [...prev, val]);
                          setNewChipInput('');
                        }
                      }}
                    />
                    <button
                      className="btn"
                      onClick={() => {
                        const val = newChipInput.trim();
                        if (!val) return;
                        if (chips.length >= 6) return showToast('Keep it to 6 chips');
                        setChips(prev => [...prev, val]);
                        setNewChipInput('');
                      }}
                    >
                      + Add
                    </button>
                  </div>
                  <p className="sub" style={{ marginTop: '14px' }}>
                    When guests tap a chip, their draft mentions that service in their own words, which helps future guests find you. They can edit it before posting.
                  </p>
                </div>

                <div className="card">
                  <h2>Private feedback line</h2>
                  <div className="sub">Any guest can message you here instead of posting. Everyone can still post on Google.</div>
                  <label className="f" style={{ marginTop: '16px' }}>
                    Owner WhatsApp number (+91)
                    <input
                      type="tel"
                      maxLength={10}
                      value={ownerWhatsApp}
                      placeholder="98765 43210"
                      onChange={e => setOwnerWhatsApp(e.target.value.replace(/\D/g, ''))}
                    />
                  </label>
                  <div className="lbl" style={{ marginTop: '16px' }}>Message you will receive</div>
                  <div className="bub">
                    Hi Owner, I am currently at <span className="sn">{storeName}</span> and wanted to share private feedback about my visit…
                  </div>
                </div>
              </div>

              <div className="card" style={{ '--i': 3 }}>
                <div className="head">
                  <div>
                    <h2>Google Maps connection</h2>
                    <div className="sub">The link guests open when they tap Post to Google</div>
                  </div>
                  <span className="ok">
                    <i />
                    {storefront.review ? 'Link saved' : 'Not connected'}
                  </span>
                </div>
                <label className="f" style={{ margin: '12px 0' }}>
                  Review link or Place ID
                  <input
                    type="text"
                    value={googleUrl}
                    placeholder="Paste your link or Place ID (starts with ChIJ…)"
                    onChange={e => setGoogleUrl(e.target.value)}
                  />
                </label>
                <div className="acts">
                  <button className="btn hn" onClick={handleSaveGoogleReview}>
                    Save &amp; verify link
                  </button>
                  <a
                    className="btn"
                    href={storefront.review || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => {
                      if (!storefront.review) {
                        e.preventDefault();
                        showToast('Save a valid Google link or Place ID first');
                      }
                    }}
                  >
                    Test my Google review pop-up ↗
                  </a>
                </div>
                {googleMsg && (
                  <p className="sub" style={{ marginTop: '12px' }} role="status">
                    {googleMsg}
                  </p>
                )}
                <a
                  className="link"
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '8px' }}
                >
                  Find my Place ID
                </a>
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------------
              TAB 3: STANDEE & STUDIO
              ------------------------------------------------------------------ */}
          {tab === 3 && (
            <section className="pane on" id="p3">
              <div className="top" style={{ '--i': 0 }}>
                <div>
                  <h1>Standee &amp; Studio</h1>
                  <p>Your printed kit, brand and plan.</p>
                </div>
              </div>

              <div className="card" style={{ '--i': 1 }}>
                <div className="ph banner">
                  <ArtSvg artKey="standee" />
                </div>
                <div className="stand">
                  <div className="card4x6">
                    <div>
                      <div className="lbl">Scan to</div>
                      <div className="sh">Book, browse &amp; rate</div>
                    </div>
                    <div
                      className="qr"
                      dangerouslySetInnerHTML={{
                        __html: generateQrSvg(liveUrl, storeName, logo)
                      }}
                    />
                    <div className="lbl">Phone camera, not GPay</div>
                  </div>

                  <div>
                    <h2>My counter standee &amp; mirror tags</h2>
                    <p style={{ marginTop: '6px' }}>Espresso &amp; gold 4×6 card with your logo in the QR centre.</p>
                    <div className="ok" style={{ marginTop: '14px' }}>
                      <i />
                      <span>Kit ID: {storefront.kit || 'not linked'} · {storefront.kit ? 'Active' : 'Link a kit'}</span>
                      <button className="link" onClick={() => setKitEditing(true)}>
                        Change
                      </button>
                    </div>

                    {kitEditing && (
                      <div className="add" style={{ marginTop: '10px' }}>
                        <input
                          type="text"
                          value={kitInput}
                          placeholder="e.g. BOX-02"
                          maxLength={10}
                          onChange={e => setKitInput(e.target.value.toUpperCase())}
                        />
                        <button
                          className="btn"
                          onClick={() => {
                            const val = kitInput.trim().toUpperCase();
                            if (!/^BOX-\d{2,4}$/.test(val)) {
                              showToast('Kit IDs look like BOX-02');
                              return;
                            }
                            setStorefront(prev => ({ ...prev, kit: val }));
                            setKitEditing(false);
                            setKitInput('');
                            showToast('Linked ' + val);
                          }}
                        >
                          Link
                        </button>
                      </div>
                    )}

                    <div className="stack">
                      <button className="btn hn" onClick={handleDownload4x6Pdf}>
                        Download 4×6 printable card (PDF)
                      </button>
                      <a
                        className="btn"
                        href={orderTagsWhatsAppHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Order extra mirror tags on WhatsApp · ₹149 each
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ '--i': 2 }}>
                <h2>Studio identity</h2>
                <div className="fg" style={{ marginTop: '16px' }}>
                  <label className="f">
                    <span>{v.nm}</span>
                    <input
                      type="text"
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                    />
                  </label>
                  <label className="f">
                    Subtitle
                    <input
                      type="text"
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                    />
                  </label>
                  <label className="f">
                    Reception booking WhatsApp (+91)
                    <input
                      type="tel"
                      maxLength={10}
                      value={receptionWhatsApp}
                      placeholder="98765 43210"
                      onChange={e => setReceptionWhatsApp(e.target.value.replace(/\D/g, ''))}
                    />
                  </label>
                  <label className="f">
                    Instagram handle
                    <input
                      type="text"
                      value={instagram}
                      placeholder="@aurahairspa"
                      onChange={e => setInstagram(e.target.value)}
                    />
                  </label>
                  <div className="w2 logo">
                    <div
                      className={`ph ${logo ? 'has' : ''}`}
                      style={logo ? { backgroundImage: `url(${logo})` } : {}}
                    >
                      {!logo && <ArtSvg artKey="standee" />}
                    </div>
                    <div>
                      <label className="btn" style={{ cursor: 'pointer' }}>
                        Upload logo
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleLogoUpload}
                        />
                      </label>
                      <div className="sub" style={{ marginTop: '6px' }}>
                        Shows on your lookbook and in the middle of your QR code.
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <div className="lbl" style={{ marginBottom: '10px' }}>Color theme</div>
                  <div className="themes">
                    <button
                      className={`th ${theme === 'default' ? 'on' : ''}`}
                      onClick={() => {
                        setTheme('default');
                        showToast('Theme updated: Warm Cream');
                      }}
                    >
                      <span>
                        <i style={{ background: '#2B1E19' }} />
                        <i style={{ background: '#E5A93C' }} />
                      </span>
                      Warm Cream &amp; Espresso
                    </button>
                    <button
                      className={`th ${theme === 'obsidian' ? 'on' : ''}`}
                      onClick={() => {
                        setTheme('obsidian');
                        showToast('Theme updated: Obsidian');
                      }}
                    >
                      <span>
                        <i style={{ background: '#14161A' }} />
                        <i style={{ background: '#C9CED6' }} />
                      </span>
                      Obsidian
                    </button>
                    <button
                      className={`th ${theme === 'forest' ? 'on' : ''}`}
                      onClick={() => {
                        setTheme('forest');
                        showToast('Theme updated: Forest');
                      }}
                    >
                      <span>
                        <i style={{ background: '#16302A' }} />
                        <i style={{ background: '#D9C49A' }} />
                      </span>
                      Forest
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ '--i': 3 }}>
                <div className="head">
                  <div>
                    <h2>Plan &amp; Monday digest</h2>
                    <div className="sub">
                      {storefront.plan === 'trial'
                        ? `7-day trial · ${storefront.trialLeft} days left`
                        : 'Annual Storefront Pass · ₹2,499 per year · Active'}
                    </div>
                  </div>
                </div>

                {storefront.plan === 'trial' && (
                  <div className="trial" style={{ marginBottom: '16px' }}>
                    <div>
                      <b>7-Day Trial · {storefront.trialLeft} days left</b>
                      <p className="sub">Upgrade to the Annual Pass (₹2,499) to keep your page live.</p>
                    </div>
                    <button className="btn hn" onClick={() => setActiveSheet('upgrade')}>
                      Upgrade
                    </button>
                  </div>
                )}

                <button
                  className="link"
                  style={{ marginBottom: '16px' }}
                  onClick={() => {
                    setStorefront(prev => ({
                      ...prev,
                      plan: prev.plan === 'trial' ? 'annual' : 'trial'
                    }));
                  }}
                >
                  Demo: switch to {storefront.plan === 'trial' ? 'annual' : 'trial'} view
                </button>

                <div className="tg" style={{ justifyContent: 'space-between' }}>
                  <span>Monday 9 AM WhatsApp owner digest</span>
                  <button
                    className="sw"
                    role="switch"
                    aria-checked={digestActive}
                    aria-label="Monday digest"
                    onClick={() => {
                      const next = !digestActive;
                      setDigestActive(next);
                      showToast(next ? 'Monday digest on' : 'Monday digest off');
                    }}
                  />
                </div>

                <label className="f" style={{ marginTop: '14px', maxWidth: '320px' }}>
                  Digest WhatsApp number (+91)
                  <input
                    type="tel"
                    maxLength={10}
                    value={digestWhatsApp}
                    placeholder="98765 43210"
                    onChange={e => setDigestWhatsApp(e.target.value.replace(/\D/g, ''))}
                  />
                </label>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ====================================================================
          MODALS & SHEETS
          ==================================================================== */}

      {/* 1. Add / Edit Service Sheet */}
      {activeSheet === 'svc' && (
        <div className="ov on" onClick={e => e.target === e.currentTarget && setActiveSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="shh">
              <h2>{editingSvcIndex >= 0 ? 'Edit' : 'Add'} service</h2>
              <button className="link" onClick={() => setActiveSheet(null)}>Close</button>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <div
                className="ph has"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  backgroundImage: `url(${svcForm.img || findCatalogImage(svcForm.n || 'Service', svcForm.c, storefront.type)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--border)'
                }}
              />
              <div style={{ flex: 1 }}>
                <label className="f" style={{ marginBottom: 0 }}>
                  Photo URL (Unsplash or custom)
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={svcForm.img || ''}
                    onChange={e => setSvcForm(prev => ({ ...prev, img: e.target.value }))}
                  />
                </label>
                <button
                  type="button"
                  className="link"
                  style={{ fontSize: '12px', marginTop: '4px', display: 'inline-block' }}
                  onClick={() => setSvcForm(prev => ({ ...prev, img: findCatalogImage(prev.n, prev.c, storefront.type) }))}
                >
                  ✨ Match best Unsplash photo
                </button>
              </div>
            </div>

            <div className="fg">
              <label className="f w2">
                Name
                <input
                  type="text"
                  value={svcForm.n}
                  placeholder="e.g. Nail Extensions"
                  onChange={e => setSvcForm(prev => ({ ...prev, n: e.target.value }))}
                />
              </label>
              <label className="f">
                Category
                <select
                  value={svcForm.c}
                  onChange={e => setSvcForm(prev => ({ ...prev, c: e.target.value }))}
                >
                  {categories.slice(1).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="f">
                Price (₹)
                <input
                  type="text"
                  inputMode="numeric"
                  value={svcForm.p}
                  placeholder="1499"
                  onChange={e => setSvcForm(prev => ({ ...prev, p: e.target.value }))}
                />
              </label>
              <label className="f w2">
                Duration or brand
                <input
                  type="text"
                  value={svcForm.m}
                  placeholder="60 mins · L’Oréal Professionnel"
                  onChange={e => setSvcForm(prev => ({ ...prev, m: e.target.value }))}
                />
              </label>
            </div>

            <div className="pr-row" style={{ margin: '16px 0' }}>
              <label>
                <input
                  type="checkbox"
                  checked={!!svcForm.on}
                  onChange={e => setSvcForm(prev => ({ ...prev, on: e.target.checked ? 1 : 0 }))}
                />
                {v.mod}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!svcForm.sig}
                  onChange={e => setSvcForm(prev => ({ ...prev, sig: e.target.checked ? 1 : 0 }))}
                />
                {v.sig}
              </label>
            </div>

            {svcError && <div className="err">{svcError}</div>}

            <div className="acts">
              <button className="btn hn" onClick={handleSaveSvc}>Save</button>
              {editingSvcIndex >= 0 && (
                <button className="btn" onClick={handleDeleteSvc}>Delete</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. New Category Sheet */}
      {activeSheet === 'cat' && (
        <div className="ov on" onClick={e => e.target === e.currentTarget && setActiveSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="shh">
              <h2>New category</h2>
              <button className="link" onClick={() => setActiveSheet(null)}>Close</button>
            </div>
            <label className="f">
              Category name
              <input
                type="text"
                placeholder="e.g. Hair Spa"
                maxLength={30}
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              />
            </label>
            {catError && <div className="err">{catError}</div>}
            <div className="acts">
              <button className="btn hn" onClick={handleAddCategory}>Add category</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Paper Rate Card Photo Staging Sheet */}
      {activeSheet === 'stage' && (
        <div className="ov on" onClick={e => e.target === e.currentTarget && setActiveSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true">
            {isStagingReading ? (
              <>
                <div className="shh">
                  <h2>Reading your rate card with AI…</h2>
                </div>
                <div className="snap scan" style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📸 ✨</div>
                    <b>Extracting services, prices &amp; pairing Unsplash photos…</b>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="shh">
                  <h2>Review before saving</h2>
                  <button className="link" onClick={() => setActiveSheet(null)}>Close</button>
                </div>
                {isStagingDemo ? (
                  <div className="note">
                    Showing sample preview items. Snap a real rate card photo to extract with Gemini AI.
                  </div>
                ) : (
                  <div className="note" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', borderColor: 'rgba(34, 197, 94, 0.25)' }}>
                    ✨ AI Extracted {stagedRows.length} services from rate card. Photos paired automatically from Unsplash.
                  </div>
                )}
                {stagedRows.map((r, i) => (
                  <div className="stg" key={i} style={{ gridTemplateColumns: '42px 1.2fr 1fr 75px 24px' }}>
                    <div
                      className="ph has"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundImage: `url(${r.img || findCatalogImage(r.n, r.c, storefront.type)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid var(--border)'
                      }}
                    />
                    <input
                      className="sm"
                      value={r.n}
                      aria-label="Name"
                      onChange={e => {
                        const val = e.target.value;
                        setStagedRows(prev => {
                          const copy = [...prev];
                          copy[i] = {
                            ...copy[i],
                            n: val,
                            img: copy[i].img || findCatalogImage(val, copy[i].c, storefront.type)
                          };
                          return copy;
                        });
                      }}
                    />
                    <input
                      className="sm"
                      value={r.m}
                      aria-label="Duration"
                      onChange={e => {
                        const val = e.target.value;
                        setStagedRows(prev => {
                          const copy = [...prev];
                          copy[i] = { ...copy[i], m: val };
                          return copy;
                        });
                      }}
                    />
                    <input
                      className="sm"
                      inputMode="numeric"
                      value={r.p}
                      aria-label="Price"
                      onChange={e => {
                        const val = Number(e.target.value.replace(/\D/g, '')) || 0;
                        setStagedRows(prev => {
                          const copy = [...prev];
                          copy[i] = { ...copy[i], p: val };
                          return copy;
                        });
                      }}
                    />
                    <button
                      className="link"
                      aria-label="Remove"
                      onClick={() => setStagedRows(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="acts" style={{ marginTop: '14px' }}>
                  <button
                    className="btn hn"
                    disabled={!stagedRows.length}
                    onClick={handleSaveStagedRows}
                  >
                    Save all to {v.nav}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Account & Profile Sheet (Mobile Accessible) */}
      {activeSheet === 'account' && (
        <div className="ov on" onClick={e => e.target === e.currentTarget && setActiveSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true" style={{ maxWidth: '520px' }}>
            <div className="shh">
              <div>
                <h2>Storefront &amp; Account</h2>
                <div className="sub">{storeName} · {VOC[storefront.type]?.name || 'Storefront'}</div>
              </div>
              <button className="link" onClick={() => setActiveSheet(null)}>Close</button>
            </div>

            <div style={{ padding: '8px 0 20px' }}>
              {/* Account summary card */}
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div className="lbl" style={{ color: 'var(--dm)', marginBottom: '4px' }}>Signed in as</div>
                <b style={{ display: 'block', fontSize: '15px', color: 'var(--ink)' }}>
                  {user?.name ? `${user.name} (${user?.email})` : user?.email || 'Storefront Merchant'}
                </b>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Plan: <strong style={{ color: 'var(--ink)' }}>
                      {storefront.plan === 'trial' ? `7-Day Walk-In Trial (${storefront.trialLeft} days left)` : 'Annual Storefront Pass'}
                    </strong>
                  </span>
                  {storefront.plan === 'trial' && (
                    <button
                      className="btn hn"
                      style={{ minHeight: '34px', padding: '0 12px', fontSize: '12px' }}
                      onClick={() => setActiveSheet('upgrade')}
                    >
                      Upgrade · ₹2,499
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', minHeight: '44px' }}
                  onClick={() => {
                    setActiveSheet(null);
                    openWizardModal();
                  }}
                >
                  ⚙️ Re-open setup wizard
                </button>

                <button
                  className="btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', minHeight: '44px' }}
                  onClick={() => {
                    setActiveSheet('guest');
                  }}
                >
                  📱 Open guest preview simulator
                </button>

                <a
                  className="btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', minHeight: '44px' }}
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ↗ View live public storefront page
                </a>

                {user && (
                  <button
                    className="btn"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px 16px',
                      minHeight: '44px',
                      color: 'var(--destructive, #EF4444)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      marginTop: '12px'
                    }}
                    onClick={() => {
                      setActiveSheet(null);
                      dispatch(logout());
                      navigate('/login');
                    }}
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Upgrade to Annual Pass Sheet */}
      {activeSheet === 'upgrade' && (
        <div className="ov on" onClick={e => e.target === e.currentTarget && setActiveSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="shh">
              <h2>Upgrade to Annual Pass</h2>
              <button className="link" onClick={() => setActiveSheet(null)}>Close</button>
            </div>
            <p>₹2,499 for one year. Pay with any UPI app, then confirm on WhatsApp so we can activate your pass.</p>
            <div className="stack">
              <a
                className="btn hn"
                href={`upi://pay?pa=${UPI}&pn=QRVibe&am=2499&cu=INR&tn=${encodeURIComponent('Annual Storefront Pass ' + currentSlug)}`}
              >
                Pay ₹2,499 with UPI
              </a>
              <a
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`Hi QRVibe, I paid ₹2,499 for the Annual Storefront Pass for ${storeName} (${currentSlug})`)}`}
              >
                I have paid, confirm on WhatsApp
              </a>
            </div>
            <p className="sub" style={{ marginTop: '14px' }}>Your pass is activated after we confirm the payment.</p>
          </div>
        </div>
      )}

      {/* 5. Guest Preview Phone Drawer */}
      {activeSheet === 'guest' && (
        <div className="ov on" onClick={e => e.target === e.currentTarget && setActiveSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="shh">
              <h2>Guest preview</h2>
              <button className="link" onClick={() => setActiveSheet(null)}>Close</button>
            </div>
            <p className="sub" style={{ marginBottom: '14px' }}>What a guest sees after scanning. Tap around.</p>

            <div className="gph">
              <div className="gn">{storeName}</div>
              {bannerActive && (
                <div className="gb">
                  <span className="lbl">Offer</span>
                  <b>{offerTitle}</b>
                  <span>{offerPrice}</span>
                  <p>{offerDesc}</p>
                </div>
              )}

              <div className="lbl" style={{ margin: '16px 0 6px' }}>{v.t2}</div>
              {services.filter(s => s.av).slice(0, 4).map((s, idx) => (
                <div className="gs" key={s.n + idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {s.img && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundImage: `url(${s.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span style={{ flex: 1 }}>{s.n}{s.sig ? ' ★' : ''}</span>
                  <b>{formatSvcPrice(s)}</b>
                </div>
              ))}

              <div className="lbl" style={{ margin: '18px 0 8px' }}>How was your visit?</div>
              <div className="gst">
                {[1, 2, 3, 4, 5].map(starNum => (
                  <button
                    key={starNum}
                    className={guestState.star >= starNum ? 'on' : ''}
                    aria-label={`${starNum} stars`}
                    onClick={() => {
                      setGuestState(prev => {
                        const nextStar = starNum;
                        const nextText = updateGuestReviewText(nextStar, prev.staff, prev.svc);
                        return { ...prev, star: nextStar, text: nextText, edited: false };
                      });
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              {guestState.star > 0 && (
                <>
                  <div className="lbl" style={{ margin: '14px 0 6px' }}>Who looked after you?</div>
                  <div className="chips">
                    {staff.map(s => (
                      <button
                        key={s.n}
                        className={`chip ${guestState.staff === s.n ? 'dk' : ''}`}
                        onClick={() => {
                          setGuestState(prev => {
                            const nextStaff = prev.staff === s.n ? '' : s.n;
                            const nextText = updateGuestReviewText(prev.star, nextStaff, prev.svc);
                            return { ...prev, staff: nextStaff, text: nextText, edited: false };
                          });
                        }}
                      >
                        {v.pre}{s.n}
                      </button>
                    ))}
                  </div>

                  <div className="lbl" style={{ margin: '14px 0 6px' }}>What did you come for?</div>
                  <div className="chips">
                    {chips.map(c => {
                      const isSelected = guestState.svc.includes(c);
                      return (
                        <button
                          key={c}
                          className={`chip ${isSelected ? 'dk' : ''}`}
                          onClick={() => {
                            setGuestState(prev => {
                              let nextSvc = [...prev.svc];
                              if (isSelected) {
                                nextSvc = nextSvc.filter(x => x !== c);
                              } else {
                                if (nextSvc.length < 2) nextSvc.push(c);
                              }
                              const nextText = updateGuestReviewText(prev.star, prev.staff, nextSvc);
                              return { ...prev, svc: nextSvc, text: nextText, edited: false };
                            });
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    rows={4}
                    value={guestState.text}
                    onChange={e => {
                      const val = e.target.value;
                      setGuestState(prev => ({ ...prev, text: val, edited: true }));
                    }}
                  />

                  <button
                    className="btn hn"
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={() => {
                      navigator.clipboard?.writeText(guestState.text);
                      if (storefront.review) {
                        window.open(storefront.review, '_blank');
                      } else {
                        showToast('Add your Google link in Reviews first');
                        return;
                      }
                      showToast('Text copied. Paste it into Google');
                    }}
                  >
                    Copy text &amp; post on Google
                  </button>

                  <a
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${ownerWhatsApp.length === 10 ? '91' + ownerWhatsApp : ''}?text=${encodeURIComponent(`Hi, I am at ${storeName} and wanted to share private feedback about my visit…`)}`}
                    style={{ display: 'inline-block', marginTop: '12px' }}
                  >
                    Rather tell us privately? Message on WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. First-Time Setup Wizard Modal */}
      {wizardOpen && (
        <div className="wz on" role="dialog" aria-modal="true">
          <div className="wzc">
            <div className="wzb">
              {[0, 1, 2].map(stepIndex => (
                <i key={stepIndex} className={stepIndex <= wizardStep ? 'on' : ''} />
              ))}
            </div>

            <div className="lbl">
              Step {wizardStep + 1} of 3 · {['Identity', 'Google & team', 'Rate card & kit'][wizardStep]}
            </div>

            <div className="wzs">
              {/* Step 1: Identity */}
              {wizardStep === 0 && (
                <>
                  <h2>Tell us about your storefront</h2>
                  <div className="tcards">
                    {Object.keys(VOC).map(k => (
                      <button
                        key={k}
                        className={`tc ${wizardData.t === k ? 'on' : ''}`}
                        onClick={() => setWizardData(prev => ({ ...prev, t: k }))}
                      >
                        <b>{VOC[k].name}</b>
                        <span>{VOC[k].blurb}</span>
                      </button>
                    ))}
                  </div>
                  <div className="fg">
                    <label className="f w2">
                      {VOC[wizardData.t].nm}
                      <input
                        type="text"
                        value={wizardData.nm}
                        placeholder="e.g. Aura Hair & Spa"
                        onChange={e => setWizardData(prev => ({ ...prev, nm: e.target.value }))}
                      />
                    </label>
                    <label className="f w2">
                      Owner WhatsApp number (+91)
                      <input
                        type="tel"
                        maxLength={10}
                        value={wizardData.wa}
                        placeholder="98765 43210"
                        onChange={e => setWizardData(prev => ({ ...prev, wa: e.target.value }))}
                      />
                    </label>
                  </div>
                </>
              )}

              {/* Step 2: Google & Team */}
              {wizardStep === 1 && (
                <>
                  <h2>Connect Google and add your team</h2>
                  <label className="f" style={{ margin: '18px 0 8px' }}>
                    Google review link or Place ID
                    <input
                      type="text"
                      value={wizardData.g}
                      placeholder="Paste your link or Place ID (starts with ChIJ…)"
                      onChange={e => setWizardData(prev => ({ ...prev, g: e.target.value }))}
                    />
                  </label>
                  <a
                    className="link"
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Find my Place ID
                  </a>
                  <div className="lbl" style={{ margin: '22px 0 8px' }}>
                    Your first {VOC[wizardData.t].role} (add at least 2)
                  </div>
                  <div className="fg">
                    {[0, 1, 2].map(idx => (
                      <input
                        key={idx}
                        className="wS"
                        type="text"
                        value={wizardData.st[idx]}
                        placeholder={['Riya', 'Rahul', 'Simran'][idx]}
                        aria-label={`Name ${idx + 1}`}
                        onChange={e => {
                          const val = e.target.value;
                          setWizardData(prev => {
                            const copy = [...prev.st];
                            copy[idx] = val;
                            return { ...prev, st: copy };
                          });
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Step 3: Rate Card & Kit */}
              {wizardStep === 2 && (
                <>
                  <h2>Add your {VOC[wizardData.t].tpl} and pair your kit</h2>
                  <div className="tcards" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <label className={`tc ${wizardData.mode === 'photo' ? 'on' : ''}`}>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            setWizardData(prev => ({
                              ...prev,
                              file: e.target.files[0],
                              mode: 'photo'
                            }));
                          }
                        }}
                      />
                      <b>Snap a photo</b>
                      <span>{wizardData.file ? wizardData.file.name : 'You review what we read'}</span>
                    </label>
                    <button
                      className={`tc ${wizardData.mode === 'tpl' ? 'on' : ''}`}
                      onClick={() => setWizardData(prev => ({ ...prev, mode: 'tpl', file: null }))}
                    >
                      <b>Load default</b>
                      <span>Start from a ready {VOC[wizardData.t].tpl}</span>
                    </button>
                  </div>
                  <label className="f" style={{ marginTop: '16px' }}>
                    Kit ID on your standee (optional)
                    <input
                      type="text"
                      value={wizardData.kit}
                      placeholder="BOX-01"
                      maxLength={10}
                      onChange={e => setWizardData(prev => ({ ...prev, kit: e.target.value.toUpperCase() }))}
                    />
                  </label>
                </>
              )}
            </div>

            {wizardError && <div className="err">{wizardError}</div>}

            <div className="acts" style={{ justifyContent: 'space-between' }}>
              <span>
                {wizardStep > 0 ? (
                  <button className="btn" onClick={() => setWizardStep(prev => prev - 1)}>
                    Back
                  </button>
                ) : (
                  <button
                    className="link"
                    onClick={() => {
                      setStorefront(prev => ({ ...prev, isOnboarded: true, fresh: false }));
                      setWizardOpen(false);
                      showToast('Loaded demo storefront');
                    }}
                  >
                    Skip with demo data
                  </button>
                )}
              </span>

              <button
                className="btn hn"
                onClick={() => {
                  setWizardError('');
                  if (wizardStep === 0) {
                    if (wizardData.nm.trim().length < 2) {
                      setWizardError('Enter your store name');
                      return;
                    }
                    if (!/^[6-9]\d{9}$/.test(wizardData.wa.replace(/\D/g, ''))) {
                      setWizardError('Enter a 10-digit Indian mobile number');
                      return;
                    }
                    setWizardStep(1);
                  } else if (wizardStep === 1) {
                    if (wizardData.g.trim() && !parseReviewLink(wizardData.g.trim())) {
                      setWizardError('That does not look like a Google review link or Place ID');
                      return;
                    }
                    if (wizardData.st.filter(Boolean).length < 2) {
                      setWizardError('Add at least 2 names');
                      return;
                    }
                    setWizardStep(2);
                  } else if (wizardStep === 2) {
                    if (!wizardData.mode) {
                      setWizardError('Snap a photo or load the default list');
                      return;
                    }
                    if (wizardData.kit.trim() && !/^BOX-\d{2,4}$/.test(wizardData.kit.trim().toUpperCase())) {
                      setWizardError('Kit IDs look like BOX-01');
                      return;
                    }
                    handleFinishWizard();
                  }
                }}
              >
                {wizardStep === 2 ? 'Finish setup' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`toast ${toastVisible ? 'on' : ''}`}
        role="status"
        id="toast"
      >
        {toastText}
      </div>
    </div>
  );
}
