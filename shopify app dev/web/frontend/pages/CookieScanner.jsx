// src/CookieCounter.js
import React, { useEffect, useState } from 'react';

const CookieCounter = () => {
    const [cookieCount, setCookieCount] = useState(0);

    useEffect(() => {
        // Function to count cookies
        const countCookies = () => {
            // Split the document.cookie string into individual cookies
            const cookies = document.cookie.split(';');
            // Set the cookie count
            setCookieCount(cookies.length);
        };

        countCookies();
    }, []);

    return (
        <div>
            <h1>Cookie Counter</h1>
            <p>Total Cookies: {cookieCount}</p>
        </div>
    );
};

export default CookieCounter;