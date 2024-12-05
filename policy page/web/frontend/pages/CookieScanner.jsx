import React, { useState } from 'react';

const CookieScanner = () => {
  const [cookieData, setCookieData] = useState(null);

  const getCookies = () => {
    console.log('Raw document.cookie:', document.cookie);  // Debugging log
    const cookies = document.cookie.split(';').map(cookie => {
      const parts = cookie.split('=');
      if (parts.length === 2) {
        const [name, value] = parts;
        return { name: name.trim(), value: value.trim() };
      }
      return null;
    }).filter(cookie => cookie !== null);
    
    return cookies;
  };
  
  
  // Function to categorize cookies
  const categorizeCookies = (cookies) => {
    const categorized = cookies.map(cookie => {
      // Simple categorization based on cookie name, modify as needed
      let category = 'Other';
      if (cookie.name.toLowerCase().includes('session')) {
        category = 'Session';
      } else if (cookie.name.toLowerCase().includes('persistent')) {
        category = 'Persistent';
      }
      
      return { ...cookie, category };
    });

    return categorized;
  };

  const scanCookies = () => {
    // Get cookies from the document
    const cookies = getCookies();
    const categorizedCookies = categorizeCookies(cookies);
    setCookieData(categorizedCookies);
  };

  return (
    <div>
      <button onClick={scanCookies}>Scan Cookies</button>
      {cookieData && (
        <div>
          <h2>Cookie Scan Results</h2>
          <p>Total Cookies: {cookieData.length}</p>
          <ul>
            {cookieData.map((cookie, index) => (
              <li key={index}>
                {cookie.name} - {cookie.category}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CookieScanner;
