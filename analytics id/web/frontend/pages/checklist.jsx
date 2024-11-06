import React, { useState } from 'react';
import { Card, Layout, Button, Text } from '@shopify/polaris';

const CookieScanner = () => {
  const [cookieStats, setCookieStats] = useState({
    strictlyRequired: 0,
    analytics: 0,
    marketing: 0,
    functional: 0,
    unclassified: 0,
    total: 0,
  });

  const scanCookies = () => {
    const allCookies = document.cookie ? document.cookie.split('; ') : [];
    
    if (allCookies.length === 0) {
      console.warn("No cookies found. Make sure cookies are set and visible to the current domain.");
      return;
    }

    console.log('All cookies found:', allCookies);

    const classifiedCookies = classifyCookies(allCookies);
    setCookieStats(classifiedCookies);
  };

  const classifyCookies = (allCookies) => {
    let stats = {
      strictlyRequired: 0,
      analytics: 0,
      marketing: 0,
      functional: 0,
      unclassified: 0,
      total: allCookies.length,
    };

    allCookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      console.log('Scanning cookie:', cookieName);

      if (isStrictlyRequired(cookieName)) stats.strictlyRequired++;
      else if (isAnalytics(cookieName)) stats.analytics++;
      else if (isMarketing(cookieName)) stats.marketing++;
      else if (isFunctional(cookieName)) stats.functional++;
      else stats.unclassified++;
    });

    return stats;
  };

  const isStrictlyRequired = (cookieName) => {
    const strictlyRequiredCookies = ['_secure_admin_session_id', 'shopify_session', 'cart', 'cart_sig'];
    return strictlyRequiredCookies.includes(cookieName);
  };

  const isAnalytics = (cookieName) => {
    const analyticsCookies = ['_ga', '_gid', '_gat', '_shopify_y'];
    return analyticsCookies.includes(cookieName);
  };

  const isMarketing = (cookieName) => {
    const marketingCookies = ['_fbp', '_gcl_au', 'shopify_pay_redirect'];
    return marketingCookies.includes(cookieName);
  };

  const isFunctional = (cookieName) => {
    const functionalCookies = ['_shopify_country', '_shopify_m', 'secure_customer_sig'];
    return functionalCookies.includes(cookieName);
  };

  return (
    <Layout>
      <Layout.Section>
        <Card title="Cookie Scanner" sectioned>
          <Text>Number of cookies: {cookieStats.total}</Text>
          <Text variation="subdued">We have scanned your store to categorize the cookies. These are the results:</Text>
          <Layout>
            <Card title="Strictly Required" sectioned>
              <Text>{cookieStats.strictlyRequired}</Text>
            </Card>
            <Card title="Analytics" sectioned>
              <Text>{cookieStats.analytics}</Text>
            </Card>
            <Card title="Marketing" sectioned>
              <Text>{cookieStats.marketing}</Text>
            </Card>
            <Card title="Functional" sectioned>
              <Text>{cookieStats.functional}</Text>
            </Card>
            <Card title="Unclassified" sectioned>
              <Text>{cookieStats.unclassified}</Text>
            </Card>
          </Layout>
          <Button onClick={scanCookies}>Scan Cookies</Button>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

export default CookieScanner;
