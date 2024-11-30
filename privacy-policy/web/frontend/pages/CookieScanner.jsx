import React, { useEffect, useState } from 'react';

const CookieScanner = () => {
    const [cookieCount, setCookieCount] = useState(0);
    const [cookiesList, setCookiesList] = useState([]);

    // Function to scan all cookies in the browser
    const scanCookies = () => {
        // Get all cookies as a string
        const cookies = document.cookie;

        // Log the raw cookie string for debugging
        console.log('Raw cookies string:', cookies);

        // If no cookies, return an empty object
        if (!cookies) {
            return {};
        }

        // Split cookies by semicolon and create an object of cookies
        const cookieArray = cookies.split(';');
        const cookieObject = {};

        cookieArray.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookieObject[name] = value;
            }
        });

        return cookieObject;
    };

    useEffect(() => {
        // Scan cookies on component mount
        const cookies = scanCookies();

        // Get the cookie names and their count
        const cookieNames = Object.keys(cookies);

        // Update state with the count and the cookies list
        setCookieCount(cookieNames.length);
        setCookiesList(cookieNames);

        // Debugging: Log cookie names and values
        if (cookieNames.length === 0) {
            console.log('No cookies found.');
        } else {
            console.log(`Total cookies: ${cookieNames.length}`);
            cookieNames.forEach(cookie => {
                console.log(`${cookie}: ${cookies[cookie]}`);
            });
        }
    }, []); // Only run this effect once, on mount

    return (
        <div>
            <h2>Cookie Scanner</h2>
            <h3>Cookie Count:</h3>
            <p>Total Cookies: {cookieCount}</p>

            <h3>All Cookies:</h3>
            <ul>
                {cookieCount > 0 ? (
                    cookiesList.map((cookie, index) => (
                        <li key={index}>
                            <strong>{cookie}:</strong> {document.cookie.split('; ').find(row => row.startsWith(cookie)).split('=')[1]}
                        </li>
                    ))
                ) : (
                    <p>No cookies found</p>
                )}
            </ul>
        </div>
    );
};

export default CookieScanner;
