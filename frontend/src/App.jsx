import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/authSlice';
import { Loader2 } from 'lucide-react';

import PrivateRoute from './components/PrivateRoute.jsx';

const DashboardOverview = React.lazy(() => import('./pages/DashboardOverview.jsx'));
const QRCodesList = React.lazy(() => import('./pages/QRCodesList.jsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage.jsx'));
const LandingPage = React.lazy(() => import('./pages/LandingPage.jsx'));
const QRDetailPage = React.lazy(() => import('./pages/QRDetailPage.jsx'));
const AccountPage = React.lazy(() => import('./pages/AccountPage.jsx'));
const BillingPage = React.lazy(() => import('./pages/BillingPage.jsx'));
const MenuViewPage = React.lazy(() => import('./pages/MenuViewPage.jsx'));
const StandeeActivationPage = React.lazy(() => import('./pages/StandeeActivationPage.jsx'));

import TrialWarningBanner from './components/TrialWarningBanner.jsx';
import TrialExpiredModal from './components/TrialExpiredModal.jsx';

const ShortLinkRedirect = () => {
  const { shortId } = useParams();
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    if (shortId) {
      window.location.replace(`${baseUrl}/r/${shortId}`);
    }
  }, [shortId]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

const ProtectedLayout = () => (
  <div className="min-h-screen bg-[#FBF9F6] text-[#2B1E19]">
    <TrialWarningBanner />
    <TrialExpiredModal />
    <Outlet />
  </div>
);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <React.Suspense fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Loading QRVibe...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Public Storefront & Marketing Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/q/:shortId" element={<ShortLinkRedirect />} />
          <Route path="/r/:shortId" element={<ShortLinkRedirect />} />
          <Route path="/menu/:shortId" element={<MenuViewPage />} /> 
          <Route path="/s/:shortId" element={<MenuViewPage />} /> 
          <Route path="/activate" element={<StandeeActivationPage />} />
          <Route path="/activate/:code" element={<StandeeActivationPage />} />

          {/* Protected Storefront Dashboard & Management Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/qrcodes" element={<QRCodesList />} />
              <Route path="/qrcodes/:id" element={<QRDetailPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/account" element={<AccountPage />} />
              {/* Legacy aliases redirecting smoothly to Storefront Dashboard */}
              <Route path="/create" element={<Navigate to="/dashboard" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </div>
  );
};

export default App;
