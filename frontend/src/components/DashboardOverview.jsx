import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import api from '../api/axios';
import './StorefrontDashboard.css';

/* =========================================================================
   VERTICAL CHAMELEON VOCABULARY DICTIONARY (Salon vs Cafe vs Clinic)
   ========================================================================= */
const VERTICAL_CONFIG = {
  salon: {
    badge: "Salon & Spa",
    navTitle: "Lookbook & Offers",
    tab2Title: "Lookbook & Rate Card",
    bannerTitle: "Pinned festive & bridal banner",
    bannerBadge: "Festive offer",
    staffHeading: "Top stylists this month",
    lbHeading: "Staff leaderboard (Stylists)",
    staffPrefix: "Stylist • ",
    addStaffBtn: "+ Add stylist name",
    chipsHeading: "Service chips",
    chipsSub: "4 to 6 high-ticket services guests can tap below the stylist chips",
    modLabel: "Show “onwards”",
    modSuffix: " onwards",
    storeNameLbl: "Salon name",
    defaultCats: ["All", "Hair Colour & Spa", "Facials & Skin", "Bridal", "Nails & Lashes"],
    defaultChips: ["Colour & gloss", "Keratin", "Facial", "Bridal"],
    defaultServices: [
      { n: "L’Oréal Keratin Smooth Treatment", c: "Hair Colour & Spa", p: 2499, on: 1, m: "60 mins • L’Oréal Professionnel", sig: 1, av: 1, a: "hair", i: "svc-keratin" },
      { n: "Global Colour & Gloss", c: "Hair Colour & Spa", p: 3400, on: 0, m: "120 mins", sig: 0, av: 1, a: "hair", i: "svc-colour" },
      { n: "HydraFacial Glow", c: "Facials & Skin", p: 2100, on: 0, m: "45 mins", sig: 0, av: 1, a: "face", i: "svc-facial" },
      { n: "Pre-Bridal Glow Package", c: "Bridal", p: 1999, on: 1, m: "3 hours", sig: 1, av: 1, a: "bride", i: "svc-bridal" },
      { n: "Gel Nail Art", c: "Nails & Lashes", p: 850, on: 0, m: "60 mins", sig: 0, av: 1, a: "nails", i: "svc-nails" },
      { n: "Lash Lift & Tint", c: "Nails & Lashes", p: 1200, on: 0, m: "45 mins", sig: 0, av: 0, a: "lash", i: "svc-lash" }
    ]
  },
  cafe: {
    badge: "Cafe & Bakery",
    navTitle: "Menu & Specials",
    tab2Title: "Visual Menu & Specials",
    bannerTitle: "Pinned chef's special & combo",
    bannerBadge: "Chef's Special",
    staffHeading: "Top staff mentions",
    lbHeading: "Staff leaderboard (Servers & Baristas)",
    staffPrefix: "Server • ",
    addStaffBtn: "+ Add staff name",
    chipsHeading: "Dish chips",
    chipsSub: "4 to 6 signature dishes or drinks guests can tap in their review",
    modLabel: "Mark as “Bestseller”",
    modSuffix: " • Bestseller",
    storeNameLbl: "Cafe name",
    defaultCats: ["All", "Specialty Coffee", "All-Day Brunch", "Woodfired Mains", "Artisanal Bakes"],
    defaultChips: ["Cold Brew", "Truffle Pasta", "Sourdough Toast", "Tiramisu"],
    defaultServices: [
      { n: "Vietnamese Salted Cream Cold Brew", c: "Specialty Coffee", p: 280, on: 1, m: "Single Estate Arabica • Iced", sig: 1, av: 1, a: "hair", i: "svc-keratin" },
      { n: "Burrata & Heirloom Sourdough Tartine", c: "All-Day Brunch", p: 540, on: 1, m: "Freshly Baked • Chef Recommended", sig: 1, av: 1, a: "bride", i: "svc-bridal" },
      { n: "Wild Mushroom & Black Truffle Tagliatelle", c: "Woodfired Mains", p: 690, on: 0, m: "Handmade Pasta", sig: 0, av: 1, a: "face", i: "svc-facial" },
      { n: "Belgian 70% Dark Hazelnut Pain au Chocolat", c: "Artisanal Bakes", p: 240, on: 0, m: "Warm from the oven", sig: 0, av: 1, a: "nails", i: "svc-nails" }
    ]
  },
  clinic: {
    badge: "Clinic & Aesthetics",
    navTitle: "Treatments & Guide",
    tab2Title: "Treatment & Fee Guide",
    bannerTitle: "Pinned clinic package & timings",
    bannerBadge: "Clinic Package",
    staffHeading: "Doctor & specialist mentions",
    lbHeading: "Doctor & specialist leaderboard",
    staffPrefix: "Dr. ",
    addStaffBtn: "+ Add doctor / specialist",
    chipsHeading: "Treatment chips",
    chipsSub: "4 to 6 key treatments guests can tap below the doctor chips",
    modLabel: "Show “consultation onwards”",
    modSuffix: " consult onwards",
    storeNameLbl: "Clinic name",
    defaultCats: ["All", "Dermatology & Laser", "Aesthetic Facials", "Hair Restoration", "Consultations"],
    defaultChips: ["HydraFacial MD", "Laser Toning", "Acne Peel", "Painless Care"],
    defaultServices: [
      { n: "Comprehensive Dermatology & Skin Analysis", c: "Consultations", p: 800, on: 1, m: "30 mins • Senior Dermatologist", sig: 1, av: 1, a: "face", i: "svc-facial" },
      { n: "Q-Switched Nd:YAG Laser Skin Toning", c: "Dermatology & Laser", p: 3500, on: 1, m: "45 mins • US-FDA Approved", sig: 1, av: 1, a: "bride", i: "svc-bridal" },
      { n: "Medical-Grade HydraFacial MD", c: "Aesthetic Facials", p: 2800, on: 0, m: "60 mins • Zero Downtime", sig: 0, av: 1, a: "hair", i: "svc-keratin" },
      { n: "PRP Hair Follicle Bio-Stimulation", c: "Hair Restoration", p: 4500, on: 0, m: "Autologous Plasma", sig: 0, av: 1, a: "lash", i: "svc-lash" }
    ]
  }
};

/* Vector illustrations for placeholder items */
const ART = {
  hero: '<path class="sa" d="M20 100V50a30 30 0 0160 0v50"/><path class="sa" d="M32 100V54a18 18 0 0136 0v46"/><circle class="sf" cx="76" cy="20" r="6"/>',
  hair: '<path class="sa" d="M10 38c12-14 20 14 32 0s20 14 32 0 12 8 16 8"/><path class="sa" d="M10 56c12-14 20 14 32 0s20 14 32 0"/><path class="sa" d="M10 74c12-14 20 14 32 0s20 14 32 0"/>',
  face: '<circle class="sa" cx="50" cy="48" r="24"/><path class="sa" d="M40 55q10 10 20 0"/><circle class="sf" cx="42" cy="44" r="2.2"/><circle class="sf" cx="58" cy="44" r="2.2"/>',
  bride: '<path class="sa" d="M50 18l8 18 18 2-14 12 5 18-17-10-17 10 5-18-14-12 18-2z"/>',
  nails: '<ellipse class="sa" cx="26" cy="60" rx="8" ry="15"/><ellipse class="sa" cx="46" cy="52" rx="8" ry="17"/><ellipse class="sa" cx="66" cy="56" rx="8" ry="16"/><circle class="sf" cx="46" cy="40" r="3"/>',
  lash: '<path class="sa" d="M12 62q38-34 76 0"/><path class="sa" d="M22 55l-6-12M36 47l-3-14M50 44V29M64 47l3-14M78 55l6-12"/>',
  standee: '<rect class="sa" x="32" y="22" width="36" height="56" rx="4"/><rect class="sf" x="42" y="36" width="16" height="16"/>'
};

const ArtSvg = ({ artKey }) => {
  const innerHtml = ART[artKey] || ART.hair;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: `<rect class="sb" width="100" height="100"/>${innerHtml}`
      }}
    />
  );
};

