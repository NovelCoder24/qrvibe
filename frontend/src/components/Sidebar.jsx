import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    QrCode,
    Sparkles,
    CreditCard,
    Settings
} from 'lucide-react';
import UpgradeModal from './UpgradeModal';
import { getVocabulary } from '../config/vocabulary';

const UI_PLAN_LIMITS = {
    free:     { name: 'Free',     maxQrs: 1 },
    local:    { name: 'Local',    maxQrs: 1 },
    starter:  { name: 'Starter',  maxQrs: 10 },
    growth:   { name: 'Growth',   maxQrs: 50 },
    pro:      { name: 'Pro',      maxQrs: 50 },
    business: { name: 'Business', maxQrs: 100 },
};

const Sidebar = ({ isOpen, overlay = false, onClose }) => {
    // Simplified 5 Storefront Links for in-store salons, spas, cafes, bakeries
    const storefrontNav = [
        { id: 'dashboard', label: 'Storefront Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'qrcodes', label: 'Standees & Tables', icon: QrCode, path: '/qrcodes' },
        { id: 'activate', label: 'Activate Standee', icon: Sparkles, path: '/activate' },
        { id: 'billing', label: 'Billing & Plan', icon: CreditCard, path: '/billing' },
        { id: 'settings', label: 'Store Settings', icon: Settings, path: '/account' },
    ];

    const { user } = useSelector((state) => state.auth);
    const v = getVocabulary(user?.businessCategory);
    const subscription = user?.subscription;

    const [showLimitModal, setShowLimitModal] = useState(false);

    // Synchronized Plan & Limit Resolution
    const rawPlan = (subscription?.plan || 'free').toLowerCase();
    const isTrial = subscription?.status === 'trialing';
    const isExpired =
        subscription?.status === 'expired' ||
        (isTrial && subscription?.trialEndsAt && new Date(subscription.trialEndsAt) < new Date());

    const effectivePlan = isExpired ? 'free' : rawPlan;
    const planInfo = UI_PLAN_LIMITS[effectivePlan] || UI_PLAN_LIMITS.free;

    const planName = isTrial && !isExpired
        ? `${planInfo.name} (Trial)`
        : `${planInfo.name} Plan`;

    const dynamicLimit =
        subscription?.dynamicQrLimit && !isExpired && subscription.dynamicQrLimit >= planInfo.maxQrs
            ? subscription.dynamicQrLimit
            : planInfo.maxQrs;

    const used = user?.activeQrCount ?? 0;
    const progressPercent =
        dynamicLimit > 0 && dynamicLimit !== Infinity
            ? Math.min(100, Math.round((used / dynamicLimit) * 100))
            : 0;

    return (
        <>
        {/* Mobile Backdrop Overlay */}
        {isOpen && (
            <div
                className="fixed inset-0 z-40 bg-[#19110D]/60 backdrop-blur-sm lg:hidden transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
        )}

        <aside className={`
            fixed top-0 left-0 z-50
            h-screen w-64 bg-[#FBF9F6] border-r border-[#E3DAD0]
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : `-translate-x-full ${overlay ? '' : 'lg:translate-x-0'}`}
            flex flex-col font-['Instrument_Sans',sans-serif]
            shadow-xl lg:shadow-none
        `}>
            {/* Header / Brand */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-[#E3DAD0]/70">
                <div className="flex items-center gap-2.5">
                    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                        <rect x="1" y="1" width="8" height="8" rx="2" fill="#E5A93C" />
                        <rect x="13" y="1" width="8" height="8" rx="2" fill="#2B1E19" />
                        <rect x="1" y="13" width="8" height="8" rx="2" fill="#2B1E19" />
                        <rect x="13" y="13" width="4" height="4" fill="#E5A93C" />
                    </svg>
                    <span className="font-['Instrument_Serif',serif] text-2xl tracking-tight text-[#2B1E19]">
                        QRVibe
                    </span>
                </div>
                {/* Mobile close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[#6B5A50] hover:text-[#2B1E19] hover:bg-[#F3EDE4] lg:hidden"
                    aria-label="Close sidebar"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Navigation (Simplified 5 Storefront Links) */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {storefrontNav.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => onClose?.()}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all
                                min-h-[44px]
                                ${isActive
                                    ? 'bg-[#2B1E19] text-[#FBF9F6] shadow-sm font-semibold'
                                    : 'text-[#6B5A50] hover:bg-[#F3EDE4] hover:text-[#2B1E19]'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={isActive ? 'text-[#E5A93C]' : 'text-current'} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Plan Card */}
            <div className="px-3.5 py-4 border-t border-[#E3DAD0]/70">
                <NavLink
                    to="/billing"
                    className="block p-3.5 rounded-xl bg-[#F5EFE6] border border-[#E3DAD0] hover:border-[#2B1E19]/30 transition-colors"
                    onClick={() => onClose?.()}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-[#2B1E19]">{planName}</p>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5A93C] font-semibold bg-[#2B1E19] px-1.5 py-0.5 rounded">
                            Active
                        </span>
                    </div>
                    <p className="text-[11.5px] text-[#6B5A50] mt-1">
                        {used}/{dynamicLimit === Infinity ? '∞' : dynamicLimit} {v.quotaLabel || 'standees active'}
                    </p>
                    <div className="mt-2.5 h-1.5 bg-[#E3DAD0]/60 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                progressPercent >= 100
                                    ? 'bg-red-500'
                                    : progressPercent >= 80
                                    ? 'bg-amber-500'
                                    : 'bg-[#E5A93C]'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </NavLink>
            </div>
        </aside>

        <UpgradeModal
            isOpen={showLimitModal}
            onClose={() => setShowLimitModal(false)}
            type="limit"
        />
        </>
    );
};

export default Sidebar;
