import React, { useEffect, useState } from 'react';

const CookieScanner = () => {
  const [cookies, setCookies] = useState([]);
  const [cookieCount, setCookieCount] = useState(0);

  const fetchAllCookies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/shopify_app/get_cookies/'); // Replace with your backend endpoint
      const data = await response.json();
      const cookieList = Object.entries(data).map(([key, value]) => `${key}=${value}`);
      setCookies(cookieList);
      setCookieCount(cookieList.length);
    } catch (error) {
      console.error("Error fetching cookies:", error);
    }
  };

  useEffect(() => {
    fetchAllCookies();
  }, []);

  return (
    <div>
      <h2>Cookie Scanner</h2>
      <p>Total Cookies: {cookieCount}</p>
      {cookieCount > 0 ? (
        <ul>
          {cookies.map((cookie, index) => (
            <li key={index}>{cookie}</li>
          ))}
        </ul>
      ) : (
        <p>No cookies found.</p>
      )}
    </div>
  );
};

export default CookieScanner;
