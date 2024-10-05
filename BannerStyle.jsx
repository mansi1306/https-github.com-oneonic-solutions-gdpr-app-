import React, { useState } from 'react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(true);

  const acceptCookies = () => {
    // Save consent to local storage or send it to backend
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  return showBanner ? (
    <div className="cookie-banner">
      <p>We use cookies to ensure you get the best experience on our website.</p>
      <button onClick={acceptCookies}>Accept Cookies</button>
    </div>
  ) : null;
};

export default CookieBanner;
