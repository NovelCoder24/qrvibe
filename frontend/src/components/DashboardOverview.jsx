import React from 'react';

const DashboardOverview = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'fixed', inset: 0, zIndex: 9999 }}>
      <iframe
        src="/dashboard.html"
        title="QRVibe · Storefront dashboard"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  );
};

export default DashboardOverview;
