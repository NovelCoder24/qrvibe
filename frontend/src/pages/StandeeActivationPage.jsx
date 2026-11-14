import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sparkles,
  CheckCircle2,
  Camera,
  Zap,
  Store,
  MapPin,
  Shield,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  Scissors,
  Star,
  Phone,
  UploadCloud,
  Check,
  ChevronDown,
  ChevronUp,
  QrCode,
  Lock,
  Mail,
  User as UserIcon,
  HelpCircle,
  Printer
} from 'lucide-react';
import api, { parseMenuPhotos } from '../api/axios';
import { login, register, loginSuccess } from '../redux/authSlice';
import StyledQRCode from '../components/StyledQRCode';
import { compressImageForUpload } from '../utils/imageCompressor';

// Standard Starter Lookbook for Salon & Studio Beachhead
const SALON_STARTER_CATEGORIES = [
  {
    id: 'cat-hair',
    name: 'Hair Colour & Spa',
    items: [
      {
        id: 'item-keratin',
        name: 'L’Oréal Keratin Smooth Treatment',
        price: 2499,
        duration: '60 mins',
        brandUsed: 'L’Oréal Professionnel',
        targetGender: 'Unisex',
        description: 'Deep nourishing smoothing therapy with lasting anti-frizz effect.',
        isAvailable: true,
        tag: 'Bestseller'
      },
      {
        id: 'item-colour',
        name: 'Global Colour & Gloss',
        price: 3400,
        duration: '120 mins',
        brandUsed: 'Schwarzkopf',
        targetGender: 'Unisex',
        description: 'Complete high-shine rich tone hair color with plex bond protection.',
        isAvailable: true
      },
      {
        id: 'item-spa',
        name: 'Moroccan Oil Hair Spa & Massage',
        price: 1800,
        duration: '45 mins',
        brandUsed: 'Moroccanoil',
        targetGender: 'Unisex',
        description: 'Intense hydration masque, steam infusion and relaxing head massage.',
        isAvailable: true
      },
      {
        id: 'item-cut',
        name: 'Creative Cut, Wash & Blowdry',
        price: 799,
        duration: '35 mins',
        brandUsed: 'Dyson / TIGI',
        targetGender: 'Unisex',
        description: 'Consultation, scalp wash, custom precision cut and signature styling.',
        isAvailable: true
      }
    ]
  },
  {
    id: 'cat-facials',
    name: 'Facials & Skin Care',
    items: [
      {
        id: 'item-hydrafacial',
        name: 'HydraFacial Glow & Pore Detox',
        price: 2100,
        duration: '45 mins',
        brandUsed: 'Hydra Derm',
        targetGender: 'Unisex',
        description: 'Vortex suction extraction, deep hydration infusion and instant skin glass glow.',
        isAvailable: true,
        tag: 'Most Popular'
      },
      {
        id: 'item-bridal-facial',
        name: 'O3+ Bridal Brightening Ritual',
        price: 2800,
        duration: '60 mins',
        brandUsed: 'O3+ Professional',
        targetGender: 'Unisex',
        description: 'Multi-step skin clarifying, peel-off algae mask and radiance booster.',
        isAvailable: true
      },
      {
        id: 'item-dtan',
        name: 'Organic D-Tan & Clean-Up',
        price: 899,
        duration: '30 mins',
        brandUsed: 'Raaga / Cheryls',
        targetGender: 'Unisex',
        description: 'Instant tan removal cream, herbal steam and pore-clearing blackhead extraction.',
        isAvailable: true
      }
    ]
  },
  {
    id: 'cat-bridal',
    name: 'Bridal & Special Occasions',
    items: [
      {
        id: 'item-pre-bridal',
        name: 'Pre-Bridal Luxury Radiance Package',
        price: 4999,
        duration: '180 mins',
        brandUsed: 'Salon Premium Suite',
        targetGender: 'Female',
        description: 'Full body polish, luxury gold facial, hair spa, manicure and pedicure.',
        isAvailable: true,
        tag: 'Signature'
      },
      {
        id: 'item-bridal-mu',
        name: 'HD Bridal Make-Up & Saree Draping',
        price: 12000,
        duration: '150 mins',
        brandUsed: 'MAC / Huda Beauty',
        targetGender: 'Female',
        description: 'Waterproof HD makeup, lashes, premium hairstyling and dupatta setting.',
        isAvailable: true
      },
      {
        id: 'item-groom-beard',
        name: 'Signature Beard Sculpt & Face Glow',
        price: 1200,
        duration: '40 mins',
        brandUsed: 'Beardo / Truefitt & Hill',
        targetGender: 'Male',
        description: 'Hot towel razor contouring, beard softening oil massage and quick facial.',
        isAvailable: true
      }
    ]
  },
  {
    id: 'cat-nails',
    name: 'Nails & Lashes',
    items: [
      {
        id: 'item-gel-nails',
        name: 'Gel Nail Art & Chrome Extensions',
        price: 1499,
        duration: '60 mins',
        brandUsed: 'Bluesky / OPI',
        targetGender: 'Female',
        description: 'Long-lasting high-gloss gel polish with custom accent nail art.',
        isAvailable: true
      },
      {
        id: 'item-lash-lift',
        name: 'Keratin Lash Lift & Tint',
        price: 1200,
        duration: '45 mins',
        brandUsed: 'LashPro',
        targetGender: 'Female',
        description: 'Semi-permanent curl and deep mascara tint lasting up to 6 weeks.',
        isAvailable: true
      },
      {
        id: 'item-mani-pedi',
        name: 'Classic Spa Manicure & Pedicure',
        price: 999,
        duration: '60 mins',
        brandUsed: 'Lotus Herbals',
        targetGender: 'Unisex',
        description: 'Dead sea salt scrub, cuticle care, heel smoothing and soothing massage.',
        isAvailable: true
      }
    ]
  }
];

