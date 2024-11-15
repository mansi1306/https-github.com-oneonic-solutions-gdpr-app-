import React, { useEffect, useState } from 'react';

const CookieScanner = () => {
    const [cookies, setCookies] = useState([]);
    const [categorizedCookies, setCategorizedCookies] = useState([]);

    const getCookies = () => {
        const cookieString = document.cookie;
        console.log('Document.cookie contents:', cookieString); // Debugging step

        if (!cookieString) {
            console.warn('No cookies found in document.cookie');
            return [];
        }

        return cookieString.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            const value = rest.join('=');

            return {
                name: name || 'Unknown',
                value: value || 'Unknown',
            };
        });
    };

    const categorizeCookies = (cookies) => {
        return cookies.map(cookie => {
            if (cookie.name.includes('_shopify') || cookie.name === 'cart') {
                return { ...cookie, category: 'Essential' };
            } else if (cookie.name.includes('_ga') || cookie.name.includes('_gid')) {
                return { ...cookie, category: 'Analytics' };
            } else {
                return { ...cookie, category: 'Unknown' };
            }
        });
    };

    useEffect(() => {
        const allCookies = getCookies();
        console.log('Parsed cookies:', allCookies); // Debugging step
        setCookies(allCookies);

        const categorized = categorizeCookies(allCookies);
        console.log('Categorized cookies:', categorized); // Debugging step
        setCategorizedCookies(categorized);
    }, []);

    return (
        <div>
            <h2>Cookie Scanner</h2>
            <h3>All Cookies:</h3>
            <ul>
                {cookies.length > 0 ? cookies.map((cookie, index) => (
                    <li key={index}>
                        <strong>{cookie.name}</strong>: {cookie.value}
                    </li>
                )) : <p>No cookies found</p>}
            </ul>
            <h3>Categorized Cookies:</h3>
            <ul>
                {categorizedCookies.length > 0 ? categorizedCookies.map((cookie, index) => (
                    <li key={index}>
                        <strong>{cookie.name}</strong>: {cookie.value} <em>({cookie.category})</em>
                    </li>
                )) : <p>No categorized cookies found</p>}
            </ul>
        </div>
    );
};

export default CookieScanner;
