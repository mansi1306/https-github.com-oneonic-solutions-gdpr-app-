import React, { useState } from 'react';

const CookieScanner = () => {
  const [cookieData, setCookieData] = useState({
    required: [],
    functional: [],
    analytics: [],
    marketing: [],
  });
  const [loading, setLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState('');

  // Function to categorize cookies based on their names
  const categorizeCookies = (cookies) => {
    const categorizedCookies = {
      required: [],
      functional: [],
      analytics: [],
      marketing: [],
    };

    cookies.forEach((cookie) => {
      const [name] = cookie.split('=');

      if (name.includes('required')) {
        categorizedCookies.required.push(cookie);
      } else if (name.includes('functional')) {
        categorizedCookies.functional.push(cookie);
      } else if (name.includes('analytics')) {
        categorizedCookies.analytics.push(cookie);
      } else if (name.includes('marketing')) {
        categorizedCookies.marketing.push(cookie);
      } else {
        categorizedCookies.functional.push(cookie); // Default to functional
      }
    });

    return categorizedCookies;
  };

  const scanCookies = () => {
    setLoading(true);
  
    // Add test cookies for demonstration
    document.cookie = "required_cookie=test; path=/";
    document.cookie = "functional_cookie=test; path=/";
    document.cookie = "analytics_cookie=test; path=/";
    document.cookie = "marketing_cookie=test; path=/";
  
    // Log current cookies to check if they are set
    console.log("Current cookies after setting:", document.cookie);
  
    // Get all cookies from the current domain
    const rawCookies = document.cookie;
    const allCookiesArray = rawCookies.split(';').map((cookie) => cookie.trim());
  
    // Check if there are any cookies
    if (allCookiesArray.length === 1 && allCookiesArray[0] === "") {
      alert('No cookies found for this domain.');
      setLoading(false);
      return;
    }
  
    // Categorize cookies
    const categorizedCookies = categorizeCookies(allCookiesArray);
  
    // Update the state with categorized cookies and set the last scan time
    setCookieData(categorizedCookies);
    setLastScanTime(new Date().toLocaleString());
    setLoading(false);
  };  

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Cookie Scanner</h2>
      <button onClick={scanCookies} disabled={loading} style={{ marginBottom: '20px' }}>
        {loading ? 'Scanning...' : 'Scan Cookies'}
      </button>

      {/* Display categorized cookies */}
      <div>
        <h3>Required ({cookieData.required.length})</h3>
        <ul>
          {cookieData.required.map((cookie, index) => (
            <li key={index}>{cookie}</li>
          ))}
        </ul>

        <h3>Functional ({cookieData.functional.length})</h3>
        <ul>
          {cookieData.functional.map((cookie, index) => (
            <li key={index}>{cookie}</li>
          ))}
        </ul>

        <h3>Analytics ({cookieData.analytics.length})</h3>
        <ul>
          {cookieData.analytics.map((cookie, index) => (
            <li key={index}>{cookie}</li>
          ))}
        </ul>

        <h3>Marketing ({cookieData.marketing.length})</h3>
        <ul>
          {cookieData.marketing.map((cookie, index) => (
            <li key={index}>{cookie}</li>
          ))}
        </ul>
      </div>

      {/* Display last scan time */}
      {lastScanTime && (
        <div style={{ marginTop: '20px' }}>
          <h4>Last Scan Time: {lastScanTime}</h4>
        </div>
      )}
    </div>
  );
};

export default CookieScanner;
