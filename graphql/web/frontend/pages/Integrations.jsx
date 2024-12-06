import {Page, LegacyCard ,Spinner} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function GridExample() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setLoading(false);
    };

    loadData();
  }, []);

  const handleShopifyCardClick = () => {
    navigate('/shopifycustomerprivacy');
  };

  const handleGPC = () => {
    navigate('/GPC');
  };

  const handleGCM = () => {
    navigate('/GCM'); 
  };

  const handleMeta = () => {
    navigate('/MetaPixel'); 
  };

  const handleTikTok = () => {
    navigate('/TikTokPixel'); 
  };

  const handleAds = () => {
    navigate('/GoogleAds'); 
  };

  const handlehub = () => {
    navigate('/HubSpot'); 
  };

  return (
    loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" />
      </div>
    ) : (
      <Page fullWidth>
     <h1
        style={{
          margin :'auto',
          marginBottom:'20px',
          fontSize: '20px',
          fontWeight: '650',
          maxWidth: '1150px',
        }}
      >
        Integrations
      </h1>
    
      <div
        style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          margin: '0 auto',
          maxWidth: '1200px',
          padding: '0 20px',
        }}
      >
        <div onClick={handleShopifyCardClick}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-50px', marginLeft: '-10px' }}>
              <img src="../assets/shopify.png" alt="shopify" width="48px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px' }}>Shopify Customer Privacy</p>
            <p style={{ marginLeft: '50px' }}>
              Limits Shopify’s tracking of visitors and notifies any third-party apps that you have installed in your store
              to limit their own tracking.
            </p>
          </LegacyCard>
        </div>
    
        <div onClick={handleAds}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-50px', marginLeft: '-5px' }}>
              <img src="../assets/ads.png" alt="google ads" width="40px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px', paddingTop: '5px' }}>Google Ads</p>
            <p style={{ marginLeft: '50px' }}>
              Allows you to manage user consent and customize how Google tracks and uses data, ensuring transparency and
              integration with Google Analytics.
            </p>
          </LegacyCard>
        </div>
    
        <div onClick={handleGPC}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-65px', marginLeft: '-5px' }}>
              <img src="../assets/gpc.png" alt="global privacy control" width="40px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px', paddingTop: '20px' }}>
              Global Privacy Control (GPC)
            </p>
            <p style={{ marginLeft: '50px' }}>
              Allows you to automatically collect visitor privacy preferences based on their GPC signal.
            </p>
          </LegacyCard>
        </div>
    
        <div onClick={handleMeta}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-65px', marginLeft: '-5px' }}>
              <img src="../assets/meta.png" alt="meta pixel" width="40px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px', paddingTop: '20px' }}>Meta Pixel</p>
            <p style={{ marginLeft: '50px' }}>
              Allows you to adjust how your Facebook and Instagram track visitors based on their consent status.
            </p>
          </LegacyCard>
        </div>
    
        <div onClick={handleGCM}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-50px', marginLeft: '-10px' }}>
              <img src="../assets/gc.png" alt="google consent mode" width="48px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px' }}>Google Consent Mode V2</p>
            <p style={{ marginLeft: '50px' }}>
              Allows you to adjust how your Google services behave based on the consent status of your visitors.
            </p>
          </LegacyCard>
        </div>
    
        <div onClick={handleTikTok}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-65px', marginLeft: '-5px' }}>
              <img src="../assets/tiktok.png" alt="tiktok pixel" width="40px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px', paddingTop: '20px' }}>TikTok Pixel</p>
            <p style={{ marginLeft: '50px' }}>
              Allows you to adjust how your TikTok tracks visitors based on their consent status.
            </p>
          </LegacyCard>
        </div>
    
        <div onClick={handlehub}>
          <LegacyCard sectioned>
            <div style={{ marginBottom: '-65px', marginLeft: '-10px' }}>
              <img src="../assets/hub.webp" alt="hubspot" width="55px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '650', marginBottom: '7px', paddingTop: '20px' }}>HubSpot</p>
            <p style={{ marginLeft: '50px' }}>
              Allows you to manage consent and automate privacy compliance across your CRM, email marketing, and analytics,
              ensuring adherence to GDPR and other regulations.
            </p>
          </LegacyCard>
        </div>
      </div>
    </Page>
    
    )
  );
}

export default GridExample;