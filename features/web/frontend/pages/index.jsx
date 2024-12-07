import { Page, LegacyCard, Card, DataTable, Banner, Button,Text,ProgressBar,Checkbox} from '@shopify/polaris';
import React, { useState, useCallback, useEffect } from 'react';
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
  const [checked, setChecked] = useState(false); // Manage checkbox state
  const [isImageClicked, setIsImageClicked] = useState(false); // Manage image toggle state
  const [isActivateAppChecked, setIsActivateAppChecked] = useState(true); // Manage "Activate app" checkbox state
  const [isCookieBannerChecked, setIsCookieBannerChecked] = useState(false); // Manage "Setup cookie banner" checkbox state

  const handleImageClick = () => setIsImageClicked(!isImageClicked); // Toggle state on image click
  
  const fetchStoreData = async () => {
    const shopUrl = getShopUrl(); // Replace with your logic to get the shop URL
    if (!shopUrl) {
      console.error("Shop URL not found");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/shopify_app/get_store_data/?shop_url=${shopUrl}`
      );

      if (response.ok) {
        const data = await response.json();
        const { banner_type: bannerType } = data;

        if (bannerType) {
          setIsCookieBannerChecked(true);
        } else {
          setIsCookieBannerChecked(false);
        }
      } else {
        console.error("Error fetching store data");
        setIsCookieBannerChecked(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      setIsCookieBannerChecked(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

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

  const handleActivateApp = () => {
    const shopUrl = getShopUrl();
    if (!shopUrl) {
      console.error('Shop URL not found');
      return;
    }
    setIsActivateAppChecked(true);
    window.open(`https://${shopUrl}/admin/themes/current/editor?context=apps`, "_blank");
  };

  const handleDeactivateApp = () => {
    const shopUrl = getShopUrl();
    if (!shopUrl) {
      console.error('Shop URL not found');
      return;
    }
    setIsActivateAppChecked(false);
    window.open(`https://${shopUrl}/admin/themes/current/editor?context=apps`, "_blank");
  };
  
  const goToSettings = () => {
    navigate('/BannerRegion');
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

      <div style={{ marginLeft: "150px", marginTop: "20px" }}>
      <div style={{ width: "950px" }}>
        <LegacyCard sectioned title="Quickstart">
          {/* Image for toggling */}
          <div style={{ marginLeft: "900px", marginTop: "-20px" }}>
            <img
              src={isImageClicked ? "../assets/up.svg" : "../assets/down.svg"}
              alt="Toggle"
              width="15px"
              style={{ cursor: "pointer" }}
              onClick={handleImageClick}
            />
          </div>

          {/* Description */}
          <p style={{ marginBottom: "15px" }}>
            Use this guide to quickly setup your cookie banner
          </p>

          {/* ProgressBar and Completion Text */}
          <div style={{ marginBottom: "20px", marginRight: "15px" }}>
            <Text variation="strong">
              {`${[isActivateAppChecked, isCookieBannerChecked].filter(Boolean).length} out of 2 tasks completed`}
            </Text>
            <ProgressBar
              progress={
                ([isActivateAppChecked, isCookieBannerChecked].filter(Boolean).length / 2) * 100
              }
              size="small"
              tone="primary"
            />
          </div>

          {/* Conditionally render checkboxes */}
          {isImageClicked && (
            <>
              <Checkbox
                label="Activate app"
                checked={isActivateAppChecked}
                onChange={(newChecked) => setIsActivateAppChecked(newChecked)}
              />
             <div style={{ marginTop: "10px", marginLeft: "25px" }}>
                {isActivateAppChecked ? (
                  <div>
                  <p style={{marginBottom:'5px'}}>Activate our app to see it visible on your store.</p>
                  <Button destructive onClick={handleDeactivateApp}>
                    Deactivate App
                  </Button>
                  </div>
                ) : (
                  <div>
                  <p style={{marginBottom:'5px'}}>Activate our app to see it visible on your store.</p>
                  <Button variant='primary' onClick={handleActivateApp}>
                    Activate App
                  </Button>
                  </div>
                )}
              </div>
              <br />
              <Checkbox
                label="Setup your cookie banner"
                checked={isCookieBannerChecked}
                onChange={(newChecked) => setIsCookieBannerChecked(newChecked)}
              />
              {isCookieBannerChecked && (
                 <div style={{ marginTop: "10px", marginLeft: "25px" }}>
                  <p style={{marginBottom:'5px'}}>
                    Customize cookie bar banner appearance to ensure that your banner is visually
                    appealing and consistent with your website's overall theme.
                  </p>
                  <div><Button variant='primary' onClick={goToSettings}>Go to settings</Button></div>
                </div>
              )}
            </>
          )}
        </LegacyCard>
      </div>
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
