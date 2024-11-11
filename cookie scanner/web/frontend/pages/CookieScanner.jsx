import React, { useState } from 'react';

const CookieScanner = () => {
  const [cookieData, setCookieData] = useState({ required: [], functional: [], analytics: [], marketing: [] });
  const [loading, setLoading] = useState(false);

  const categorizeCookies = (cookies) => {
    const categorizedCookies = {
      required: [],
      functional: [],
      analytics: [],
      marketing: [],
    };

    // Simple categorization logic (You can refine this based on your actual use case)
    cookies.forEach((cookie) => {
      if (cookie.includes('session') || cookie.includes('csrf')) {
        categorizedCookies.required.push(cookie);
      } else if (cookie.includes('analytics')) {
        categorizedCookies.analytics.push(cookie);
      } else if (cookie.includes('marketing')) {
        categorizedCookies.marketing.push(cookie);
      } else {
        categorizedCookies.functional.push(cookie);
      }
    });

    return categorizedCookies;
  };

  const scanCookies = () => {
    setLoading(true);

    // Get cookies as a string
    const allCookies = document.cookie.split(';').map(cookie => cookie.trim());
    
    // Categorize cookies
    const categorizedCookies = categorizeCookies(allCookies);
    
    // Update state
    setCookieData(categorizedCookies);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={scanCookies} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan Cookies'}
      </button>
      <div>
        <h3>Cookie Categories</h3>
        <div>
          <h4>Required ({cookieData.required.length})</h4>
          <ul>
            {cookieData.required.map((cookie, index) => (
              <li key={index}>{cookie}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Functional ({cookieData.functional.length})</h4>
          <ul>
            {cookieData.functional.map((cookie, index) => (
              <li key={index}>{cookie}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Analytics ({cookieData.analytics.length})</h4>
          <ul>
            {cookieData.analytics.map((cookie, index) => (
              <li key={index}>{cookie}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Marketing ({cookieData.marketing.length})</h4>
          <ul>
            {cookieData.marketing.map((cookie, index) => (
              <li key={index}>{cookie}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CookieScanner;
