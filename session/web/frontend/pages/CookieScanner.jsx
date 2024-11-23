import React, { useEffect } from 'react';

const CookieScanner = () => {
  useEffect(() => {
    // Function to scan and display cookies
    const scanCookies = () => {
      if (document.cookie) {
        console.log("Cookies for admin.myshopify.com:");
        console.log(document.cookie); // Logs the cookies of the current domain

        // Parse cookies into a more readable format
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name, value] = cookie.split('=');
          console.log(`Cookie name: ${name.trim()}, Cookie value: ${value}`);
        });
      } else {
        console.log("No cookies found for this domain.");
      }
    };

    // Call the cookie scan function when component mounts
    scanCookies();
  }, []);

  return (
    <div>
      <h1>Cookie Scanner</h1>
      <p>Check the console for cookies!</p>
    </div>
  );
};

export default CookieScanner;