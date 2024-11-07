import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Create a test cookie when the component mounts
    document.cookie = "testCookie=testValue; path=/; SameSite=Lax";
    scanCookies();
  }, []);

  const scanCookies = () => {
    const allCookies = document.cookie ? document.cookie.split('; ') : [];
    console.log('All cookies found:', allCookies); // Log all cookies found

    if (allCookies.length === 0) {
      console.warn("No cookies found. Make sure cookies are set and visible to the current domain.");
    }

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
    const strictlyRequiredCookies = ['sessionid', 'csrftoken', 'testCookie'];
    return strictlyRequiredCookies.includes(cookieName);
  };

  const isAnalytics = (cookieName) => {
    const analyticsCookies = ['_ga', '_gid', '_gat'];
    return analyticsCookies.includes(cookieName);
  };

  const isMarketing = (cookieName) => {
    const marketingCookies = ['_fbp', '_gcl_au'];
    return marketingCookies.includes(cookieName);
  };

  const isFunctional = (cookieName) => {
    const functionalCookies = ['language', 'currency'];
    return functionalCookies.includes(cookieName);
  };

  return (
    <Layout>
      <Layout.Section>
        <Card title="Scan cookies" sectioned>
          <Layout vertical spacing="loose">
            <Text>Number of cookies</Text>
            <Text>{cookieStats.total}</Text>
            <Text variation="subdued">
              We have scanned your store to make sure there are no unclassified cookies. These are the cookie scan results:
            </Text>
            <Layout distribution="equalSpacing" spacing="loose">
              <Card sectioned title="Strictly required">
                <Text>{cookieStats.strictlyRequired}</Text>
              </Card>
              <Card sectioned title="Analytics">
                <Text>{cookieStats.analytics}</Text>
              </Card>
              <Card sectioned title="Marketing">
                <Text>{cookieStats.marketing}</Text>
              </Card>
              <Card sectioned title="Functional">
                <Text>{cookieStats.functional}</Text>
              </Card>
              <Card sectioned title="Unclassified">
                <Text>{cookieStats.unclassified}</Text>
              </Card>
            </Layout>
            <Text variation="subdued">Last scan: {new Date().toLocaleString()}</Text>
            <Button onClick={scanCookies}>Scan Again</Button>
          </Layout>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

export default CookieScanner;
