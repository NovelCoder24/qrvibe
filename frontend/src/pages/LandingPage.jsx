import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const whatsappOrderUrl = "https://wa.me/?text=" + encodeURIComponent("Hi, I want a QRVibe standee for my storefront");
    const whatsappTalkUrl = "https://wa.me/?text=" + encodeURIComponent("Hi, I have a question about QRVibe");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <div className="lp min-h-screen">
            {/* Navigation */}
            <header className="nav relative z-50">
                <Link className="brand" to="/" onClick={() => setMobileMenuOpen(false)}>
                    <svg width="24" height="24" viewBox="0 0 22 22" aria-hidden="true">
                        <rect x="1" y="1" width="8" height="8" rx="2" fill="#E5A93C" />
                        <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="13" y="13" width="4" height="4" fill="#E5A93C" />
                    </svg>
                    <span>QRVibe</span>
                </Link>

                <div className="links flex items-center gap-2 sm:gap-6">
                    <a className="l" href="#how-it-works">How it works</a>
                    <a className="l" href="#who">Who it is for</a>
                    <a className="l" href="#pricing">Pricing</a>

                    {isAuthenticated ? (
                        <Link to="/dashboard" className="inline-flex items-center justify-center font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full border border-[#2B1E19]/30 hover:border-[#2B1E19] text-[#2B1E19] transition-all">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="inline-flex items-center justify-center font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full border border-[#2B1E19]/30 hover:border-[#2B1E19] text-[#2B1E19] transition-all">
                            Log In
                        </Link>
                    )}

                    <a
                        className="btn hn hidden sm:inline-flex text-xs sm:text-sm"
                        href={whatsappOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ minHeight: '40px', padding: '0 16px' }}
                    >
                        Get your standee
                    </a>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="sm:hidden p-2 -mr-1 rounded-lg text-[#2B1E19] hover:bg-[#2B1E19]/5 transition-colors focus:outline-none"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer Overlay */}
            {mobileMenuOpen && (
                <div
                    className="sm:hidden fixed inset-0 z-40 bg-[#2B1E19]/60 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 right-0 w-full max-w-[320px] bg-[#FBF9F6] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-[#E3DAD0]">
                                <div className="flex items-center gap-2 font-serif text-xl font-medium text-[#2B1E19]">
                                    <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
                                        <rect x="1" y="1" width="8" height="8" rx="2" fill="#E5A93C" />
                                        <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
                                        <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
                                        <rect x="13" y="13" width="4" height="4" fill="#E5A93C" />
                                    </svg>
                                    <span>QRVibe</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1 rounded-full text-[#6B5A50] hover:text-[#2B1E19] hover:bg-[#2B1E19]/5"
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex flex-col space-y-4">
                                <a
                                    href="#how-it-works"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base font-medium text-[#2B1E19] hover:text-[#E5A93C] transition-colors py-1 flex items-center justify-between"
                                >
                                    <span>How it works</span>
                                    <ArrowRight size={16} className="text-[#A39284]" />
                                </a>
                                <a
                                    href="#who"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base font-medium text-[#2B1E19] hover:text-[#E5A93C] transition-colors py-1 flex items-center justify-between"
                                >
                                    <span>Who it is for</span>
                                    <ArrowRight size={16} className="text-[#A39284]" />
                                </a>
                                <a
                                    href="#pricing"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base font-medium text-[#2B1E19] hover:text-[#E5A93C] transition-colors py-1 flex items-center justify-between"
                                >
                                    <span>Pricing</span>
                                    <ArrowRight size={16} className="text-[#A39284]" />
                                </a>
                            </nav>

                            <div className="pt-4 border-t border-[#E3DAD0] space-y-3">
                                {isAuthenticated ? (
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full inline-flex items-center justify-center font-medium text-sm px-4 py-2.5 rounded-xl border border-[#2B1E19] text-[#2B1E19] bg-[#2B1E19]/5 hover:bg-[#2B1E19]/10 transition-all text-center"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full inline-flex items-center justify-center font-medium text-sm px-4 py-2.5 rounded-xl border border-[#2B1E19] text-[#2B1E19] hover:bg-[#2B1E19]/5 transition-all text-center"
                                        >
                                            Log In to Storefront
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full inline-flex items-center justify-center font-medium text-sm px-4 py-2.5 rounded-xl border border-[#6B5A50] text-[#6B5A50] hover:border-[#2B1E19] hover:text-[#2B1E19] transition-all text-center"
                                        >
                                            Start 7-Day Free Trial
                                        </Link>
                                    </>
                                )}

                                <a
                                    href={whatsappOrderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="btn hn w-full inline-flex items-center justify-center text-sm font-medium py-2.5 rounded-xl shadow-sm text-center"
                                    style={{ minHeight: '44px' }}
                                >
                                    Get your standee
                                </a>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#E3DAD0] text-xs text-[#6B5A50] space-y-2">
                            <div className="flex items-center gap-1.5 text-[#2B1E19] font-medium">
                                <ShieldCheck size={14} className="text-[#10B981]" />
                                <span>Anti-Hostageware Guarantee</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                                Your printed QR codes never break. Designed around India's DPDP Act.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="hero w">
                <div>
                    <div className="lbl">For salons, cafes &amp; clinics</div>
                    <h1 style={{ marginTop: '20px' }}>
                        The smart front desk &amp; <em>Google review engine</em> for Indian storefronts.
                    </h1>
                    <p>
                        An acrylic standee for your counter, plus a tag for your mirror. Your visual menu, services, and 5-star Google review booster in one place. Guests post a review in one tap, or tell you privately if something went wrong.
                    </p>
                    <div className="ctas">
                        <a
                            className="btn hn"
                            href={whatsappOrderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Get your standee
                        </a>
                        <a className="btn" href="#how-it-works">
                            See how it works
                        </a>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn" style={{ borderColor: '#6B5A50', color: '#6B5A50' }}>
                                Start free trial
                            </Link>
                        )}
                    </div>
                </div>

                <div className="stage dk">
                    {/* Counter Standee Card */}
                    <div className="stand">
                        <div className="lbl">Scan to</div>
                        <div className="sh">Book, browse &amp; rate</div>
                        <svg
                            viewBox="0 0 17 17"
                            width="100%"
                            style={{ display: 'block', maxWidth: '150px', margin: '14px 0' }}
                            fill="#2B1E19"
                            role="img"
                            aria-label="Sample QR code"
                        >
                            <path d="M6 0h2v1h-2zM9 0h1v1h-1zM6 1h2v1h-2zM9 1h2v1h-2zM6 2h3v1h-3zM10 2h1v1h-1zM6 3h1v1h-1zM10 3h1v1h-1zM7 4h1v1h-1zM9 4h2v1h-2zM6 5h2v1h-2zM9 5h1v1h-1zM1 6h1v1h-1zM3 6h3v1h-3zM7 6h2v1h-2zM10 6h2v1h-2zM14 6h1v1h-1zM2 7h1v1h-1zM4 7h2v1h-2zM7 7h3v1h-3zM14 7h1v1h-1zM1 8h1v1h-1zM4 8h1v1h-1zM6 8h1v1h-1zM11 8h2v1h-2zM14 8h3v1h-3zM0 9h2v1h-2zM3 9h3v1h-3zM7 9h2v1h-2zM13 9h3v1h-3zM1 10h5v1h-5zM7 10h4v1h-4zM6 11h1v1h-1zM11 11h3v1h-3zM15 11h2v1h-2zM6 12h9v1h-9zM6 13h5v1h-5zM13 13h4v1h-4zM6 14h2v1h-2zM9 14h2v1h-2zM13 14h1v1h-1zM15 14h1v1h-1zM9 15h3v1h-3zM15 15h2v1h-2zM12 16h1v1h-1zM14 16h3v1h-3z" />
                            <rect x="0" y="0" width="5" height="5" />
                            <rect x="1" y="1" width="3" height="3" fill="#FBF9F6" />
                            <rect x="2" y="2" width="1" height="1" />
                            <rect x="12" y="0" width="5" height="5" />
                            <rect x="13" y="1" width="3" height="3" fill="#FBF9F6" />
                            <rect x="14" y="2" width="1" height="1" />
                            <rect x="0" y="12" width="5" height="5" />
                            <rect x="1" y="13" width="3" height="3" fill="#FBF9F6" />
                            <rect x="2" y="14" width="1" height="1" />
                        </svg>
                        <div className="lbl font-medium">Phone camera, not GPay</div>
                    </div>

                    {/* Customer Mobile Review Phone Mockup */}
                    <div className="phone">
                        <div className="lbl">Aura Hair &amp; Spa</div>
                        <div className="ph-h">How was your visit?</div>
                        <div className="pst" aria-label="5 stars">★★★★★</div>
                        <div>
                            <span className="chip">Stylist · Riya</span>
                            <span className="chip">Colour &amp; gloss</span>
                        </div>
                        <div className="pbtn cursor-default">Post to Google · 1 tap</div>
                        <div className="pn">Rather tell us privately? Message on WhatsApp</div>
                    </div>
                </div>
            </section>

            {/* Section: What It Does */}
            <section className="sec w" style={{ paddingTop: '40px' }}>
                <div className="lbl">What it does</div>
                <h2 style={{ margin: '14px 0 40px', maxWidth: '760px' }}>
                    One standee, three jobs your counter never did.
                </h2>

                <div className="r3">
                    <span className="n">01</span>
                    <div>
                        <h3>Upsell while they wait</h3>
                        <p>Guests in the chair or on the sofa browse your high-ticket services and book the next one from their own phone.</p>
                    </div>
                    <div>
                        <span className="pill">Colour</span>
                        <span className="pill">Keratin</span>
                        <span className="pill">Facial</span>
                        <span className="pill">Bridal</span>
                    </div>
                </div>

                <div className="r3">
                    <span className="n">02</span>
                    <div>
                        <h3>Reviews in one tap</h3>
                        <p>Guests tap the stylist or dish they loved. AI turns their picks into a draft they can edit, then they post to Google Maps in one tap. Specific reviews read as real and help the next customer choose.</p>
                    </div>
                    <div>
                        <div className="pst" style={{ maxWidth: '300px' }}>★★★★★</div>
                    </div>
                </div>

                <div className="r3" style={{ borderBottom: '1px solid #E3DAD0' }}>
                    <span className="n">03</span>
                    <div>
                        <h3>Hear it first</h3>
                        <p>An unhappy guest can message you on WhatsApp in seconds, so you can fix it while they are still at the counter. They can always post on Google too.</p>
                    </div>
                    <div>
                        <div className="bub b1">My colour came out uneven. Can someone look at it?</div>
                        <div className="bub b2">Coming over now. Sorry about that.</div>
                    </div>
                </div>
            </section>

            {/* Dark Band: How It Works */}
            <section className="dk band" id="how-it-works">
                <div className="w">
                    <div className="lbl">How it works</div>
                    <h2 style={{ margin: '14px 0 48px', maxWidth: '700px' }}>
                        Set it up once. It works every shift.
                    </h2>
                    <div className="steps">
                        <div>
                            <span className="sn">1</span>
                            <h3>Snap your rate card</h3>
                            <p>Send a photo of your paper menu or price list. Your page is live in minutes, and we ship your custom countertop standee.</p>
                        </div>
                        <div>
                            <span className="sn">2</span>
                            <h3>Guests scan</h3>
                            <p>With the phone camera, not GPay. No app and no sign-up; the page opens in a second.</p>
                        </div>
                        <div>
                            <span className="sn">3</span>
                            <h3>You see it all</h3>
                            <p>Reviews, private feedback and bookings in one simple dashboard.</p>
                        </div>
                    </div>
                    <div className="rt">
                        Change what the QR opens any time, from your phone. No reprinting.
                    </div>
                </div>
            </section>

            {/* Section: Who It Is For */}
            <section className="sec w" id="who">
                <div className="lbl">Who it is for</div>
                <h2 style={{ margin: '14px 0 0', maxWidth: '760px' }}>
                    Made for how Indian storefronts actually run.
                </h2>
                <div className="cols">
                    <div className="ind">
                        <div className="lbl">Salons &amp; Spas</div>
                        <h3>Fill empty chairs.</h3>
                        <p>Services and prices, slot booking, stylist-specific reviews.</p>
                        <p>Rebook your regulars.</p>
                    </div>
                    <div className="ind">
                        <div className="lbl">Cafes &amp; QSRs</div>
                        <h3>Make the menu sell.</h3>
                        <p>Visual photo menu, chef specials, dish-specific reviews.</p>
                        <p>Put your bestsellers first.</p>
                    </div>
                    <div className="ind">
                        <div className="lbl">Clinics</div>
                        <h3>Earn trust early.</h3>
                        <p>Treatment lookbook, doctor timings, private feedback.</p>
                        <p>Fewer questions at the desk.</p>
                    </div>
                </div>
            </section>

            {/* Section: Pricing */}
            <section className="sec w" id="pricing" style={{ paddingTop: '0' }}>
                <div className="split">
                    <div>
                        <div className="lbl">Pricing</div>
                        <h2 style={{ marginTop: '14px' }}>Simple pricing, shown upfront.</h2>
                        <p style={{ marginTop: '16px', maxWidth: '380px' }}>
                            Message us on WhatsApp and we will set up your digital storefront and standee.
                        </p>
                        <div style={{ marginTop: '28px' }}>
                            <a
                                className="btn hn"
                                href={whatsappOrderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Inquire on WhatsApp
                            </a>
                        </div>
                    </div>
                    <ul>
                        <li>
                            <div>
                                <b>Starter</b>
                                <span className="s">Your page, reviews and private feedback inbox</span>
                            </div>
                            <span className="pr">₹ — <small>/ month</small></span>
                        </li>
                        <li>
                            <div>
                                <b>Standee bundle</b>
                                <span className="s">Custom acrylic standee and mirror tag, shipped</span>
                            </div>
                            <span className="pr">₹ —</span>
                        </li>
                        <li>
                            <div>
                                <b>Annual</b>
                                <span className="s">Everything above, billed once a year</span>
                            </div>
                            <span className="pr">₹ — <small>/ year</small></span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Final CTA Band */}
            <section className="dk cta">
                <div className="w">
                    <h2>Give your counter a better front desk.</h2>
                    <div className="ctas">
                        <a
                            className="btn hn"
                            href={whatsappOrderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Get your standee
                        </a>
                        <a
                            className="btn"
                            href={whatsappTalkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Talk to us on WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="dk ft">
                <span>© QRVibe. Made in India.</span>
                <span>
                    <Link to="/privacy-data" className="hover:underline text-inherit">Privacy</Link> · <Link to="/privacy-data" className="hover:underline text-inherit">Terms</Link> · <a href={whatsappTalkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-inherit">Contact</a>
                </span>
                <span style={{ width: '100%', fontSize: '12px' }}>
                    Guest data is collected with consent, designed around the principles of India’s DPDP Act.
                </span>
            </footer>
        </div>
    );
};

export default LandingPage;
