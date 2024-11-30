import { Page, LegacyCard, Card, DataTable, Banner, Button} from '@shopify/polaris';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GridExample() {
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [acceptCount, setAcceptCount] = useState(0);
  const [rejectCount, setRejectCount] = useState(0);
  const [marketingCount, setMarketingCount] = useState(0);
  const [analyticsCount, setAnalyticsCount] = useState(0);
  const [functionalCount, setFunctionalCount] = useState(0);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/BannerRegion');  // Programmatically navigate to the '/BannerRegion' page
  };

  const handleNavigate1 = () => {
    navigate('/Policy-acceptances');  // Programmatically navigate to the '/BannerRegion' page
  };

  useEffect(() => {
    const getShopUrl = () => {
      let shopUrl = sessionStorage.getItem('shopUrl');
      if (!shopUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        shopUrl = urlParams.get('shop');
      }
      if (shopUrl) {
        sessionStorage.setItem('shopUrl', shopUrl);
      }
      return shopUrl;
    };

    const shopUrl = getShopUrl();
    if (!shopUrl) {
      console.error('Shop URL not found');
      return;
    }

    const fetchShopName = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/shop_name/?shop_url=${shopUrl}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.shop_name) {
          setShopName(data.shop_name);
        }
      } catch (error) {
        console.error('Error fetching shop name:', error);
      }
    };

    fetchShopName();

    // Fetch the cookie preference counts
    const fetchCookiePreferenceCounts = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_cookie_preference_counts/?shop_url=${shopUrl}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        console.log('Cookie Preference Counts:', data); // Log to see the response data
        
        setAcceptCount(data.accept_all);
        setRejectCount(data.decline_all);
        setMarketingCount(data.marketing);
        setAnalyticsCount(data.analytics);
        setFunctionalCount(data.functional);
      } catch (error) {
        console.error('Error fetching cookie preference counts:', error);
      }
    };    

    fetchCookiePreferenceCounts();
  }, []);

  // Render rows for both tables
  const renderCookiePreferencesTable = () => {
    return [
      [acceptCount, rejectCount],
    ];
  };

  const renderSpecificPreferencesTable = () => {
    return [
      [analyticsCount, marketingCount, functionalCount],
    ];
  };

  return (
    <Page fullWidth>
      <h1 style={{ marginLeft: '155px', marginTop: '10px', marginBottom: '30px', fontSize: '20px', fontWeight: '650' }}>
        Dashboard
      </h1>
      
      {/* Welcome card */}
      <div style={{ marginLeft: '150px', cursor: 'pointer' }}>
        <div style={{ width: '950px' }}>
          <LegacyCard sectioned>
            <p style={{ marginBottom: '15px' }}>Welcome to Cookie Consent</p>
            <p style={{ fontWeight: '700', fontSize: '25px', marginBottom: '10px' }}>
              Hi {shopName || ''} Admin!
            </p>
          </LegacyCard>
        </div>
      </div>

      {/* Consent settings */}
      <div style={{ width: '950px', marginLeft: '150px', marginTop: '20px', fontSize: '13px' }}>
      <Banner
        title="Make customize banner"
        action={{
          content: 'Create / Update',
          onAction: handleNavigate,  // Trigger the handleNavigate function on button click
        }}
        tone="info"
      >
        <p>Click on the button and make a customized banner.</p>
      </Banner>
      </div>

      {/* Consent Tracking - Accepted/Declined Counts */}
      <div style={{ width: '950px', marginLeft: '150px', marginTop: '20px', fontSize: '13px' }}>
        <Card title="Consent tracking">
          <h1 style={{ fontSize: '15px', fontWeight: '650' }}>Consent tracking</h1>
          <div style={{marginLeft:'770px',marginTop:'-20px'}}><Button variant="plain" onClick={handleNavigate1}>View all consent logs</Button></div>
          <DataTable
            columnContentTypes={["text", "text"]}
            headings={["Accepted all", "Declined all"]}
            rows={renderCookiePreferencesTable()}
          />
        </Card>
      </div>

      {/* Consent Tracking - Marketing/Analytics/Functional Counts */}
      <div style={{ width: '950px', marginLeft: '150px', marginTop: '20px', fontSize: '13px' }}>
        <Card title="Consent tracking">
        <h1 style={{ fontSize: '15px', fontWeight: '650' }}>Accepted partially</h1>
        <div style={{marginLeft:'770px',marginTop:'-20px'}}><Button variant="plain" onClick={handleNavigate1}>View all consent logs</Button></div>
          <DataTable
            columnContentTypes={["text", "text", "text"]}
            headings={["Analytics", "Marketing", "Functional"]}
            rows={renderSpecificPreferencesTable()}
          />
        </Card>
      </div>
    </Page>
  );
}

export default GridExample;