const STANDARD_STATIONS = [
  'Reception Counter',
  'Styling Mirror 1',
  'Styling Mirror 2',
  'Hair Wash Station',
  'VIP Suite'
];

export default function StandeeActivationPage() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Verification & Kit State
  const [kitCodeInput, setKitCodeInput] = useState(urlCode ? urlCode.toUpperCase() : '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedKit, setVerifiedKit] = useState(null);
  const [alreadyActiveKit, setAlreadyActiveKit] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // Authentication State (for walk-in inline register / login)
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [authName, setAuthName] = useState(user?.name || '');
  const [authEmail, setAuthEmail] = useState(user?.email || '');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState(user?.whatsappNumber || '');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Station Placement State
  const [stationChip, setStationChip] = useState('Reception Counter');
  const [customStation, setCustomStation] = useState('');

  // Rate Card & Booster State
  const [rateCardMode, setRateCardMode] = useState('starter'); // 'starter' | 'photo'
  const [categories, setCategories] = useState(SALON_STARTER_CATEGORIES);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(user?.googleReviewUrl || '');
  const [shieldPhone, setShieldPhone] = useState(user?.whatsappNumber || '');
  const [resolutionOffer, setResolutionOffer] = useState('20% off next visit');
  const [showRateCardPreview, setShowRateCardPreview] = useState(false);

  // Photo Scan State
  const fileInputRef = useRef(null);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [scanStageText, setScanStageText] = useState('');
  const [scanError, setScanError] = useState(null);
  const [photoExtractedInfo, setPhotoExtractedInfo] = useState(null);

  // Activation Submission & Celebration State
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [activationSuccessData, setActivationSuccessData] = useState(null);

  // Synchronize auth changes with prefilled fields
  useEffect(() => {
    if (user) {
      if (!authName && user.name) setAuthName(user.name);
      if (!authEmail && user.email) setAuthEmail(user.email);
      if (!authPhone && user.whatsappNumber) {
        setAuthPhone(user.whatsappNumber);
        if (!shieldPhone) setShieldPhone(user.whatsappNumber);
      }
      if (!googleReviewUrl && user.googleReviewUrl) {
        setGoogleReviewUrl(user.googleReviewUrl);
      }
    }
  }, [user]);

  // Auto-verify if code parameter is present in URL
  useEffect(() => {
    if (urlCode && urlCode.trim()) {
      const clean = urlCode.trim().toUpperCase();
      setKitCodeInput(clean);
      handleVerifyCode(clean);
    }
  }, [urlCode]);

  // 1. Kit Verification Function
  const handleVerifyCode = async (codeToTest) => {
    const targetCode = (codeToTest || kitCodeInput).trim().toUpperCase();
    if (!targetCode) {
      setVerifyError('Please enter a 6-character kit code.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setAlreadyActiveKit(null);
    setVerifiedKit(null);

    try {
      const response = await api.get(`/standees/verify/${targetCode}`);
      const data = response.data;

      if (!data.valid) {
        setVerifyError(data.message || 'This standee kit code is invalid.');
        return;
      }

      if (data.status === 'activated' || data.isClaimed) {
        setAlreadyActiveKit(data);
      } else {
        setVerifiedKit(data);
        if (data.stationLabel) {
          if (STANDARD_STATIONS.includes(data.stationLabel)) {
            setStationChip(data.stationLabel);
          } else {
            setStationChip('Custom...');
            setCustomStation(data.stationLabel);
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Kit code not found. Please verify the code on your standee.';
      setVerifyError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Inline Authentication Handler (Register / Login in 10 seconds)
  const handleInlineAuth = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        if (!authName.trim()) throw new Error('Please enter your Salon or Studio name.');
        if (!authEmail.trim()) throw new Error('Please enter a valid email address.');
        if (!authPassword || authPassword.length < 6) throw new Error('Password must be at least 6 characters.');
        if (!authPhone.trim()) throw new Error('Please enter your salon WhatsApp phone number.');

        // Dispatch register thunk
        const registerResult = await dispatch(register({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword
        })).unwrap();

        // Save whatsapp number & businessCategory to profile
        try {
          await api.put('/users/profile', {
            whatsappNumber: authPhone.trim(),
            businessCategory: 'salon'
          });
        } catch (profileErr) {
          console.warn('Profile sync notice:', profileErr);
        }

        // Set phone for review booster shield
        if (!shieldPhone) setShieldPhone(authPhone.trim());
      } else {
        // Login mode
        if (!authEmail.trim() || !authPassword) {
          throw new Error('Please enter both email and password.');
        }

        await dispatch(login({
          email: authEmail.trim(),
          password: authPassword
        })).unwrap();
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : (err.message || 'Authentication failed. Please check your credentials.');
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Rate Card Paper Photo Upload & AI Scan
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanningPhoto(true);
    setScanError(null);
    setScanStageText('Compressing image for fast AI processing...');

    try {
      const compressed = await compressImageForUpload(file);
      setScanStageText('AI is reading salon services, treatments, prices & durations...');

      const result = await parseMenuPhotos({
        files: [compressed],
        mode: 'replace',
        autoFillPhotos: true,
        businessCategory: 'salon'
      });

      if (result && Array.isArray(result.categories) && result.categories.length > 0) {
        setCategories(result.categories);
        setPhotoExtractedInfo({
          categoryCount: result.categoryCount || result.categories.length,
          itemCount: result.itemCount || result.categories.reduce((acc, c) => acc + (c.items?.length || 0), 0),
          detectedName: result.restaurantName || ''
        });
        if (result.restaurantName && !authName) {
          setAuthName(result.restaurantName);
        }
        setRateCardMode('photo');
        setShowRateCardPreview(true);
      } else {
        throw new Error('Could not identify services from the uploaded image. Please try a clearer, well-lit photo.');
      }
    } catch (err) {
      console.error('Scan photo error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to parse rate card photo. Please try a clearer picture.';
      setScanError(msg);
    } finally {
      setIsScanningPhoto(false);
      setScanStageText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. Activate & Push to Standee
  const handleActivateStandee = async () => {
    const codeToActivate = (verifiedKit?.kitCode || kitCodeInput).trim().toUpperCase();
    if (!codeToActivate) {
      setActivationError('Valid kit code is required.');
      return;
    }

    if (!isAuthenticated) {
      setActivationError('Please complete your 10-second registration or sign in first.');
      return;
    }

    const finalStationLabel = stationChip === 'Custom...'
      ? (customStation.trim() || 'Custom Station')
      : stationChip;

    const salonTitle = authName.trim() || user?.name || 'Aura Luxury Salon';

    setIsActivating(true);
    setActivationError(null);

    try {
      const payload = {
        kitCode: codeToActivate,
        stationLabel: finalStationLabel,
        salonName: salonTitle,
        rateCard: {
          categories: categories
        },
        googleReviewUrl: googleReviewUrl.trim(),
        shieldPhone: (shieldPhone || authPhone || user?.whatsappNumber || '').trim(),
        resolutionOffer: resolutionOffer.trim() || '20% off next visit'
      };

      const response = await api.post('/standees/activate', payload);
      setActivationSuccessData(response.data);
    } catch (err) {
      console.error('Activation failure:', err);
      const msg = err.response?.data?.message || 'Failed to activate standee kit. Please try again.';
      setActivationError(msg);
    } finally {
      setIsActivating(false);
    }
  };

  // Get active station name
  const currentStationName = stationChip === 'Custom...' ? (customStation || 'Custom Station') : stationChip;

  // Render Already Active Card
  if (alreadyActiveKit) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] text-[#2B1E19] px-4 py-12 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-lg bg-white border border-[#2B1E19]/10 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <span className="inline-block px-3 py-1 bg-[#2B1E19]/5 text-[#2B1E19] text-xs font-mono font-medium rounded-full mb-3 tracking-wider">
            KIT CODE: {alreadyActiveKit.kitCode}
          </span>

          <h1 className="font-serif text-3xl font-normal text-[#2B1E19] mb-2">
            This Standee is Already Active!
          </h1>
          <p className="text-sm text-[#2B1E19]/70 mb-6">
            Assigned to station: <strong className="text-[#2B1E19]">{alreadyActiveKit.stationLabel || 'Reception Counter'}</strong>.
            Visitors scanning this acrylic standee see the live salon lookbook and review booster.
          </p>

          <div className="space-y-3">
            <a
              href={`/menu/${alreadyActiveKit.shortId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2B1E19] text-white text-sm font-medium hover:bg-[#2B1E19]/90 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-[#E5A93C]" />
              View Live Salon Lookbook
            </a>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F2EFE9] text-[#2B1E19] text-sm font-medium hover:bg-[#EAE6DE] transition-colors"
            >
              <Store className="w-4 h-4 text-[#2B1E19]" />
              Open Salon Dashboard
            </button>

            <button
              onClick={() => {
                setAlreadyActiveKit(null);
                setVerifiedKit(null);
                setKitCodeInput('');
              }}
              className="text-xs text-[#2B1E19]/60 hover:text-[#2B1E19] underline pt-2"
            >
              Verify or activate another standee code
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Celebration / Success Screen
  if (activationSuccessData) {
    const liveShortId = activationSuccessData.standee?.short_id || activationSuccessData.qr?.short_id;
    const finalMenuUrl = activationSuccessData.menuUrl || `${window.location.origin}/menu/${liveShortId}`;
    const finalScanUrl = activationSuccessData.liveUrl || `${window.location.origin}/r/${liveShortId}`;
    const printCode = activationSuccessData.standee?.kit_code || kitCodeInput || "BOX-01";
    const printStation = activationSuccessData.standee?.station_label || currentStationName || "Reception Counter";
    const storeName = authName || user?.name || "Aura Salon";

    const handlePrintStandee = () => {
      const w = window.open("", "_blank");
      if (!w) {
        alert("Please allow pop-ups to print your 4×6 standee card");
        return;
      }
      w.document.write(`<!doctype html><html><head><title>4x6 Standee • ${storeName} • ${printCode}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@500;600&family=IBM+Plex+Mono:wght@500&display=swap">
        <style>
          @page { size: 4in 6in; margin: 0; }
          body { margin: 0; display: grid; place-items: center; min-height: 100vh; background: #EAE4DC; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .card { width: 4in; height: 6in; background: #2B1E19; color: #FBF9F6; padding: 0.34in; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #E5A93C; border-radius: 8px; }
        </style></head><body>
        <div class="card">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font:700 11px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#E5A93C">${storeName}</div>
              <div style="font:500 9px 'IBM Plex Mono',monospace;letter-spacing:.08em;color:#CDBFB2;background:rgba(229,169,60,0.15);padding:3px 8px;border-radius:4px;border:1px solid rgba(229,169,60,0.3)">${printCode} • ${printStation}</div>
            </div>
            <div style="font:400 24px/1.15 'Instrument Serif',Georgia,serif;margin-top:8px;color:#FBF9F6">Scan for Today's In-Chair Offers &amp; Unlock ₹200 Off Your Next Visit</div>
          </div>
          <div style="background:#FBF9F6;padding:14px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;justify-content:center;">
            <div id="qr-target"></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="color:#E5A93C;letter-spacing:3px;font-size:14px">★★★★★</span>
              <span style="font:600 11px 'Instrument Sans',sans-serif;color:#E5A93C;background:rgba(229,169,60,0.15);padding:2px 8px;border-radius:4px">Claim ₹200 Privilege Pass on WhatsApp</span>
            </div>
            <div style="font:500 10px 'IBM Plex Mono',monospace;letter-spacing:.06em;color:#CDBFB2;display:flex;justify-content:space-between;border-top:1px solid rgba(229,169,60,0.2);padding-top:6px">
              <span>📷 Open Phone Camera to Scan (Not GPay)</span>
              <span>qrvibe.in/r/${liveShortId}</span>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"><\/script>
        <script>
          const qr = new QRCodeStyling({
            width: 250,
            height: 250,
            type: "svg",
            data: "${finalScanUrl}",
            dotsOptions: { color: "#2B1E19", type: "rounded" },
            cornersSquareOptions: { color: "#2B1E19", type: "extra-rounded" },
            cornersDotOptions: { color: "#E5A93C" }
          });
          qr.append(document.getElementById("qr-target"));
          onload=()=>setTimeout(()=>window.print(),500);
        <\/script></body></html>`);
      w.document.close();
    };

    return (
      <div className="min-h-screen bg-[#FBF9F6] text-[#2B1E19] px-4 py-8 md:py-12 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-xl bg-white border border-[#2B1E19]/10 rounded-3xl p-6 sm:p-10 shadow-lg text-center relative overflow-hidden">
          {/* Subtle warm glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#E5A93C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Celebration Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#2B1E19] text-xs font-mono font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
            KIT {activationSuccessData.standee?.kit_code || kitCodeInput} • ACTIVATED
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1E19] font-normal tracking-tight mb-2">
            🎉 Standee is Live!
          </h1>
          <p className="text-sm sm:text-base text-[#2B1E19]/75 max-w-md mx-auto mb-8">
            Your physical acrylic standee is now activated for <strong className="text-[#2B1E19]">{activationSuccessData.standee?.station_label || currentStationName}</strong>. Visitors scanning this physical code will instantly see your digital lookbook and review booster.
          </p>

          {/* High-Resolution Live Scannable Standee Preview */}
          <div className="bg-[#FBF9F6] border-2 border-[#2B1E19]/10 rounded-2xl p-6 max-w-xs mx-auto mb-8 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <Scissors className="w-4 h-4 text-[#E5A93C]" />
              <span className="font-serif italic text-base text-[#2B1E19]">
                {authName || user?.name || 'Salon & Studio'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-[#2B1E19]/10 mb-3">
              <StyledQRCode
                data={finalScanUrl}
                size={180}
                primaryColor="#2B1E19"
                bgColor="#ffffff"
                dotStyle="rounded"
                cornerSquareStyle="extra-rounded"
                cornerDotStyle="dot"
              />
            </div>

            {/* In-Store Anti-UPI Muscle-Memory micro-copy */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#2B1E19]/80 font-medium bg-[#2B1E19]/5 px-2.5 py-1 rounded-md mb-2">
              <Camera className="w-3.5 h-3.5 text-[#E5A93C]" />
              Open Camera to Scan (Not GPay)
            </div>

            <div className="text-[10px] text-[#2B1E19]/60 font-mono">
              STATION: {activationSuccessData.standee?.station_label || currentStationName}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 max-w-sm mx-auto">
            <button
              onClick={handlePrintStandee}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E5A93C] text-[#2B1E19] text-sm font-semibold hover:bg-[#d89e34] transition-all shadow-md group cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#2B1E19] group-hover:scale-110 transition-transform" />
              🖨️ Print 4×6 Standee Card
            </button>

            <a
              href={finalMenuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2B1E19] text-white text-sm font-medium hover:bg-[#2B1E19]/90 transition-all shadow-md group"
            >
              <ExternalLink className="w-4 h-4 text-[#E5A93C] group-hover:scale-110 transition-transform" />
              📱 Test Live Salon Lookbook
            </a>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F2EFE9] text-[#2B1E19] text-sm font-medium hover:bg-[#EAE6DE] transition-colors"
            >
              <Store className="w-4 h-4 text-[#2B1E19]" />
              📊 Open Salon Dashboard
            </button>

            <button
              onClick={() => {
                setActivationSuccessData(null);
                setVerifiedKit(null);
                setKitCodeInput('');
              }}
              className="text-xs text-[#2B1E19]/60 hover:text-[#2B1E19] underline pt-2 block mx-auto"
            >
              Activate another acrylic standee in this salon
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Walk-In Standee Activation View
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2B1E19] font-sans">
      {/* Top Editorial Nav Header */}
      <header className="border-b border-[#2B1E19]/10 bg-white/70 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif italic text-2xl font-normal tracking-tight text-[#2B1E19]">
              QRVibe
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#2B1E19] font-semibold border border-[#E5A93C]/40">
              Standee Kit
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 text-xs font-medium text-[#2B1E19]/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline">Signed in:</span>
              <span className="font-semibold text-[#2B1E19] truncate max-w-[140px]">{user?.name}</span>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-medium text-[#2B1E19]/80 hover:text-[#2B1E19] px-3 py-1.5 rounded-lg border border-[#2B1E19]/15 hover:bg-[#2B1E19]/5 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#2B1E19] text-xs font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
            Walk-In Kit Setup • 60 Seconds
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2B1E19] tracking-tight mb-3">
            Activate Your Physical Standee
          </h1>
          <p className="text-sm sm:text-base text-[#2B1E19]/75 max-w-lg mx-auto">
            Link your pre-printed acrylic standee to your live salon lookbook and Google review booster with zero reprinting.
          </p>
        </div>

        {/* STEP 1: KIT CODE VERIFICATION */}
        <section className="bg-white border border-[#2B1E19]/10 rounded-2xl p-5 sm:p-7 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2B1E19] text-white text-xs font-mono flex items-center justify-center font-bold">
                1
              </span>
              <h2 className="font-serif text-xl text-[#2B1E19]">
                Kit Code Verification
              </h2>
            </div>
            {verifiedKit && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#2B1E19]/70 mb-4">
            Enter the 6-character alphanumeric code printed at the base of your acrylic standee.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={8}
                value={kitCodeInput}
                onChange={(e) => {
                  setKitCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  setVerifyError(null);
                  setVerifiedKit(null);
                }}
                placeholder="e.g. A7K92P or BOX-01"
                className="w-full px-4 py-3 rounded-xl border border-[#2B1E19]/20 bg-[#FBF9F6] font-mono text-lg font-bold tracking-widest text-[#2B1E19] uppercase placeholder:text-gray-400 placeholder:normal-case placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#E5A93C] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => handleVerifyCode(kitCodeInput)}
              disabled={isVerifying || !kitCodeInput.trim()}
              className="px-6 py-3 rounded-xl bg-[#2B1E19] text-white font-medium text-sm hover:bg-[#2B1E19]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E5A93C]" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 text-[#E5A93C]" />
                  <span>Verify Standee</span>
                </>
              )}
            </button>
          </div>

          {verifyError && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{verifyError}</span>
            </div>
          )}

          {verifiedKit && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-emerald-900">
                  ✨ Standee Verified • Ready to Activate (<strong className="font-mono">{verifiedKit.kitCode}</strong>)
                </span>
              </div>
              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-700">
                STATUS: UNCLAIMED
              </span>
            </div>
          )}
        </section>

        {/* STEP 2: SEAMLESS 10-SECOND AUTHENTICATION */}
        <section className="bg-white border border-[#2B1E19]/10 rounded-2xl p-5 sm:p-7 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2B1E19] text-white text-xs font-mono flex items-center justify-center font-bold">
                2
              </span>
              <h2 className="font-serif text-xl text-[#2B1E19]">
                Salon Account
              </h2>
            </div>
            {isAuthenticated && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Signed In
              </span>
            )}
          </div>

          {isAuthenticated ? (
            <div className="p-4 rounded-xl bg-[#FBF9F6] border border-[#2B1E19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#2B1E19] font-serif text-lg font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#2B1E19] flex items-center gap-1.5">
                    {user?.name}
                    <span className="text-[10px] font-mono bg-[#2B1E19]/5 px-2 py-0.5 rounded text-[#2B1E19]/70">
                      Salon Account
                    </span>
                  </div>
                  <div className="text-xs text-[#2B1E19]/60">{user?.email}</div>
                </div>
              </div>
              <div className="text-xs text-[#2B1E19]/60 font-mono">
                {user?.whatsappNumber ? `WA: ${user.whatsappNumber}` : 'Ready to link'}
              </div>
            </div>
          ) : (
            <div className="border border-[#2B1E19]/15 rounded-xl p-4 sm:p-5 bg-[#FBF9F6]/50">
              <div className="flex gap-2 p-1 bg-[#F2EFE9] rounded-lg mb-4 max-w-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-[#2B1E19] shadow-sm font-semibold'
                      : 'text-[#2B1E19]/60 hover:text-[#2B1E19]'
                  }`}
                >
                  ⚡ 10-Sec Register
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-[#2B1E19] shadow-sm font-semibold'
                      : 'text-[#2B1E19]/60 hover:text-[#2B1E19]'
                  }`}
                >
                  Sign In
                </button>
              </div>

              <form onSubmit={handleInlineAuth} className="space-y-3.5">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-[#2B1E19] mb-1">
                      Salon / Studio Name *
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Aura Luxury Hair & Spa"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#2B1E19] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="salon@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B1E19] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                      />
                    </div>
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-[#2B1E19] mb-1">
                      Salon WhatsApp Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-mono font-medium text-gray-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210 (For bookings & review shield)"
                        className="w-full pl-11 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                      />
                    </div>
                    <p className="text-[11px] text-[#2B1E19]/60 mt-1">
                      Guests can tap to WhatsApp your reception directly for bookings.
                    </p>
                  </div>
                )}

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-[#2B1E19] text-white text-sm font-medium hover:bg-[#2B1E19]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E5A93C]" />
                      <span>{authMode === 'register' ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'register' ? '⚡ Create Account & Continue' : 'Sign In & Continue'}</span>
                      <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* STEP 3: STATION PLACEMENT */}
        <section className="bg-white border border-[#2B1E19]/10 rounded-2xl p-5 sm:p-7 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-[#2B1E19] text-white text-xs font-mono flex items-center justify-center font-bold">
              3
            </span>
            <h2 className="font-serif text-xl text-[#2B1E19]">
              Station Placement
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#2B1E19]/70 mb-3">
            Where will this physical acrylic standee sit inside your salon?
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {STANDARD_STATIONS.map((station) => {
              const isSelected = stationChip === station;
              return (
                <button
                  key={station}
                  type="button"
                  onClick={() => setStationChip(station)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#2B1E19] text-white shadow-sm ring-2 ring-[#2B1E19]/20'
                      : 'bg-[#F2EFE9] text-[#2B1E19]/80 hover:bg-[#EAE6DE]'
                  }`}
                >
                  {station}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setStationChip('Custom...')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                stationChip === 'Custom...'
                  ? 'bg-[#2B1E19] text-white shadow-sm ring-2 ring-[#2B1E19]/20'
                  : 'bg-[#F2EFE9] text-[#2B1E19]/80 hover:bg-[#EAE6DE]'
              }`}
            >
              + Custom Name
            </button>
          </div>

          {stationChip === 'Custom...' && (
            <div className="mt-3">
              <input
                type="text"
                value={customStation}
                onChange={(e) => setCustomStation(e.target.value)}
                placeholder="e.g. Pedicure Station 3, Nail Bar 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2B1E19]/20 bg-[#FBF9F6] text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
              />
            </div>
          )}

          <div className="mt-3 text-[11px] font-mono text-[#2B1E19]/60 uppercase tracking-wider">
            PREVIEW BADGE: <span className="font-semibold text-[#2B1E19]">{currentStationName}</span>
          </div>
        </section>

        {/* STEP 4: RATE CARD & REVIEW BOOSTER */}
        <section className="bg-white border border-[#2B1E19]/10 rounded-2xl p-5 sm:p-7 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-[#2B1E19] text-white text-xs font-mono flex items-center justify-center font-bold">
              4
            </span>
            <h2 className="font-serif text-xl text-[#2B1E19]">
              Rate Card & Review Booster
            </h2>
          </div>

          {/* Rate Card Mode Toggle */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#2B1E19] uppercase tracking-wider font-mono mb-2">
              Lookbook / Rate Card Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRateCardMode('starter')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  rateCardMode === 'starter'
                    ? 'border-[#2B1E19] bg-[#FBF9F6] ring-1 ring-[#2B1E19]'
                    : 'border-[#2B1E19]/15 bg-white hover:bg-[#FBF9F6]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-4 h-4 text-[#E5A93C]" />
                  <span className="text-xs font-bold text-[#2B1E19]">⚡ Salon Starter Lookbook</span>
                </div>
                <p className="text-[11px] text-[#2B1E19]/70 leading-relaxed">
                  Pre-configured with 13 top salon services (Keratin, HydraFacial, Bridal, Nails). Ready in 0 seconds.
                </p>
                {rateCardMode === 'starter' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#E5A93C]"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRateCardMode('photo');
                  fileInputRef.current?.click();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  rateCardMode === 'photo'
                    ? 'border-[#2B1E19] bg-[#FBF9F6] ring-1 ring-[#2B1E19]'
                    : 'border-[#2B1E19]/15 bg-white hover:bg-[#FBF9F6]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Camera className="w-4 h-4 text-[#E5A93C]" />
                  <span className="text-xs font-bold text-[#2B1E19]">📸 Snap Photo of Rate Card</span>
                </div>
                <p className="text-[11px] text-[#2B1E19]/70 leading-relaxed">
                  Take a photo of your paper menu or flyer. Gemini AI extracts treatments & prices automatically.
                </p>
                {rateCardMode === 'photo' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#E5A93C]"></span>
                )}
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Photo Scan Progress / Laser State */}
          {isScanningPhoto && (
            <div className="p-4 rounded-xl bg-[#FBF9F6] border border-[#2B1E19]/10 mb-5 text-center">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#2B1E19]/10 mb-3">
                <div className="h-full bg-[#E5A93C] animate-pulse w-full"></div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#2B1E19]">
                <Loader2 className="w-4 h-4 animate-spin text-[#E5A93C]" />
                <span>{scanStageText}</span>
              </div>
            </div>
          )}

          {scanError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-5 flex items-center justify-between">
              <span>{scanError}</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium underline hover:text-red-900"
              >
                Retry photo
              </button>
            </div>
          )}

          {/* Rate Card Preview Badge / Accordion */}
          <div className="border border-[#2B1E19]/15 rounded-xl p-3.5 bg-[#FBF9F6] mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#E5A93C]" />
                <span className="text-xs font-semibold text-[#2B1E19]">
                  {rateCardMode === 'starter'
                    ? 'Salon Starter Lookbook Active (4 Categories • 13 Services)'
                    : `Extracted Lookbook (${photoExtractedInfo?.categoryCount || categories.length} Categories • ${photoExtractedInfo?.itemCount || 0} Services)`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRateCardPreview(!showRateCardPreview)}
                className="text-xs text-[#2B1E19]/70 hover:text-[#2B1E19] flex items-center gap-1 font-medium"
              >
                {showRateCardPreview ? 'Hide Preview' : 'Show Services'}
                {showRateCardPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showRateCardPreview && (
              <div className="mt-3 pt-3 border-t border-[#2B1E19]/10 space-y-3">
                {categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="text-xs">
                    <span className="font-semibold text-[#2B1E19] font-mono text-[11px] uppercase tracking-wider block mb-1">
                      {cat.name} ({cat.items?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items?.map((it, itemIdx) => (
                        <span
                          key={it.id || itemIdx}
                          className="px-2 py-0.5 rounded bg-white border border-[#2B1E19]/10 text-[11px] text-[#2B1E19]/80"
                        >
                          {it.name} • ₹{it.price}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Review Booster Configuration */}
          <div className="space-y-4 pt-2 border-t border-[#2B1E19]/10">
            <div>
              <label className="block text-xs font-semibold text-[#2B1E19] mb-1">
                Google Review Link / Place ID
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/... or Place ID"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                />
              </div>
              <p className="text-[11px] text-[#2B1E19]/60 mt-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-[#E5A93C] fill-[#E5A93C]" />
                5-star ratings will copy customer drafts and open Google Maps for immediate SEO boost.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2B1E19] mb-1">
                  WhatsApp Complaint Shield Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={shieldPhone}
                    onChange={(e) => setShieldPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210 (Defaults to salon phone)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                  />
                </div>
                <p className="text-[11px] text-[#2B1E19]/60 mt-1">
                  Low ratings (1-3★) route privately to this number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1E19] mb-1">
                  Private Resolution Offer
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={resolutionOffer}
                    onChange={(e) => setResolutionOffer(e.target.value)}
                    placeholder="e.g. 20% off next visit"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#2B1E19]/20 bg-white text-sm text-[#2B1E19] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]"
                  />
                </div>
                <p className="text-[11px] text-[#2B1E19]/60 mt-1">
                  Offer presented to resolve dissatisfaction quietly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 5: ACTIVATION CTA */}
        <div className="space-y-4">
          {activationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{activationError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleActivateStandee}
            disabled={isActivating || !verifiedKit}
            className="w-full py-4 rounded-2xl bg-[#2B1E19] text-white text-base font-semibold hover:bg-[#2B1E19]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {isActivating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#E5A93C]" />
                <span>Activating Physical Standee...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-[#E5A93C]" />
                <span>⚡ Activate & Push to Standee</span>
              </>
            )}
          </button>

          {!verifiedKit && (
            <p className="text-center text-xs text-[#2B1E19]/60 font-mono">
              ⚠️ Please verify a valid kit code in Step 1 before activating.
            </p>
          )}

          <div className="flex items-center justify-center gap-4 text-xs text-[#2B1E19]/60 pt-2 font-mono">
            <span>• Sub-50ms Hot-Path QR</span>
            <span>• Zero Hardware Reprint</span>
            <span>• Instant Lookbook</span>
          </div>
        </div>
      </main>
    </div>
  );
}