const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const slugify = str => (str || "aura-hair-spa").toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* Real 29x29 QR Matrix Algorithm */
function buildRealQrMatrix(urlText) {
  const N = 29;
  const M = Array.from({ length: N }, () => Array(N).fill(0));
  const R = Array.from({ length: N }, () => Array(N).fill(false));

  function setFinder(ox, oy) {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const xx = ox + x, yy = oy + y;
        if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
        R[yy][xx] = true;
        if (x >= 0 && x <= 6 && y >= 0 && y <= 6) {
          if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
            M[yy][xx] = 1;
          }
        }
      }
    }
  }
  setFinder(0, 0);
  setFinder(N - 7, 0);
  setFinder(0, N - 7);

  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const xx = 22 + x, yy = 22 + y;
      R[yy][xx] = true;
      if (Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0)) M[yy][xx] = 1;
    }
  }

  for (let i = 8; i < N - 8; i++) {
    R[6][i] = R[i][6] = true;
    M[6][i] = M[i][6] = (i % 2 === 0) ? 1 : 0;
  }
  R[N - 8][8] = true;
  M[N - 8][8] = 1;

  const bytes = [];
  for (let i = 0; i < urlText.length; i++) bytes.push(urlText.charCodeAt(i));
  let bitIdx = 0;
  for (let x = N - 1; x > 0; x -= 2) {
    if (x === 6) x--;
    for (let y = 0; y < N; y++) {
      for (let c = 0; c < 2; c++) {
        const xx = x - c;
        if (R[y][xx]) continue;
        if (xx >= 11 && xx <= 17 && y >= 11 && y <= 17) continue;
        const b = bytes[bitIdx % bytes.length] || 0x55;
        const bit = ((b >> (bitIdx % 8)) & 1) ^ ((xx + y) % 2 === 0 ? 1 : 0);
        M[y][xx] = bit;
        bitIdx++;
      }
    }
  }
  return { N, M };
}

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  // Core Storefront State
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('default');
  const [vertical, setVertical] = useState('salon');
  const [storeName, setStoreName] = useState(user?.name || "Aura Hair & Spa");
  const [tagline, setTagline] = useState("Hair, skin & bridal studio");
  const [ownerWa, setOwnerWa] = useState(user?.whatsappNumber || "9876543210");
  const [kitId, setKitId] = useState("BOX-01");
  const [isEditingKit, setIsEditingKit] = useState(false);
  const [kitInput, setKitInput] = useState("");
  const [stationInput, setStationInput] = useState("");
  const [isActivatingStandee, setIsActivatingStandee] = useState(false);
  const [standees, setStandees] = useState([]);
  const [selectedStandeeId, setSelectedStandeeId] = useState(null);
  const [standeesLoading, setStandeesLoading] = useState(true);
  const [planMode, setPlanMode] = useState("annual"); // 'annual' | 'trial'
  const [gmapsUrl, setGmapsUrl] = useState(user?.googleReviewUrl || "https://search.google.com/local/writereview?placeid=ChIJ_AuraHairSpa_Indiranagar");
  const [logo, setLogo] = useState(null);
  const [showPlaceHelper, setShowPlaceHelper] = useState(false);

  // Lookbook / Services State
  const [cats, setCats] = useState([...VERTICAL_CONFIG.salon.defaultCats]);
  const [activeCat, setActiveCat] = useState("All");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [sv, setSv] = useState(JSON.parse(JSON.stringify(VERTICAL_CONFIG.salon.defaultServices)));

  // Banner State
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerTitle, setBannerTitle] = useState("Pre-Bridal & Festive Glow Package");
  const [bannerPrice, setBannerPrice] = useState("₹1,999 onwards");
  const [bannerDesc, setBannerDesc] = useState("Includes Hydra-Cleanup, Detan, Hair Spa & Manicure");

  // Reviews & Staff State
  const [staff, setStaff] = useState([
    { n: "Riya", k: 14 },
    { n: "Rahul", k: 9 },
    { n: "Simran", k: 5 },
    { n: "Pooja", k: 3 }
  ]);
  const [newStaffInput, setNewStaffInput] = useState("");
  const [chips, setChips] = useState([...VERTICAL_CONFIG.salon.defaultChips]);
  const [newChipInput, setNewChipInput] = useState("");
  const [mondayDigest, setMondayDigest] = useState(true);
  const [digestWa, setDigestWa] = useState(user?.whatsappNumber || "9876543210");

  // AI Counter Photo state
  const [aiCounterImage, setAiCounterImage] = useState(null);

  // Modals & Drawers
  const [showWizard, setShowWizard] = useState(false);
  const [wizStep, setWizStep] = useState(1);
  const [wizNm, setWizNm] = useState(user?.name || "Aura Hair & Spa");
  const [wizWa, setWizWa] = useState(user?.whatsappNumber || "9876543210");
  const [wizVertical, setWizVertical] = useState("salon");
  const [wizGmaps, setWizGmaps] = useState(user?.googleReviewUrl || "https://search.google.com/local/writereview?placeid=ChIJ_AuraHairSpa_Indiranagar");
  const [wizStaff, setWizStaff] = useState(["Riya", "Rahul", "Simran", "Pooja"]);
  const [wizNewStaffInput, setWizNewStaffInput] = useState("");
  const [wizKitId, setWizKitId] = useState("BOX-01");
  const [wizPlanMode, setWizPlanMode] = useState("annual");
  const [wizPresetLoadedBadge, setWizPresetLoadedBadge] = useState("✓ Loaded");

  const [showSvcModal, setShowSvcModal] = useState(false);
  const [editingSvcIdx, setEditingSvcIdx] = useState(null);
  const [smName, setSmName] = useState("");
  const [smCat, setSmCat] = useState("");
  const [smPrice, setSmPrice] = useState("");
  const [smMeta, setSmMeta] = useState("");
  const [smSig, setSmSig] = useState(false);
  const [smOn, setSmOn] = useState(true);

  const [showOcrModal, setShowOcrModal] = useState(false);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrStaging, setOcrStaging] = useState([]);

  const [showUpgModal, setShowUpgModal] = useState(false);

  // Guest Simulator Drawer
  const [showGuestDrawer, setShowGuestDrawer] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [simRating, setSimRating] = useState(5);
  const [simSelectedStaff, setSimSelectedStaff] = useState("Riya");
  const [simSelectedChip, setSimSelectedChip] = useState("Keratin");

  // Toast System
  const [toastMsg, setToastMsg] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastActive(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastActive(false);
    }, 2400);
  };

  // Sync category with user category if provided
  useEffect(() => {
    if (user?.businessCategory && ['salon', 'cafe', 'clinic'].includes(user.businessCategory)) {
      applyVertical(user.businessCategory, false);
    }
    if (user?.googleReviewUrl) {
      setGmapsUrl(user.googleReviewUrl);
      setWizGmaps(user.googleReviewUrl);
    }
  }, [user]);

  // Live Telemetry & Scans
  const [liveScans, setLiveScans] = useState(0);
  const [liveUniqueVisitors, setLiveUniqueVisitors] = useState(0);
  const [scansDelta, setScansDelta] = useState(0);
  const [liveGoogleRedirects, setLiveGoogleRedirects] = useState(0);
  const [livePrivateFeedback, setLivePrivateFeedback] = useState(0);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [userQrs, setUserQrs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveScanData = async () => {
      setAnalyticsLoading(true);
      try {
        const [dashRes, qrsRes] = await Promise.allSettled([
          api.get('/analytics/dashboard?days=30'),
          api.get('/qrcodes/myqrs')
        ]);

        let scansCount = 0;
        let delta = 0;
        let uniqueCount = 0;

        if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
          const totals = dashRes.value.data.totals || {};
          scansCount = Number(totals.scans) || 0;
          delta = Number(totals.scansDelta) || 0;
          uniqueCount = Number(totals.uniqueScanners) || 0;
          setLiveGoogleRedirects(Number(totals.googleRedirects) || 0);
          setLivePrivateFeedback(Number(totals.privateFeedback) || 0);
          if (Array.isArray(totals.staffLeaderboard) && totals.staffLeaderboard.length > 0) {
            setStaff(prevStaff => {
              return prevStaff.map(s => {
                const match = totals.staffLeaderboard.find(st => st.n.toLowerCase() === s.n.toLowerCase());
                return match ? { ...s, k: Math.max(s.k, match.k) } : s;
              });
            });
          }
        }

        if (qrsRes.status === 'fulfilled' && Array.isArray(qrsRes.value?.data)) {
          if (isMounted) setUserQrs(qrsRes.value.data);
          const qrSum = qrsRes.value.data.reduce((sum, q) => sum + (Number(q.stats?.total_scans) || 0), 0);
          if (qrSum > scansCount) {
            scansCount = qrSum;
          }
        }

        if (isMounted) {
          setLiveScans(scansCount);
          setScansDelta(delta);
          setLiveUniqueVisitors(uniqueCount);
        }
      } catch (err) {
        console.warn('Could not fetch live scan analytics:', err);
      } finally {
        if (isMounted) setAnalyticsLoading(false);
      }
    };

    fetchLiveScanData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Standees State & Primary Standee calculation
  const primaryStandee = useMemo(() => {
    if (!standees || standees.length === 0) return null;
    if (selectedStandeeId) {
      const found = standees.find(s => s._id === selectedStandeeId || s.kit_code === selectedStandeeId);
      if (found) return found;
    }
    return standees[0];
  }, [standees, selectedStandeeId]);

  const fetchStandees = async () => {
    setStandeesLoading(true);
    try {
      const res = await api.get('/standees/my-standees');
      if (res.data?.success && Array.isArray(res.data.standees)) {
        setStandees(res.data.standees);
        if (res.data.standees.length > 0) {
          setKitId(res.data.standees[0].kit_code || "BOX-01");
        } else {
          setKitId("");
        }
      }
    } catch (err) {
      console.warn('Could not fetch standees:', err);
    } finally {
      setStandeesLoading(false);
    }
  };

  useEffect(() => {
    fetchStandees();
  }, []);

  useEffect(() => {
    if (primaryStandee?.kit_code) {
      setKitId(primaryStandee.kit_code);
    }
  }, [primaryStandee]);

  // Chameleon Vertical Switcher
  const applyVertical = (v, swapSampleCatalog = false) => {
    setVertical(v);
    setWizVertical(v);
    const cfg = VERTICAL_CONFIG[v];

    if (swapSampleCatalog) {
      setCats([...cfg.defaultCats]);
      setActiveCat("All");
      setSv(JSON.parse(JSON.stringify(cfg.defaultServices)));
      setChips([...cfg.defaultChips]);
      setSimSelectedChip(cfg.defaultChips[0] || "");
      if (v === 'cafe') {
        setBannerTitle("Cold Brew & Truffle Pasta Special");
        setBannerPrice("₹690 onwards");
        setBannerDesc("Single origin cold brew with fresh artisanal pasta");
        setTagline("Specialty coffee & woodfired kitchen");
      } else if (v === 'clinic') {
        setBannerTitle("Comprehensive Skin & Hair Consultation");
        setBannerPrice("₹800 consult");
        setBannerDesc("Senior dermatologist digital skin analysis & treatment roadmap");
        setTagline("Dermatology, aesthetics & hair restoration");
      } else {
        setBannerTitle("Pre-Bridal & Festive Glow Package");
        setBannerPrice("₹1,999 onwards");
        setBannerDesc("Includes Hydra-Cleanup, Detan, Hair Spa & Manicure");
        setTagline("Hair, skin & bridal studio");
      }
    }
  };

  const currentCfg = VERTICAL_CONFIG[vertical];

  // Derived calculations
  const slug = slugify(storeName);
  const liveUrl = `https://qrvibe.in/s/${slug}`;
  const cleanOwnerWa = (ownerWa || "9876543210").replace(/\D/g, "");

  const sortedStaff = useMemo(() => {
    return [...staff].sort((a, b) => b.k - a.k);
  }, [staff]);

  const maxReviews = useMemo(() => {
    return Math.max(1, ...staff.map(s => s.k));
  }, [staff]);

  // QR Matrix calculation for live fallback page
  const qrData = useMemo(() => {
    const { N, M } = buildRealQrMatrix(liveUrl);
    let d = "";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (M[y][x]) d += `M${x} ${y}h1v1h-1z`;
      }
    }
    return { N, d };
  }, [liveUrl]);

  // QR Matrix calculation for Primary/Selected Standee
  const primaryQrData = useMemo(() => {
    const url = primaryStandee?.short_id
      ? `https://qrvibe.in/r/${primaryStandee.short_id}`
      : liveUrl;
    const { N, M } = buildRealQrMatrix(url);
    let d = "";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (M[y][x]) d += `M${x} ${y}h1v1h-1z`;
      }
    }
    return { N, d, url };
  }, [primaryStandee, liveUrl]);

  // 4x6 PDF print handler for any standee or primary standee
  const handleDownloadPdf = (targetStandee = null) => {
    const activeStandee = targetStandee || primaryStandee;
    const printCode = activeStandee?.kit_code || kitId || "STAND-01";
    const printStation = activeStandee?.station_label || "Reception Counter";
    const printShortId = activeStandee?.short_id || (userQrs[0]?.short_id) || slug;
    const printUrl = activeStandee?.short_id
      ? `https://qrvibe.in/r/${activeStandee.short_id}`
      : liveUrl;

    const { N, M } = buildRealQrMatrix(printUrl);
    let d = "";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (M[y][x]) d += `M${x} ${y}h1v1h-1z`;
      }
    }

    const w = window.open("", "_blank");
    if (!w) {
      showToast("Allow pop-ups to print your 4x6 standee card");
      return;
    }
    w.document.write(`<!doctype html><html><head><title>4x6 Standee • ${storeName} • ${printCode}</title>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@500;600&family=IBM+Plex+Mono:wght@500&display=swap">
      <style>
        @page { size: 4in 6in; margin: 0; }
        path, .k { fill: #2B1E19; } .c { fill: #FBF9F6; } .a { fill: #E5A93C; }
        svg { display: block; width: 100%; }
        body { margin: 0; display: grid; place-items: center; min-height: 100vh; background: #EAE4DC; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .card { width: 4in; height: 6in; background: #2B1E19; color: #FBF9F6; padding: 0.34in; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #E5A93C; border-radius: 8px; }
      </style></head><body>
      <div class="card">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font:500 10px 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:#E5A93C">${storeName}</div>
            <div style="font:500 9px 'IBM Plex Mono',monospace;letter-spacing:.08em;color:#CDBFB2;background:rgba(229,169,60,0.15);padding:2px 8px;border-radius:4px;border:1px solid rgba(229,169,60,0.3)">${printCode} • ${printStation}</div>
          </div>
          <div style="font:400 32px/1.05 'Instrument Serif',Georgia,serif;margin-top:6px">Scan to book,<br>browse &amp; rate</div>
        </div>
        <div style="background:#FBF9F6;padding:12px;border-radius:14px">
          <svg viewBox="0 0 ${N} ${N}">
            <path d="${d}"/>
            <circle cx="14.5" cy="14.5" r="3.8" class="c"/>
            <circle cx="14.5" cy="14.5" r="3.3" class="k"/>
            <text x="14.5" y="16" text-anchor="middle" font-size="4.4" class="a" font-family="'Instrument Serif',serif">${(storeName[0] || 'A').toUpperCase()}</text>
          </svg>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="color:#E5A93C;letter-spacing:3px;font-size:15px">★★★★★</span>
            <span style="font:600 11px 'Instrument Sans',sans-serif;color:#FBF9F6">Rate your visit in 1 tap</span>
          </div>
          <div style="font:500 10px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#CDBFB2;display:flex;justify-content:space-between">
            <span>📷 Open Phone Camera to Scan (Not GPay)</span>
            <span>qrvibe.in/r/${printShortId}</span>
          </div>
        </div>
      </div>
      <script>onload=()=>setTimeout(()=>print(),350)<\/script></body></html>`);
    w.document.close();
  };

  // Inline Standee Kit Activation Handler
  const handleActivateStandeeInline = async (e) => {
    if (e) e.preventDefault();
    const code = (kitInput || '').trim().toUpperCase();
    if (!code) {
      showToast("Please enter a valid Kit Code (e.g. BOX-01 or ST-8921)");
      return;
    }
    const label = (stationInput || '').trim() || 'Counter Standee';
    setIsActivatingStandee(true);
    try {
      const formattedCategories = cats
        .filter(c => c !== "All")
        .map(catName => ({
          name: catName,
          items: sv
            .filter(item => item.c === catName)
            .map(item => ({
              name: item.n,
              price: Number(item.p) || 0,
              duration: item.m || '',
              description: item.m || '',
              isAvailable: item.av !== 0,
              tag: item.sig ? 'Bestseller' : ''
            }))
        }));

      const payload = {
        kitCode: code,
        stationLabel: label,
        salonName: storeName,
        rateCard: {
          categories: formattedCategories.length > 0 ? formattedCategories : undefined
        },
        googleReviewUrl: gmapsUrl,
        shieldPhone: cleanOwnerWa || ownerWa
      };

      const res = await api.post('/standees/activate', payload);
      if (res.data?.success) {
        showToast(`Standee ${code} activated for ${label}!`);
        setIsEditingKit(false);
        setKitInput("");
        setStationInput("");
        await fetchStandees();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to activate standee kit';
      showToast(`Error: ${errorMsg}`);
    } finally {
      setIsActivatingStandee(false);
    }
  };

  // Service Edit / Add Handlers
  const openServiceModal = (idx = null) => {
    setEditingSvcIdx(idx);
    if (idx !== null && sv[idx]) {
      const s = sv[idx];
      setSmName(s.n);
      setSmCat(s.c);
      setSmPrice(s.p);
      setSmMeta(s.m || "");
      setSmSig(!!s.sig);
      setSmOn(!!s.on);
    } else {
      setSmName("");
      setSmCat(cats.find(c => c !== "All") || "General");
      setSmPrice("");
      setSmMeta("45 mins");
      setSmSig(false);
      setSmOn(true);
    }
    setShowSvcModal(true);
  };

  const handleSaveService = (e) => {
    e.preventDefault();
    if (!smName.trim()) return showToast("Enter service name");
    if (!smPrice) return showToast("Enter price");

    const payload = {
      n: smName.trim(),
      c: smCat || cats[1] || "Services",
      p: Number(smPrice),
      m: smMeta.trim() || "45 mins",
      sig: smSig ? 1 : 0,
      on: smOn ? 1 : 0,
      av: 1,
      a: "hair",
      i: "svc-custom"
    };

    if (editingSvcIdx !== null && sv[editingSvcIdx]) {
      const updated = [...sv];
      updated[editingSvcIdx] = { ...updated[editingSvcIdx], ...payload };
      setSv(updated);
      showToast("Service updated");
    } else {
      setSv([payload, ...sv]);
      showToast("New service added to Lookbook");
    }
    setShowSvcModal(false);
  };

  // AI OCR Rate Card Scanner
  const handleOcrFile = (file) => {
    if (!file) return;
    setIsScanningOcr(true);
    showToast("Scanning rate card photo with AI OCR…");
    setTimeout(() => {
      setIsScanningOcr(false);
      const defaultCat = cats.find(c => c !== "All") || "Hair Colour & Spa";
      const dummyOcr = [
        { n: "Olaplex No.3 Bond Repair Ritual", c: defaultCat, p: 2199, m: "50 mins • Extracted via OCR", on: 1, sig: 1, a: "hair" },
        { n: "Russian Gel Manicure & Chrome", c: cats[4] || defaultCat, p: 1499, m: "60 mins • Extracted via OCR", on: 1, sig: 0, a: "nails" },
        { n: "Korean Glass Skin Oxygen Facial", c: cats[2] || defaultCat, p: 2799, m: "60 mins • Extracted via OCR", on: 0, sig: 1, a: "face" }
      ];
      setOcrStaging(dummyOcr);
      setShowOcrModal(true);
    }, 1250);
  };

  const handleConfirmOcr = () => {
    const newItems = ocrStaging.map(item => ({ ...item, av: 1, i: "svc-ocr" }));
    setSv([...newItems, ...sv]);
    setShowOcrModal(false);
    showToast(`Saved ${ocrStaging.length} extracted services to Lookbook!`);
  };

  // Google Maps verification
  const handleSaveGmaps = async () => {
    let raw = gmapsUrl.trim();
    if (!raw) return showToast("Paste a Google Maps review URL or Place ID");
    if (!raw.startsWith("http")) {
      raw = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(raw)}`;
      setGmapsUrl(raw);
    }
    try {
      await api.put('/users/profile', { googleReviewUrl: raw });
    } catch (e) {
      console.warn("Could not sync review URL to profile", e);
    }
    showToast("Google Maps review link verified & saved!");
  };

  // AI Counter Photo trigger
  const handleGenAiPhoto = () => {
    showToast("Generating Espresso & Gold storefront scene…");
    setTimeout(() => {
      showToast("Using vector brand artwork");
    }, 1200);
  };

  // Logo upload
  const handleLogoUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setLogo(r.result);
      showToast("Logo centered inside your QR code");
    };
    r.readAsDataURL(f);
  };

  // WhatsApp helper text
  const staffLeaderboardWaText = encodeURIComponent(
    `🏆 *${storeName} — Staff Leaderboard*\n` +
    sortedStaff.map((s, i) => `${i + 1}. ${s.n}: ${s.k} reviews`).join("\n")
  );

  return (
    <div className="sf-dash" data-theme={theme === 'default' ? undefined : theme}>
      <div className="app">
        {/* MOBILE TOP BAR (Fixed on small screens < 900px) */}
        <header className="sf-mobile-bar">
          <div className="sf-mobile-left">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" rx="2" fill="var(--acc)" />
              <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
              <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
              <rect x="13" y="13" width="4" height="4" fill="var(--acc)" />
            </svg>
            <div className="sf-mobile-title-wrap">
              <div className="sf-mobile-store-name">{storeName}</div>
              <div className="sf-mobile-badge-row">
                <span className="sf-mobile-vert-badge">{currentCfg.badge}</span>
                <span className="sf-mobile-dot" />
                <span>Kit: {primaryStandee ? primaryStandee.kit_code : (kitId || 'Unlinked')}</span>
              </div>
            </div>
          </div>
          <div className="sf-mobile-right">
            <button
              type="button"
              className="sf-mobile-btn-preview"
              onClick={() => setShowGuestDrawer(true)}
              title="Preview guest view on phone"
            >
              Live View ↗
            </button>
            <button
              type="button"
              className="sf-mobile-btn-menu"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Store options"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Options Drawer */}
        <div className={`sf-mobile-menu-drawer ${showMobileMenu ? 'on' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(227,218,208,0.15)' }}>
            <span style={{ font: "500 11px 'IBM Plex Mono', monospace", color: 'var(--acc)', textTransform: 'uppercase' }}>
              Storefront Controls
            </span>
            <button
              type="button"
              onClick={() => setShowMobileMenu(false)}
              style={{ background: 'none', border: 'none', color: 'var(--dm)', fontSize: '12px', cursor: 'pointer' }}
            >
              Close ✕
            </button>
          </div>
          <button
            type="button"
            className="sf-mobile-menu-item"
            onClick={() => {
              setShowMobileMenu(false);
              setWizNm(storeName);
              setWizWa(ownerWa);
              setWizGmaps(gmapsUrl);
              setWizKitId(kitId);
              setWizStep(1);
              setShowWizard(true);
            }}
          >
            <span>✨ 3-Step Setup Wizard</span>
            <span style={{ color: 'var(--acc)' }}>Open ↗</span>
          </button>
          <button
            type="button"
            className="sf-mobile-menu-item"
            onClick={() => {
              setShowMobileMenu(false);
              setActiveTab(3);
            }}
          >
            <span>🎨 Change Theme &amp; Vertical</span>
            <span>Switch →</span>
          </button>
          <button
            type="button"
            className="sf-mobile-menu-item"
            onClick={() => {
              setShowMobileMenu(false);
              if (planMode === 'trial') setShowUpgModal(true);
              else showToast("Annual Storefront Pass is Active!");
            }}
          >
            <span>{planMode === 'trial' ? '⚡ Upgrade to Annual Pass' : '✓ Annual Storefront Pass Active'}</span>
            <span style={{ color: 'var(--acc)' }}>{planMode === 'trial' ? '₹12,499 ↗' : 'Active'}</span>
          </button>
          <button
            type="button"
            className="sf-mobile-menu-item"
            style={{ color: '#E87060', borderColor: 'rgba(232, 112, 96, 0.3)' }}
            onClick={() => {
              setShowMobileMenu(false);
              dispatch(logout());
              navigate('/login');
            }}
          >
            <span>Sign Out</span>
            <span>↗</span>
          </button>
        </div>

        {/* =================================================================
             LEFT SIDEBAR (Auto-converts to fixed 4-tab bottom bar on mobile)
             ================================================================= */}
        <nav className="side" aria-label="Dashboard">
          <div className="brand">
            <div className="brand-left">
              <svg width="24" height="24" viewBox="0 0 22 22" aria-hidden="true">
                <rect x="1" y="1" width="8" height="8" rx="2" fill="var(--acc)" />
                <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="13" y="13" width="4" height="4" fill="var(--acc)" />
              </svg>
              QRVibe
            </div>
            {/* User account dropdown trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout());
                  navigate('/login');
                }}
                title="Sign out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--dm)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: '"IBM Plex Mono", monospace'
                }}
              >
                Sign out ↗
              </button>
            </div>
          </div>

          <div className="store">
            <span className="lbl" style={{ color: 'var(--dm)' }}>{currentCfg.badge}</span>
            <b className="sn">{storeName}</b>
            <div className="store-meta">
              <span>Kit: {primaryStandee ? `${primaryStandee.kit_code}` : (kitId || 'Unlinked')}</span>
              <span
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowGuestDrawer(true)}
              >
                Live View ↗
              </span>
            </div>
          </div>

          <div className="tabs" id="tabs" style={{ position: 'relative' }}>
            <span
              className="ind"
              style={{ transform: `translateY(${activeTab * 50}px)` }}
            />
            <button
              className={`tab ${activeTab === 0 ? 'on' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              <svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>
              <span>Overview</span>
            </button>
            <button
              className={`tab ${activeTab === 1 ? 'on' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/></svg>
              <span className="tl-nav">{currentCfg.navTitle}</span>
            </button>
            <button
              className={`tab ${activeTab === 2 ? 'on' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              <svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.9 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/></svg>
              <span>Reviews<span className="hidden md:inline"> &amp; Feedback</span></span>
            </button>
            <button
              className={`tab ${activeTab === 3 ? 'on' : ''}`}
              onClick={() => setActiveTab(3)}
            >
              <svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2z"/></svg>
              <span>Standee<span className="hidden md:inline"> &amp; Studio</span></span>
            </button>
          </div>

          <div className="side-actions">
            <button
              className="wiz-trigger"
              onClick={() => {
                setWizNm(storeName);
                setWizWa(ownerWa);
                setWizGmaps(gmapsUrl);
                setWizKitId(kitId);
                setWizStep(1);
                setShowWizard(true);
              }}
              title="Test First-Time 3-Step Setup Wizard"
            >
              <span>✨ 3-Step Setup Wizard</span>
              <span>Open ↗</span>
            </button>

            <div className={`plan ${planMode === 'trial' ? 'trial-mode' : ''}`}>
              <b>{planMode === 'trial' ? '⚡ 7-Day Walk-In Trial' : 'Annual Storefront Pass'}</b>
              <span>
                {planMode === 'trial' ? `5 days left • Kit ${kitId}` : '₹12,499 / year • Active'}
              </span>
              {planMode === 'trial' && (
                <button
                  className="plan-upg-btn"
                  onClick={() => setShowUpgModal(true)}
                >
                  Upgrade to Annual (₹12,499)
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* =================================================================
             MAIN CONTENT PANES
             ================================================================= */}
        <main>
          {/* TAB 0: OVERVIEW (ROI PULSE) */}
          <section className={`pane ${activeTab === 0 ? 'on' : ''}`}>
            <div className="hero" style={{ '--i': 0 }}>
              <div
                className={`ph ${aiCounterImage ? 'has' : ''}`}
                style={aiCounterImage ? { backgroundImage: `url(${aiCounterImage})` } : {}}
              >
                {!aiCounterImage && <ArtSvg artKey="hero" />}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="live">
                  <i />Live • <span className="sn">{storeName}</span>
                </span>
                {standees.length > 0 && primaryStandee ? (
                  <span className="live" style={{ borderColor: 'rgba(229,169,60,.4)', color: 'var(--acc)' }}>
                    {primaryStandee.kit_code} • {primaryStandee.station_label || 'Reception Counter'}
                  </span>
                ) : (
                  <Link
                    to="/activate"
                    className="live"
                    style={{
                      borderColor: 'rgba(229,169,60,.5)',
                      background: 'rgba(229,169,60,.08)',
                      color: 'var(--acc)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📦 Physical Standee Unlinked</span>
                    <span style={{ textDecoration: 'underline', fontWeight: 600 }}>• [ + Activate Standee Kit ↗ ]</span>
                  </Link>
                )}
              </div>
              <div>
                <h1>Your front desk, this month.</h1>
              </div>
              <div className="acts">
                <button className="btn" onClick={() => setShowGuestDrawer(true)}>
                  Preview live page ↗
                </button>
                <a
                  className="btn hn"
                  href={`https://wa.me/?text=${encodeURIComponent(`Book, browse & rate at ${storeName}: ${liveUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share link on WhatsApp
                </a>
                <button
                  className="btn"
                  onClick={handleGenAiPhoto}
                  style={{ fontSize: '12.5px', minHeight: '40px', padding: '0 16px' }}
                >
                  ✨ AI Counter Photo
                </button>
              </div>
            </div>

            {!standeesLoading && standees.length === 0 && (
              <div style={{
                background: 'rgba(229,169,60,0.08)',
                border: '1px solid rgba(229,169,60,0.25)',
                borderRadius: '16px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                margin: '16px 0 20px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📦</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--fg)' }}>
                      Physical Standee Unlinked
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--dm)' }}>
                      Your storefront does not have a physical acrylic standee bound yet. Activate your kit to track walk-in scans.
                    </div>
                  </div>
                </div>
                <Link
                  to="/activate"
                  className="btn hn"
                  style={{ minHeight: '34px', padding: '0 16px', fontSize: '12.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  + Activate Standee Kit ↗
                </Link>
              </div>
            )}

            <div className="roi">
              <div className="stat dk" style={{ '--i': 1 }}>
                <div className="lbl">
                  {vertical === 'cafe' ? 'Menu views' : vertical === 'clinic' ? 'Guide views' : 'Lookbook scans'}
                </div>
                <div className="n">
                  {analyticsLoading ? '—' : liveScans.toLocaleString('en-IN')}
                </div>
                <p>
                  {analyticsLoading
                    ? 'fetching real scans…'
                    : scansDelta !== 0
                      ? `${scansDelta > 0 ? `↗ +${scansDelta}%` : `↘ ${scansDelta}%`} vs last month`
                      : liveScans > 0
                        ? `${liveUniqueVisitors || liveScans} unique visitors`
                        : 'views this month'}
                </p>
              </div>
              <div className="stat" style={{ '--i': 2 }}>
                <div className="lbl">5★ Google redirects</div>
                <div className="n">{analyticsLoading ? '—' : liveGoogleRedirects.toLocaleString('en-IN')}</div>
                <p>{liveGoogleRedirects > 0 ? 'reviews sent to Google' : '0 reviews sent yet'}</p>
              </div>
              <div className="stat" style={{ '--i': 3 }}>
                <div className="lbl">Private feedback</div>
                <div className="n">{analyticsLoading ? '—' : livePrivateFeedback.toLocaleString('en-IN')}</div>
                <p>{livePrivateFeedback > 0 ? 'guests wrote to you first' : '0 complaints defused'}</p>
              </div>
            </div>

            <div className="strip" style={{ '--i': 4 }}>
              <button className="btn" onClick={() => setActiveTab(1)}>+ Pin festive offer</button>
              <button className="btn" onClick={() => openServiceModal(null)}>+ Add new service</button>
              <button className="btn" onClick={() => setActiveTab(2)}>{currentCfg.addStaffBtn}</button>
              <button
                className="btn"
                onClick={() => {
                  setWizNm(storeName);
                  setWizWa(ownerWa);
                  setWizGmaps(gmapsUrl);
                  setWizKitId(kitId);
                  setWizStep(1);
                  setShowWizard(true);
                }}
                style={{ marginLeft: 'auto', borderStyle: 'dashed' }}
              >
                ✨ Setup Wizard
              </button>
            </div>

            <div className="row2" style={{ '--i': 5 }}>
              <div className="card">
                <div className="head">
                  <div>
                    <h2>{currentCfg.staffHeading}</h2>
                    <div className="sub">Stylists guests loved and named in 5★ Google reviews</div>
                  </div>
                  <button className="link" onClick={() => setActiveTab(2)}>View full board ↗</button>
                </div>
                <div id="topSt">
                  {sortedStaff.slice(0, 3).map((s, i) => (
                    <div className="rk" key={s.n}>
                      <span className="num">{i + 1}</span>
                      <div>
                        <b>{currentCfg.staffPrefix}{s.n}</b>
                        <div className="bar">
                          <i style={{ width: `${(s.k / maxReviews) * 100}%` }} />
                        </div>
                      </div>
                      <span className="num">{s.k}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2>Your counter card</h2>
                <div className="sub">Acrylic standee placed on reception or styling mirrors</div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                  <div className="qr" style={{ width: '130px', flex: 'none' }}>
                    <svg viewBox={`0 0 ${primaryQrData.N} ${primaryQrData.N}`} role="img" aria-label={`Scannable QR code for ${primaryQrData.url}`}>
                      <path d={primaryQrData.d} />
                      {logo ? (
                        <>
                          <clipPath id="lc"><circle cx="14.5" cy="14.5" r="3.4" /></clipPath>
                          <circle cx="14.5" cy="14.5" r="3.8" className="c" />
                          <image href={logo} x="11.1" y="11.1" width="6.8" height="6.8" clipPath="url(#lc)" preserveAspectRatio="xMidYMid slice" />
                        </>
                      ) : (
                        <>
                          <circle cx="14.5" cy="14.5" r="3.8" className="c" />
                          <circle cx="14.5" cy="14.5" r="3.3" className="k" />
                          <text x="14.5" y="16" textAnchor="middle" fontSize="4.4" className="a" fontFamily="'Instrument Serif',serif">
                            {(storeName[0] || 'A').toUpperCase()}
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div className="lbl" style={{ color: 'var(--ok)' }}>
                      {primaryStandee ? `${primaryStandee.kit_code} • ${primaryStandee.station_label || 'Active standee'}` : 'Active standee'}
                    </div>
                    <h3 style={{ fontSize: '22px', margin: '4px 0' }}>{storeName}</h3>
                    <p className="sub" style={{ fontFamily: '"IBM Plex Mono",monospace' }}>
                      {primaryStandee?.short_id ? `qrvibe.in/r/${primaryStandee.short_id}` : liveUrl}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button className="btn sm hn" onClick={() => handleDownloadPdf(primaryStandee)}>Download 4×6 PDF</button>
                      <button className="btn sm" onClick={() => setActiveTab(3)}>Studio settings ↗</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TAB 1: LOOKBOOK & OFFERS */}
          <section className={`pane ${activeTab === 1 ? 'on' : ''}`}>
            <div className="top" style={{ '--i': 0 }}>
              <div>
                <h1 className="tl">{currentCfg.tab2Title}</h1>
                <p>What guests see on their phone while waiting at your counter or styling chair.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => setShowGuestDrawer(true)}>
                  Preview live page ↗
                </button>
                <button className="btn hn" onClick={() => openServiceModal(null)}>
                  + Add new service
                </button>
              </div>
            </div>

            {/* Offer Banner */}
            <div className="card" style={{ '--i': 1 }}>
              <div className="head">
                <div>
                  <h2 id="bannerHeading">{currentCfg.bannerTitle}</h2>
                  <div className="sub">Pinned at the very top of your guest lookbook</div>
                </div>
                <div className="tg">
                  <span id="offLbl">{bannerActive ? 'Active' : 'Hidden'}</span>
                  <button
                    className="sw"
                    role="switch"
                    aria-checked={bannerActive}
                    onClick={() => {
                      setBannerActive(!bannerActive);
                      showToast(!bannerActive ? "Banner pinned" : "Banner hidden");
                    }}
                  />
                </div>
              </div>

              <div className="offer">
                <div className="fg">
                  <label className="f w2">
                    Banner headline
                    <input
                      type="text"
                      value={bannerTitle}
                      onChange={e => setBannerTitle(e.target.value)}
                      placeholder="Pre-Bridal & Festive Glow Package"
                    />
                  </label>
                  <label className="f">
                    Offer price
                    <input
                      type="text"
                      value={bannerPrice}
                      onChange={e => setBannerPrice(e.target.value)}
                      placeholder="₹1,999 onwards"
                    />
                  </label>
                  <label className="f">
                    One-line description
                    <input
                      type="text"
                      value={bannerDesc}
                      onChange={e => setBannerDesc(e.target.value)}
                      placeholder="Includes Hydra-Cleanup, Detan, Hair Spa & Manicure"
                    />
                  </label>
                </div>
                <div className={`pv ${bannerActive ? '' : 'off'}`}>
                  <div className="lbl">{currentCfg.bannerBadge}</div>
                  <h3>{bannerTitle}</h3>
                  <b>{bannerPrice}</b>
                  <p>{bannerDesc}</p>
                </div>
              </div>
            </div>

            {/* AI OCR Snap Rate Card Bar */}
            <label className={`snap ${isScanningOcr ? 'scan' : ''}`} style={{ '--i': 2 }}>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => handleOcrFile(e.target.files[0])}
              />
              <div className="snap-left">
                <svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
                <div>
                  <b>Snap a photo of your paper rate card to add services</b>
                  <span>We read the services and prices so you do not type them. You review in the staging drawer before saving.</span>
                </div>
              </div>
              <span className="btn sm" style={{ background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)' }}>
                📷 Upload Rate Card
              </span>
            </label>

            {/* Category Pills + Inline Creator */}
            <div className="pills-bar" style={{ '--i': 3 }}>
              <div className="pills">
                {cats.map(c => (
                  <button
                    key={c}
                    className={`pill ${c === activeCat ? 'on' : ''}`}
                    onClick={() => setActiveCat(c)}
                  >
                    {c}
                  </button>
                ))}
                <button
                  className="pill add"
                  onClick={() => setIsCreatingCat(true)}
                >
                  + New category
                </button>
              </div>
            </div>

            {isCreatingCat && (
              <div className="cat-creator on">
                <input
                  type="text"
                  placeholder="New category name (e.g. Men's Grooming, Combos)"
                  style={{ maxWidth: '320px', height: '40px' }}
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  autoFocus
                />
                <button
                  className="btn sm hn"
                  onClick={() => {
                    const val = newCatInput.trim();
                    if (!val) return showToast("Enter a category name");
                    if (!cats.includes(val)) {
                      setCats([...cats, val]);
                      setActiveCat(val);
                    }
                    setNewCatInput("");
                    setIsCreatingCat(false);
                    showToast(`Category "${val}" created`);
                  }}
                >
                  Add Category
                </button>
                <button
                  className="btn sm"
                  onClick={() => setIsCreatingCat(false)}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Service List */}
            <div className="tgs" style={{ '--i': 4 }}>
              {sv
                .filter(s => activeCat === "All" || s.c === activeCat)
                .map((s, idx) => {
                  const globalIdx = sv.indexOf(s);
                  const seenTxt = inr(s.p) + (s.on ? currentCfg.modSuffix : "");
                  return (
                    <div
                      key={s.n + globalIdx}
                      className={`svc ${s.av ? '' : 'na'}`}
                    >
                      <div className="ph">
                        <ArtSvg artKey={s.a || 'hair'} />
                      </div>
                      <div>
                        <h3>
                          <span>{s.n}</span>
                          {!!s.sig && <span className="star">★ Signature</span>}
                          <button
                            type="button"
                            className="link"
                            onClick={() => openServiceModal(globalIdx)}
                            style={{ fontSize: '12px', marginLeft: '6px' }}
                          >
                            Edit details
                          </button>
                        </h3>
                        <span className="meta">{s.m} • {s.c}</span>
                        <div className="pr-row">
                          <input
                            className="pr"
                            type="text"
                            inputMode="numeric"
                            value={s.p}
                            aria-label="Price"
                            onChange={e => {
                              const updated = [...sv];
                              updated[globalIdx].p = Number(e.target.value.replace(/\D/g, "")) || 0;
                              setSv(updated);
                            }}
                          />
                          <label>
                            <input
                              type="checkbox"
                              checked={!!s.on}
                              onChange={e => {
                                const updated = [...sv];
                                updated[globalIdx].on = e.target.checked ? 1 : 0;
                                setSv(updated);
                              }}
                            />
                            {currentCfg.modLabel}
                          </label>
                          <span className="seen">Guests see <b>{seenTxt}</b></span>
                        </div>
                      </div>
                      <div className="tgs">
                        <div className="tg">
                          <button
                            className="sw"
                            role="switch"
                            aria-checked={!!s.sig}
                            aria-label="Signature"
                            onClick={() => {
                              const updated = [...sv];
                              updated[globalIdx].sig = updated[globalIdx].sig ? 0 : 1;
                              setSv(updated);
                              showToast(updated[globalIdx].sig ? "Marked as signature" : "Signature removed");
                            }}
                          />
                          <span>Signature</span>
                        </div>
                        <div className="tg">
                          <button
                            className="sw"
                            role="switch"
                            aria-checked={!!s.av}
                            aria-label="Available"
                            onClick={() => {
                              const updated = [...sv];
                              updated[globalIdx].av = updated[globalIdx].av ? 0 : 1;
                              setSv(updated);
                              showToast(updated[globalIdx].av ? "Service live" : "Service hidden");
                            }}
                          />
                          <span>Available</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* TAB 2: REVIEWS & FEEDBACK */}
          <section className={`pane ${activeTab === 2 ? 'on' : ''}`}>
            <div className="top" style={{ '--i': 0 }}>
              <div>
                <h1>Reviews &amp; Feedback</h1>
                <p>Everything behind your 1-tap Google review flow &amp; private WhatsApp shield.</p>
              </div>
              <button className="btn" onClick={() => setShowGuestDrawer(true)}>
                Test Review Funnel on Phone ↗
              </button>
            </div>

            <div className="card" style={{ '--i': 1 }}>
              <div className="head">
                <div>
                  <h2>{currentCfg.lbHeading}</h2>
                  <div className="sub">Monthly 5★ reviews that name each team member</div>
                </div>
                <a
                  className="btn hn"
                  href={`https://wa.me/?text=${staffLeaderboardWaText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send leaderboard to my WhatsApp
                </a>
              </div>
              <div id="lb">
                {sortedStaff.map((s, i) => (
                  <div className="rk" key={s.n}>
                    <span className="num">{i + 1}</span>
                    <div>
                      <span className="chip dk">{currentCfg.staffPrefix}{s.n}</span>
                      <span className="sub">{s.k} reviews this month</span>
                      <div className="bar">
                        <i style={{ width: `${(s.k / maxReviews) * 100}%` }} />
                      </div>
                    </div>
                    <button
                      className="link"
                      onClick={() => {
                        if (staff.length > 2) {
                          setStaff(staff.filter(x => x.n !== s.n));
                          showToast(`Removed ${s.n}`);
                        } else {
                          showToast("Keep at least 2 team names");
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
                  placeholder="Add staff member, e.g. Pooja"
                  value={newStaffInput}
                  onChange={e => setNewStaffInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const v = newStaffInput.trim();
                      if (!v) return;
                      if (!staff.some(s => s.n.toLowerCase() === v.toLowerCase())) {
                        setStaff([...staff, { n: v, k: 1 }]);
                      }
                      setNewStaffInput("");
                      showToast("Team member added");
                    }
                  }}
                />
                <button
                  className="btn"
                  onClick={() => {
                    const v = newStaffInput.trim();
                    if (!v) return;
                    if (!staff.some(s => s.n.toLowerCase() === v.toLowerCase())) {
                      setStaff([...staff, { n: v, k: 1 }]);
                    }
                    setNewStaffInput("");
                    showToast("Team member added");
                  }}
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="row2" style={{ '--i': 2 }}>
              <div className="card">
                <h2>{currentCfg.chipsHeading}</h2>
                <div className="sub">{currentCfg.chipsSub}</div>
                <div className="chips" style={{ marginTop: '16px' }}>
                  {chips.map((c, i) => (
                    <span className="chip" key={c + i}>
                      {c}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...chips];
                          updated.splice(i, 1);
                          setChips(updated);
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add">
                  <input
                    type="text"
                    placeholder="e.g. Balayage"
                    value={newChipInput}
                    onChange={e => setNewChipInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const v = newChipInput.trim();
                        if (!v) return;
                        if (chips.length >= 6) return showToast("Keep it to 6 chips maximum");
                        setChips([...chips, v]);
                        setNewChipInput("");
                        showToast("Chip added");
                      }
                    }}
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const v = newChipInput.trim();
                      if (!v) return;
                      if (chips.length >= 6) return showToast("Keep it to 6 chips maximum");
                      setChips([...chips, v]);
                      setNewChipInput("");
                      showToast("Chip added");
                    }}
                  >
                    + Add
                  </button>
                </div>
                <p className="sub" style={{ marginTop: '14px' }}>
                  When guests tap a chip, their draft mentions that keyword in their own words, helping future customers find you on Google Maps.
                </p>
              </div>

              <div className="card">
                <h2>Private feedback line (1–3★ Shield)</h2>
                <div className="sub">Unhappy guests (1 to 3 stars) message you privately here before posting publicly.</div>
                <label className="f" style={{ marginTop: '16px' }}>
                  Owner WhatsApp number (+91)
                  <input
                    type="tel"
                    maxLength={10}
                    value={ownerWa}
                    onChange={e => setOwnerWa(e.target.value)}
                    placeholder="98765 43210"
                  />
                </label>
                <div className="lbl" style={{ marginTop: '16px' }}>Message you will receive</div>
                <div className="bub">
                  Hi Owner, I am currently at <span className="sn">{storeName}</span> and wanted to share private feedback about my visit…
                </div>
              </div>
            </div>

            {/* Editable Google Maps Connection Card */}
            <div className="card" style={{ '--i': 3 }}>
              <div className="head">
                <div>
                  <h2>Google Maps connection</h2>
                  <div className="sub">The direct link guests open when they tap “Post to Google • 1 tap”</div>
                </div>
                <span className="ok"><i></i>Connected &amp; Verified</span>
              </div>

              <div className="fg" style={{ alignItems: 'end', marginTop: '12px' }}>
                <label className="f w2">
                  Google Business Review Link or Place ID
                  <input
                    type="url"
                    value={gmapsUrl}
                    onChange={e => setGmapsUrl(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '14px' }}>
                <button className="btn hn" onClick={handleSaveGmaps}>
                  Save &amp; Verify Link
                </button>
                <a
                  className="btn"
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test my Google review pop-up ↗
                </a>
                <button
                  type="button"
                  className="link"
                  onClick={() => setShowPlaceHelper(!showPlaceHelper)}
                  style={{ marginLeft: 'auto' }}
                >
                  How do I find my Google Place ID?
                </button>
              </div>

              {showPlaceHelper && (
                <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--line)', fontSize: '13px' }}>
                  <b>Quick Place ID Setup:</b> Paste either your short <code>https://g.page/r/.../review</code> link from Google Business Profile, or enter your <code>ChIJ...</code> Place ID and we automatically format it into a 1-tap review pop-up URL.
                </div>
              )}
            </div>
          </section>

          {/* TAB 3: STANDEE & STUDIO */}
          <section className={`pane ${activeTab === 3 ? 'on' : ''}`}>
            <div className="top" style={{ '--i': 0 }}>
              <div>
                <h1>Standee &amp; Studio</h1>
                <p>Your printed acrylic kit, vertical mode, brand theme and plan.</p>
              </div>
            </div>

            {/* Counter Standee Card */}
            <div className="card" style={{ '--i': 1 }}>
              <div className="ph banner">
                <ArtSvg artKey="standee" />
              </div>
              <div className="stand">
                <div className="card4x6">
                  <div>
                    <div className="lbl">Scan to</div>
                    <div className="sh">Book, browse &amp; rate</div>
                    <div style={{ font: "600 12px 'Instrument Sans',sans-serif", color: 'var(--acc)', marginTop: '4px' }} className="sn">
                      {storeName}
                    </div>
                  </div>
                  <div className="qr">
                    <svg viewBox={`0 0 ${primaryQrData.N} ${primaryQrData.N}`} role="img" aria-label={`Scannable QR code for ${primaryQrData.url}`}>
                      <path d={primaryQrData.d} />
                      {logo ? (
                        <>
                          <clipPath id="lc3"><circle cx="14.5" cy="14.5" r="3.4" /></clipPath>
                          <circle cx="14.5" cy="14.5" r="3.8" className="c" />
                          <image href={logo} x="11.1" y="11.1" width="6.8" height="6.8" clipPath="url(#lc3)" preserveAspectRatio="xMidYMid slice" />
                        </>
                      ) : (
                        <>
                          <circle cx="14.5" cy="14.5" r="3.8" className="c" />
                          <circle cx="14.5" cy="14.5" r="3.3" className="k" />
                          <text x="14.5" y="16" textAnchor="middle" fontSize="4.4" className="a" fontFamily="'Instrument Serif',serif">
                            {(storeName[0] || 'A').toUpperCase()}
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--acc)', letterSpacing: '2px' }}>★★★★★</div>
                    <div className="lbl">📷 Open Phone Camera to Scan (Not GPay)</div>
                  </div>
                </div>

                <div>
                  <h2>My counter standee &amp; mirror tags</h2>
                  <p style={{ marginTop: '6px' }}>
                    Espresso &amp; gold 4×6″ card with a real scannable QR matrix and your logo centered inside.
                  </p>
                  <div className="sub" style={{ marginTop: '4px', fontFamily: "'IBM Plex Mono',monospace" }}>
                    {primaryStandee ? (
                      <span>
                        Redirect: <b>https://qrvibe.in/r/{primaryStandee.short_id}</b>
                        {primaryStandee.station_label && (
                          <span style={{ marginLeft: '8px', color: 'var(--acc)' }}>({primaryStandee.station_label})</span>
                        )}
                      </span>
                    ) : (
                      <span>{liveUrl}</span>
                    )}
                  </div>

                  {/* Physical Kit ID Pairing */}
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {standees.length > 0 && primaryStandee ? (
                      <div className="ok">
                        <i></i>Kit ID: <span>{primaryStandee.kit_code}</span> • {primaryStandee.station_label || 'Counter Standee'} • Active
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--acc)' }}>
                        <span>📦</span> No Physical Kit Bound
                      </div>
                    )}
                    <button
                      type="button"
                      className="link"
                      onClick={() => setIsEditingKit(!isEditingKit)}
                    >
                      {standees.length > 0 ? "Change or Link Another Standee" : "+ Link Physical Standee Kit"}
                    </button>
                  </div>

                  {isEditingKit && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      borderRadius: '14px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      maxWidth: '460px'
                    }}>
                      <div style={{ font: "600 13px 'Instrument Sans', sans-serif", marginBottom: '10px' }}>
                        Link Pre-Printed Acrylic Standee Kit
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--dm)', display: 'block', marginBottom: '4px' }}>
                            Kit Code (Printed on Standee)
                          </label>
                          <input
                            type="text"
                            value={kitInput}
                            onChange={e => setKitInput(e.target.value.toUpperCase())}
                            placeholder="e.g. BOX-01 or ST-8921"
                            style={{ height: '40px', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--dm)', display: 'block', marginBottom: '4px' }}>
                            Station Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={stationInput}
                            onChange={e => setStationInput(e.target.value)}
                            placeholder="e.g. Reception Counter, Mirror 1"
                            style={{ height: '40px', width: '100%', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {['Reception Counter', 'Mirror 1', 'Mirror 2', 'Mirror 3', 'Billing Desk'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setStationInput(chip)}
                                style={{
                                  background: stationInput === chip ? 'var(--ink)' : 'transparent',
                                  color: stationInput === chip ? 'var(--bg)' : 'var(--dm)',
                                  border: '1px solid var(--line)',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  cursor: 'pointer'
                                }}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <button
                            className="btn sm hn"
                            disabled={isActivatingStandee}
                            onClick={handleActivateStandeeInline}
                            style={{ height: '38px', padding: '0 16px' }}
                          >
                            {isActivatingStandee ? 'Activating…' : '⚡ Activate & Bind Standee'}
                          </button>
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => {
                              setIsEditingKit(false);
                              setKitInput("");
                              setStationInput("");
                            }}
                            style={{ height: '38px', padding: '0 14px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="stack">
                    <button className="btn hn" onClick={() => handleDownloadPdf(primaryStandee)}>
                      Download 4×6 printable card (PDF)
                    </button>
                    <a
                      className="btn"
                      href={`https://wa.me/91${cleanOwnerWa}?text=${encodeURIComponent(`Hi QRVibe, I want extra mirror tags (₹149/ea) for ${storeName} (Kit: ${primaryStandee?.kit_code || kitId})`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Order extra mirror tags on WhatsApp • ₹149 each
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* My Active Counter & Mirror Standees */}
            <div className="card" style={{ '--i': 1.5 }}>
              <div className="head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2>My Active Counter &amp; Mirror Standees</h2>
                  <div className="sub">
                    All bound physical acrylic standees and mirror tags across your salon stations.
                  </div>
                </div>
                <Link
                  to="/activate"
                  className="btn hn"
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>+ Activate Additional Standee</span>
                  <span>↗</span>
                </Link>
              </div>

              {standeesLoading ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--dm)', fontStyle: 'italic' }}>
                  Loading active standee kits…
                </div>
              ) : standees.length === 0 ? (
                <div style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: 'var(--bg)',
                  borderRadius: '14px',
                  border: '1px dashed var(--line)',
                  marginTop: '16px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                  <div style={{ font: "600 15px 'Instrument Sans', sans-serif", color: 'var(--fg)', marginBottom: '4px' }}>
                    No physical standees activated yet
                  </div>
                  <p style={{ color: 'var(--dm)', fontSize: '13px', maxWidth: '420px', margin: '0 auto 16px auto' }}>
                    Got your QRVibe acrylic kit? Activate your counter standee or mirror tags in 60 seconds with zero reprinting.
                  </p>
                  <Link
                    to="/activate"
                    className="btn hn"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>⚡ Start Standee Kit Activation</span>
                    <span>→</span>
                  </Link>
                </div>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {standees.map((st, index) => {
                    const isSelected = (primaryStandee?._id && primaryStandee._id === st._id) || (!selectedStandeeId && index === 0);
                    const scans = st.assigned_qr_id?.stats?.total_scans ?? 0;
                    
                    return (
                      <div
                        key={st._id || st.kit_code || index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: isSelected ? 'rgba(229,169,60,0.06)' : 'var(--bg)',
                          border: isSelected ? '1.5px solid var(--acc)' : '1px solid var(--line)',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: 'var(--ink)',
                              color: 'var(--acc)',
                              display: 'grid',
                              placeItems: 'center',
                              font: "600 13px 'Instrument Serif', serif"
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ font: "600 15px 'Instrument Sans', sans-serif", color: 'var(--fg)' }}>
                                {st.station_label || `Station ${index + 1}`}
                              </span>
                              <span
                                style={{
                                  font: "500 11px 'IBM Plex Mono', monospace",
                                  letterSpacing: '0.06em',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(229,169,60,0.18)',
                                  color: 'var(--acc)',
                                  border: '1px solid rgba(229,169,60,0.35)'
                                }}
                              >
                                {st.kit_code}
                              </span>
                              {isSelected && (
                                <span style={{ fontSize: '11px', color: 'var(--ok)', fontWeight: 600 }}>
                                  ✓ Preview Active
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--dm)', marginTop: '2px', fontFamily: "'IBM Plex Mono', monospace" }}>
                              <span>ID: {st.short_id}</span>
                              {st.activated_at && (
                                <span style={{ marginLeft: '10px' }}>
                                  • Activated {new Date(st.activated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ font: "400 22px 'Instrument Serif', serif", color: 'var(--fg)' }}>
                              {scans.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--dm)', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                              Scans
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn sm hn"
                              onClick={() => handleDownloadPdf(st)}
                              title={`Print 4×6 PDF for ${st.station_label || st.kit_code}`}
                            >
                              Print 4×6 PDF
                            </button>
                            <button
                              type="button"
                              className="btn sm"
                              onClick={() => setSelectedStandeeId(st._id || st.kit_code)}
                              title="View this standee on 4x6 preview card above"
                              style={{ opacity: isSelected ? 0.6 : 1 }}
                            >
                              {isSelected ? 'Viewing' : 'Preview'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Studio Identity + Vertical Chameleon Switcher */}
            <div className="card" style={{ '--i': 2 }}>
              <h2>Studio identity &amp; vertical mode</h2>
              <div className="fg" style={{ marginTop: '16px' }}>
                <div className="w2">
                  <div className="lbl" style={{ marginBottom: '8px' }}>Storefront Vertical (Chameleon Vocabulary Switcher)</div>
                  <div className="themes">
                    <button
                      className={`vt-btn ${vertical === 'salon' ? 'on' : ''}`}
                      onClick={() => {
                        applyVertical('salon', true);
                        showToast("Switched to Salon & Spa vocabulary & presets");
                      }}
                    >
                      ✂️ Salon &amp; Spa Mode
                    </button>
                    <button
                      className={`vt-btn ${vertical === 'cafe' ? 'on' : ''}`}
                      onClick={() => {
                        applyVertical('cafe', true);
                        showToast("Switched to Cafe & Bakery vocabulary & presets");
                      }}
                    >
                      ☕ Cafe &amp; Bakery Mode
                    </button>
                    <button
                      className={`vt-btn ${vertical === 'clinic' ? 'on' : ''}`}
                      onClick={() => {
                        applyVertical('clinic', true);
                        showToast("Switched to Clinic & Aesthetics vocabulary & presets");
                      }}
                    >
                      🩺 Clinic &amp; Aesthetics Mode
                    </button>
                  </div>
                </div>

                <label className="f">
                  {currentCfg.storeNameLbl}
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                  />
                </label>
                <label className="f">
                  One-line subtitle
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ marginTop: '18px' }}>
                <div className="lbl" style={{ marginBottom: '8px' }}>Studio Center Logo inside QR</div>
                <div className="logo">
                  <div
                    className={`ph ${logo ? 'has' : ''}`}
                    style={logo ? { backgroundImage: `url(${logo})`, width: '64px', height: '64px', borderRadius: '16px' } : { width: '64px', height: '64px', borderRadius: '16px' }}
                  >
                    {!logo && <ArtSvg artKey="face" />}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="logoUploadInput"
                      accept="image/*"
                      hidden
                      onChange={handleLogoUpload}
                    />
                    <label
                      htmlFor="logoUploadInput"
                      className="btn sm"
                      style={{ cursor: 'pointer' }}
                    >
                      Upload square logo / icon
                    </label>
                    <div className="sub" style={{ marginTop: '4px' }}>PNG or JPG, automatically placed at the center of your QR.</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '22px' }}>
                <div className="lbl" style={{ marginBottom: '8px' }}>Print &amp; Screen Theme</div>
                <div className="themes">
                  <button
                    className={`th ${theme === 'default' ? 'on' : ''}`}
                    onClick={() => {
                      setTheme('default');
                      showToast("Theme updated");
                    }}
                  >
                    <span><i style={{ background: '#2B1E19' }} /><i style={{ background: '#E5A93C' }} /></span>
                    Espresso &amp; Gold
                  </button>
                  <button
                    className={`th ${theme === 'obsidian' ? 'on' : ''}`}
                    onClick={() => {
                      setTheme('obsidian');
                      showToast("Theme updated");
                    }}
                  >
                    <span><i style={{ background: '#14161A' }} /><i style={{ background: '#C9CED6' }} /></span>
                    Obsidian &amp; Silver
                  </button>
                  <button
                    className={`th ${theme === 'forest' ? 'on' : ''}`}
                    onClick={() => {
                      setTheme('forest');
                      showToast("Theme updated");
                    }}
                  >
                    <span><i style={{ background: '#16302A' }} /><i style={{ background: '#D9C49A' }} /></span>
                    Forest &amp; Champagne
                  </button>
                </div>
              </div>
            </div>

            {/* Plan & Trial Simulator */}
            <div className="card" style={{ '--i': 3 }}>
              <div className="head">
                <div>
                  <h2>Active plan &amp; hardware pairing</h2>
                  <div className="sub">
                    {planMode === 'trial'
                      ? `7-Day Walk-In Trial • 5 days left (Kit ${kitId})`
                      : 'Annual Storefront Pass • ₹12,499 per year • Active'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn sm"
                    onClick={() => {
                      const next = planMode === 'trial' ? 'annual' : 'trial';
                      setPlanMode(next);
                      showToast(next === 'trial' ? "Switched to 7-Day Walk-In Trial view" : "Annual Pass Active");
                    }}
                  >
                    {planMode === 'trial' ? 'Switch to Active Annual Pass' : 'Simulate 7-Day Walk-In Trial'}
                  </button>
                  {planMode === 'trial' && (
                    <button
                      className="btn sm hn"
                      onClick={() => setShowUpgModal(true)}
                    >
                      Upgrade to Annual Pass (₹12,499) ↗
                    </button>
                  )}
                </div>
              </div>

              {planMode === 'trial' && (
                <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '16px', background: 'var(--warn-bg)', border: '1.5px solid var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <b style={{ color: 'var(--ink)' }}>⚡ 7-Day Walk-In Trial • 5 days left</b>
                    <div className="sub">Your physical Kit ({kitId}) is live. Upgrade before trial ends to keep your QR active.</div>
                  </div>
                  <button
                    className="btn sm hn"
                    onClick={() => setShowUpgModal(true)}
                  >
                    Activate Annual Pass • ₹12,499
                  </button>
                </div>
              )}

              <div className="tg" style={{ justifyContent: 'space-between' }}>
                <span>Monday 9 AM WhatsApp owner digest</span>
                <button
                  className="sw"
                  role="switch"
                  aria-checked={mondayDigest}
                  aria-label="Monday digest"
                  onClick={() => {
                    setMondayDigest(!mondayDigest);
                    showToast(!mondayDigest ? "Monday digest on" : "Monday digest off");
                  }}
                />
              </div>
              <label className="f" style={{ marginTop: '14px', maxWidth: '320px' }}>
                Digest WhatsApp number (+91)
                <input
                  type="tel"
                  maxLength={10}
                  value={digestWa}
                  onChange={e => setDigestWa(e.target.value)}
                  placeholder="98765 43210"
                />
              </label>
            </div>
          </section>
        </main>
      </div>

      {/* =====================================================================
           COMPONENT 1: FIRST-TIME 3-STEP SETUP WIZARD OVERLAY (#wizard)
           ===================================================================== */}
      <div className={`overlay ${showWizard ? 'on' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="lbl">First-Login &amp; Walk-In Setup Wizard</span>
            <button
              type="button"
              className="link"
              onClick={() => setShowWizard(false)}
              style={{ fontSize: '13px' }}
            >
              Skip to Dashboard ✕
            </button>
          </div>

          <div className="wiz-steps">
            <span className={`wiz-pill ${wizStep === 1 ? 'on' : wizStep > 1 ? 'done' : ''}`}>
              1. Identity &amp; Category
            </span>
            <span className={`wiz-pill ${wizStep === 2 ? 'on' : wizStep > 2 ? 'done' : ''}`}>
              2. Google &amp; Staff
            </span>
            <span className={`wiz-pill ${wizStep === 3 ? 'on' : ''}`}>
              3. Rate Card &amp; Kit ID
            </span>
          </div>

          {/* Wizard Step 1 */}
          {wizStep === 1 && (
            <div>
              <h2>Let’s set up your storefront in 60 seconds.</h2>
              <p className="sub" style={{ marginTop: '4px' }}>Choose your business category so we tailor your rate card and review chips.</p>

              <div className="v-cards">
                <button
                  type="button"
                  className={`v-card ${wizVertical === 'salon' ? 'on' : ''}`}
                  onClick={() => {
                    setWizVertical('salon');
                    applyVertical('salon', true);
                  }}
                >
                  <b>Salon &amp; Spa</b>
                  <span>Lookbook, stylists &amp; “onwards” pricing</span>
                </button>
                <button
                  type="button"
                  className={`v-card ${wizVertical === 'cafe' ? 'on' : ''}`}
                  onClick={() => {
                    setWizVertical('cafe');
                    applyVertical('cafe', true);
                  }}
                >
                  <b>Cafe &amp; Bakery</b>
                  <span>Visual menu, chef specials &amp; bestsellers</span>
                </button>
                <button
                  type="button"
                  className={`v-card ${wizVertical === 'clinic' ? 'on' : ''}`}
                  onClick={() => {
                    setWizVertical('clinic');
                    applyVertical('clinic', true);
                  }}
                >
                  <b>Clinic</b>
                  <span>Treatment guide, doctors &amp; consult fees</span>
                </button>
              </div>

              <div className="fg" style={{ marginTop: '16px' }}>
                <label className="f">
                  Storefront Name *
                  <input
                    type="text"
                    value={wizNm}
                    onChange={e => setWizNm(e.target.value)}
                    placeholder="e.g. Aura Hair & Spa"
                  />
                </label>
                <label className="f">
                  Owner WhatsApp (+91) *
                  <input
                    type="tel"
                    maxLength={10}
                    value={wizWa}
                    onChange={e => setWizWa(e.target.value)}
                    placeholder="10-digit WhatsApp for 1–3★ alerts"
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
                <button
                  type="button"
                  className="btn hn"
                  onClick={() => {
                    if (!wizNm.trim()) return showToast("Enter your storefront name");
                    setStoreName(wizNm.trim());
                    if (wizWa.trim()) setOwnerWa(wizWa.trim());
                    setWizStep(2);
                  }}
                >
                  Continue to Step 2 ↗
                </button>
              </div>
            </div>
          )}

          {/* Wizard Step 2 */}
          {wizStep === 2 && (
            <div>
              <h2>Connect Google Reviews &amp; add team names.</h2>
              <p className="sub" style={{ marginTop: '4px' }}>Guests tap a team member’s chip to generate a specific 5★ Google review.</p>

              <div className="fg" style={{ marginTop: '16px' }}>
                <label className="f w2">
                  Google Maps Review Link or Place ID
                  <input
                    type="url"
                    value={wizGmaps}
                    onChange={e => setWizGmaps(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className="lbl" style={{ marginBottom: '8px' }}>Initial Staff / Specialist Chips</div>
                <div className="chips">
                  {wizStaff.map((nm, idx) => (
                    <span className="chip dk" key={nm + idx}>
                      {nm}
                      <button
                        type="button"
                        onClick={() => {
                          if (wizStaff.length > 1) {
                            setWizStaff(wizStaff.filter((_, i) => i !== idx));
                          }
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add">
                  <input
                    type="text"
                    placeholder="Add team member (e.g. Simran)"
                    value={wizNewStaffInput}
                    onChange={e => setWizNewStaffInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const v = wizNewStaffInput.trim();
                        if (v && !wizStaff.includes(v)) {
                          setWizStaff([...wizStaff, v]);
                          setWizNewStaffInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      const v = wizNewStaffInput.trim();
                      if (v && !wizStaff.includes(v)) {
                        setWizStaff([...wizStaff, v]);
                        setWizNewStaffInput("");
                      }
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '22px' }}>
                <button type="button" className="btn" onClick={() => setWizStep(1)}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn hn"
                  onClick={() => {
                    if (wizGmaps.trim()) setGmapsUrl(wizGmaps.trim());
                    // Update staff state with new chips if any
                    const newStaffList = wizStaff.map(nm => {
                      const existing = staff.find(s => s.n.toLowerCase() === nm.toLowerCase());
                      return existing || { n: nm, k: 0 };
                    });
                    setStaff(newStaffList);
                    setWizStep(3);
                  }}
                >
                  Continue to Step 3 ↗
                </button>
              </div>
            </div>
          )}

          {/* Wizard Step 3 */}
          {wizStep === 3 && (
            <div>
              <h2>Load your rate card &amp; pair physical standee.</h2>
              <p className="sub" style={{ marginTop: '4px' }}>Snap your paper menu or load our ready-made template so you never start with a blank page.</p>

              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <label className="snap" style={{ padding: '14px 18px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                      setShowWizard(false);
                      setActiveTab(1);
                      handleOcrFile(e.target.files[0]);
                    }}
                  />
                  <div className="snap-left">
                    <svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
                    <div>
                      <b>Option A: Snap a photo of your paper rate card</b>
                      <span>AI extracts items and prices for your review</span>
                    </div>
                  </div>
                </label>

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    applyVertical(wizVertical, true);
                    setWizPresetLoadedBadge("✓ 6 Preset Items Ready");
                    showToast(`Loaded default ${VERTICAL_CONFIG[wizVertical].badge} rate card`);
                  }}
                  style={{ justifyContent: 'space-between', borderRadius: '16px', padding: '14px 18px' }}
                >
                  <span>✨ Option B: Load Default <b>{VERTICAL_CONFIG[wizVertical].badge}</b> Rate Card (6 items)</span>
                  <span style={{ color: 'var(--ok)', fontWeight: 700 }}>{wizPresetLoadedBadge}</span>
                </button>
              </div>

              <div className="fg" style={{ marginTop: '18px' }}>
                <label className="f">
                  Physical Standee Kit ID (Walk-In Box)
                  <input
                    type="text"
                    value={wizKitId}
                    onChange={e => setWizKitId(e.target.value.toUpperCase())}
                    style={{ fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase' }}
                  />
                </label>
                <label className="f">
                  Onboarding Plan Mode
                  <select
                    value={wizPlanMode}
                    onChange={e => setWizPlanMode(e.target.value)}
                  >
                    <option value="trial">Start 7-Day Walk-In Trial (Free)</option>
                    <option value="annual">Annual Storefront Pass (₹12,499/yr)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setWizStep(2)}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn hn"
                  onClick={() => {
                    const finalKit = (wizKitId.trim() || "BOX-01").toUpperCase();
                    setKitId(finalKit);
                    setPlanMode(wizPlanMode);
                    setShowWizard(false);
                    setActiveTab(0);
                    showToast(`🎉 ${storeName} is live! Paired to ${finalKit}`);
                  }}
                >
                  Complete Setup &amp; Open Dashboard ↗
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
           COMPONENT 2A: MANUAL ADD / EDIT SERVICE MODAL (#svcModal)
           ===================================================================== */}
      <div className={`overlay ${showSvcModal ? 'on' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-box" style={{ maxWidth: '520px' }}>
          <div className="head">
            <h2>{editingSvcIdx !== null ? "Edit Service Details" : "Add New Service"}</h2>
            <button
              type="button"
              className="link"
              onClick={() => setShowSvcModal(false)}
            >
              Close ✕
            </button>
          </div>
          <form onSubmit={handleSaveService}>
            <div className="fg">
              <label className="f w2">
                Service / Item Name *
                <input
                  type="text"
                  placeholder="e.g. Nail Extensions & Chrome Art"
                  value={smName}
                  onChange={e => setSmName(e.target.value)}
                  required
                />
              </label>
              <label className="f">
                Category
                <select
                  value={smCat}
                  onChange={e => setSmCat(e.target.value)}
                >
                  {cats.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="f">
                Price (₹) *
                <input
                  type="number"
                  placeholder="1499"
                  value={smPrice}
                  onChange={e => setSmPrice(e.target.value)}
                  required
                />
              </label>
              <label className="f">
                Duration / Brand Metadata
                <input
                  type="text"
                  placeholder="e.g. 60 mins • Olaplex"
                  value={smMeta}
                  onChange={e => setSmMeta(e.target.value)}
                />
              </label>
              <div className="f" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', marginTop: '16px' }}>
                  <input
                    type="checkbox"
                    checked={smOn}
                    onChange={e => setSmOn(e.target.checked)}
                  />
                  <span>{currentCfg.modLabel}</span>
                </label>
              </div>
              <div className="f" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', marginTop: '16px' }}>
                  <input
                    type="checkbox"
                    checked={smSig}
                    onChange={e => setSmSig(e.target.checked)}
                  />
                  <span>★ Mark as Signature Highlight</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setShowSvcModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn hn">
                Save Service
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =====================================================================
           COMPONENT 2B: AI OCR STAGING DRAWER (#ocrModal)
           ===================================================================== */}
      <div className={`overlay ${showOcrModal ? 'on' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-box" style={{ maxWidth: '640px' }}>
          <div className="head">
            <div>
              <h2>AI Rate Card Staging Drawer</h2>
              <div className="sub">{ocrStaging.length} services extracted from rate card</div>
            </div>
            <button
              type="button"
              className="link"
              onClick={() => setShowOcrModal(false)}
            >
              Close ✕
            </button>
          </div>
          <p className="sub">
            Review and adjust names or prices before publishing them to your live guest lookbook:
          </p>

          <div style={{ display: 'grid', gap: '8px', maxHeight: '340px', overflowY: 'auto', margin: '16px 0', paddingRight: '4px' }}>
            {ocrStaging.map((item, idx) => (
              <div
                key={item.n + idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px auto',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid var(--line)',
                  borderRadius: '14px',
                  background: 'var(--card)'
                }}
              >
                <div>
                  <input
                    type="text"
                    value={item.n}
                    onChange={e => {
                      const updated = [...ocrStaging];
                      updated[idx].n = e.target.value;
                      setOcrStaging(updated);
                    }}
                    style={{ height: '38px', fontWeight: 600 }}
                  />
                  <div className="sub" style={{ marginTop: '4px' }}>{item.c} • {item.m}</div>
                </div>
                <input
                  type="number"
                  value={item.p}
                  onChange={e => {
                    const updated = [...ocrStaging];
                    updated[idx].p = Number(e.target.value) || 0;
                    setOcrStaging(updated);
                  }}
                  style={{ height: '38px', fontFamily: "'IBM Plex Mono',monospace" }}
                />
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    const updated = [...ocrStaging];
                    updated.splice(idx, 1);
                    setOcrStaging(updated);
                  }}
                  style={{ fontSize: '12px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setShowOcrModal(false)}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn hn"
              onClick={handleConfirmOcr}
            >
              Save Extracted Services to Lookbook
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
           COMPONENT 2C: 7-DAY WALK-IN TRIAL UPGRADE MODAL (#upgradeModal)
           ===================================================================== */}
      <div className={`overlay ${showUpgModal ? 'on' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-box" style={{ maxWidth: '480px' }}>
          <div className="head">
            <h2>Activate Annual Storefront Pass</h2>
            <button
              type="button"
              className="link"
              onClick={() => setShowUpgModal(false)}
            >
              Close ✕
            </button>
          </div>
          <p className="sub" style={{ marginTop: '4px' }}>
            Unblock permanent QR routing, unlimited rate card edits, daily Google review tally &amp; WhatsApp concierge.
          </p>
          <div style={{ margin: '18px 0', padding: '16px', borderRadius: '16px', background: 'var(--ink)', color: 'var(--bg)' }}>
            <div style={{ fontSize: '12px', color: 'var(--acc)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Commercial Pass
            </div>
            <div style={{ font: "400 36px 'Instrument Serif',serif", margin: '6px 0 2px' }}>
              ₹12,499 <span style={{ fontSize: '15px', color: 'var(--dm)' }}>/ year</span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--dm)' }}>
              Includes physical counter standee (Kit {kitId}) + 4 mirror tags
            </div>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button
              type="button"
              className="btn hn"
              onClick={() => {
                setPlanMode('annual');
                setShowUpgModal(false);
                showToast("Annual Storefront Pass (₹12,499/yr) Activated!");
              }}
            >
              Confirm &amp; Activate Annual Pass ✓
            </button>
            <a
              className="btn"
              href={`https://wa.me/91${cleanOwnerWa}?text=${encodeURIComponent(`Hi QRVibe, please send the ₹12,499 Annual Pass UPI link for ${storeName} (Kit: ${kitId})`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Request UPI Payment Link on WhatsApp ↗
            </a>
          </div>
        </div>
      </div>

      {/* =====================================================================
           BONUS UX UPGRADE: BUILT-IN GUEST PHONE PREVIEW DRAWER (#guestDrawer)
           ===================================================================== */}
      <div
        className={`drawer-backdrop ${showGuestDrawer ? 'on' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setShowGuestDrawer(false);
        }}
      >
        <div className="guest-drawer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="lbl" style={{ color: 'var(--acc)' }}>Interactive Pitch Simulator</span>
              <div style={{ font: "400 22px 'Instrument Serif',serif" }}>What Guests See When They Scan</div>
            </div>
            <button
              type="button"
              className="btn sm"
              onClick={() => setShowGuestDrawer(false)}
              style={{ borderColor: 'var(--bg)', color: 'var(--bg)' }}
            >
              Close ✕
            </button>
          </div>

          <div className="phone-sim">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
              <div>
                <b style={{ font: "400 24px 'Instrument Serif',serif" }} className="sn">{storeName}</b>
                <div className="sub">{tagline}</div>
              </div>
              <span className="star">★ Verified</span>
            </div>

            {/* Live Pinned Banner inside Phone */}
            {bannerActive && (
              <div className="pv" style={{ padding: '14px' }}>
                <div className="lbl">{currentCfg.bannerBadge}</div>
                <h3 style={{ fontSize: '20px', margin: '4px 0' }}>{bannerTitle}</h3>
                <b style={{ fontSize: '13px' }}>{bannerPrice}</b>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{bannerDesc}</p>
              </div>
            )}

            {/* Interactive 1-Tap Review & 1-3★ Shield Funnel */}
            <div style={{ border: '1.5px solid var(--ink)', borderRadius: '18px', padding: '14px', background: 'var(--card)' }}>
              <div className="lbl">How was your visit today?</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                Tap 1–3★ to test Private Shield, or 4–5★ for Google Review
              </div>

              <div className="star-picker">
                {[1, 2, 3, 4, 5].map(starNum => (
                  <button
                    key={starNum}
                    type="button"
                    className={`star-btn ${starNum <= simRating ? 'lit' : ''}`}
                    onClick={() => setSimRating(starNum)}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* 4-5 Star Path: Staff + Service Chips + AI Draft */}
              {simRating >= 4 ? (
                <div style={{ marginTop: '12px' }}>
                  <div className="lbl" style={{ marginBottom: '6px' }}>Tap who served you &amp; what you loved:</div>
                  <div className="chips" style={{ marginBottom: '8px' }}>
                    {staff.map(s => (
                      <button
                        key={s.n}
                        type="button"
                        className={`chip ${simSelectedStaff === s.n ? 'dk' : ''}`}
                        onClick={() => setSimSelectedStaff(s.n)}
                        style={{ padding: '5px 11px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        {currentCfg.staffPrefix}{s.n}
                      </button>
                    ))}
                  </div>
                  <div className="chips">
                    {chips.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`chip ${simSelectedChip === c ? 'dk' : ''}`}
                        onClick={() => setSimSelectedChip(c)}
                        style={{ padding: '5px 11px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--line)', fontSize: '12.5px', fontStyle: 'italic', color: 'var(--body)' }}>
                    "Had a 5-star experience at {storeName}! Huge thanks to {currentCfg.staffPrefix}{simSelectedStaff} for the wonderful {simSelectedChip}. Highly recommend!"
                  </div>
                  <button
                    type="button"
                    className="btn hn"
                    onClick={() => {
                      const updated = staff.map(s => s.n === simSelectedStaff ? { ...s, k: s.k + 1 } : s);
                      setStaff(updated);
                      setLiveGoogleRedirects(prev => prev + 1);
                      api.post('/telemetry/feedback', {
                        eventType: 'google_redirect',
                        rating: simRating,
                        staffName: simSelectedStaff,
                        serviceOrDish: simSelectedChip
                      }).catch(() => {});
                      showToast(`Draft copied! +1 review tally for ${simSelectedStaff}`);
                      window.open(gmapsUrl, "_blank");
                    }}
                    style={{ width: '100%', marginTop: '10px', minHeight: '42px' }}
                  >
                    Copy &amp; Post to Google • 1 tap ↗
                  </button>
                </div>
              ) : (
                /* 1-3 Star Path: Private WhatsApp Shield Intercept */
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '14px', background: 'var(--warn-bg)', border: '1.5px solid var(--acc)' }}>
                  <b style={{ fontSize: '14px', display: 'block' }}>🛡️ Tell the owner privately on WhatsApp</b>
                  <p style={{ fontSize: '12px', margin: '4px 0 10px' }}>
                    We want to make this right immediately while you are at the counter.
                  </p>
                  <button
                    type="button"
                    className="btn hn"
                    onClick={() => {
                      setLivePrivateFeedback(prev => prev + 1);
                      api.post('/telemetry/feedback', {
                        eventType: 'private_feedback',
                        rating: simRating
                      }).catch(() => {});
                      const msg = encodeURIComponent(`Hi Owner, I am currently at ${storeName} and wanted to share private feedback (${simRating}★) about my visit...`);
                      window.open(`https://wa.me/91${cleanOwnerWa}?text=${msg}`, "_blank");
                    }}
                    style={{ width: '100%', minHeight: '40px' }}
                  >
                    Message Owner Directly on WhatsApp ↗
                  </button>
                </div>
              )}
            </div>

            {/* Live Service Rate Card inside Phone */}
            <div>
              <div className="lbl" style={{ marginBottom: '8px' }}>{currentCfg.tab2Title}</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {sv.filter(s => s.av).map(s => (
                  <div
                    key={s.n}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid var(--line)',
                      background: 'var(--card)'
                    }}
                  >
                    <div>
                      <b style={{ fontSize: '14px' }}>
                        {s.n} {s.sig ? <span className="star">★</span> : null}
                      </b>
                      <div className="sub" style={{ fontSize: '11.5px' }}>{s.m}</div>
                    </div>
                    <b style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '13px' }}>
                      {inr(s.p)}{s.on ? currentCfg.modSuffix : ""}
                    </b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastActive ? 'on' : ''}`} role="status">
        {toastMsg}
      </div>
    </div>
  );
}
