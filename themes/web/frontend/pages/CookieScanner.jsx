import React, { useState, useEffect } from 'react';

const CookieScanner = () => {
  const [cookies, setCookies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      // Get cookies from document.cookie
      const cookiesString = document.cookie;
      
      if (!cookiesString) {
        setError('No cookies found in the browser.');
      } else {
        // Parse cookies string into an array of objects
        const cookiesArray = cookiesString.split('; ').map(cookie => {
          const [name, value] = cookie.split('=');
          return { name, value };
        });
        setCookies(cookiesArray);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching cookies:', err);
      setError('An error occurred while scanning cookies.');
    }
  }, []);

  return (
    <div>
      <h1>Cookie Scanner</h1>
      {cookies.length > 0 ? (
        <ul>
          {cookies.map((cookie, index) => (
            <li key={index}>
              <strong>{cookie.name}:</strong> {cookie.value}
            </li>
          ))}
        </ul>
      ) : (
        <p>{error || 'No cookies found.'}</p>
      )}
    </div>
  );
};

export default CookieScanner;
