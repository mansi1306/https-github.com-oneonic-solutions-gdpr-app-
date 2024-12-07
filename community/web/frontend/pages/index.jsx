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
  const [isActivateAppChecked, setIsActivateAppChecked] = useState(false); // Manage "Activate app" checkbox state
  const [isCookieBannerChecked, setIsCookieBannerChecked] = useState(false); // Manage "Setup cookie banner" checkbox state

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const shopUrl = sessionStorage.getItem('shopUrl') || new URLSearchParams(window.location.search).get('shop');
        if (!shopUrl) {
          console.error('Shop URL not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_plan/?shop_url=${shopUrl}`);
        
        if (response.status === 404) {
          // If the plan fetch returns 404, navigate to MonthPlan page
          navigate("/MonthPlan");
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [navigate]);

  const handleNavigate = () => {
    navigate('/BannerRegion');  // Programmatically navigate to the '/BannerRegion' page
  };

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
      <h1 style={{maxWidth: '930px', width: '100%', margin: '0px auto', fontSize: '20px', fontWeight: '650' }}>
        Dashboard
      </h1>
      
      {/* Welcome card */}
      <div style={{ display: 'flex',  padding: '20px', cursor: 'pointer' }}>
        <div style={{ maxWidth: '930px', width: '100%', margin: '0px auto',boxSizing: 'border-box',}}>
          <LegacyCard sectioned>
            <p style={{ marginBottom: '15px', }}>Welcome to Cookie Consent</p>
            <p style={{ fontWeight: '700', fontSize: '25px', marginBottom: '10px', }}>
              Hi {shopName || ''} Admin!
            </p>
          </LegacyCard>
        </div>
      </div>

      {/*Quick start */}
      <div
        style={{
          margin: '-10px auto',
          padding: '10px',
          width: '100%',
          maxWidth: '950px',
          boxSizing: 'border-box',
        }}
      >
        <LegacyCard sectioned title="Quickstart">
          {/* Toggle Image */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '-10px',
            }}
          >
            <img
              src={isImageClicked ? "../assets/up.svg" : "../assets/down.svg"}
              alt="Toggle"
              width="15px"
              style={{ cursor: 'pointer' }}
              onClick={handleImageClick}
            />
          </div>

          {/* Description */}
          <p style={{ marginBottom: '15px' }}>
            Use this guide to quickly set up your cookie banner.
          </p>

          {/* Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px' }}>
              <Text variation="strong">
                {`${[isActivateAppChecked, isCookieBannerChecked].filter(Boolean).length} out of 2 tasks completed`}
              </Text>
            </div>
            <ProgressBar
              progress={
                ([isActivateAppChecked, isCookieBannerChecked].filter(Boolean).length / 2) * 100
              }
              size="small"
              tone="primary"
            />
          </div>

          {/* Conditionally Render Checkboxes */}
          {isImageClicked && (
            <>
              <Checkbox
                label="Activate app"
                checked={isActivateAppChecked}
                onChange={(newChecked) => setIsActivateAppChecked(newChecked)}
              />
              <div style={{ marginTop: '10px', paddingLeft: '25px' }}>
                {isActivateAppChecked ? (
                  <div>
                    <p style={{ marginBottom: '5px' }}>
                      Activate our app to see it visible on your store.
                    </p>
                    <Button destructive onClick={handleDeactivateApp}>
                      Deactivate App
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: '5px', }}>
                      Activate our app to see it visible on your store.
                    </p>
                    <Button variant="primary" onClick={handleActivateApp}>
                      Activate App
                    </Button>
                  </div>
                )}
              </div>
              <br />
              <Checkbox
                label="Set up your cookie banner"
                checked={isCookieBannerChecked}
                onChange={(newChecked) => setIsCookieBannerChecked(newChecked)}
              />
              {isCookieBannerChecked && (
                <div style={{ marginTop: '10px', paddingLeft: '25px' }}>
                  <p style={{ marginBottom: '5px' }}>
                    Customize cookie bar banner appearance to ensure that your banner is visually
                    appealing and consistent with your website's overall theme.
                  </p>
                  <div>
                    <Button variant="primary" onClick={goToSettings}>
                      Go to settings
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </LegacyCard>
      </div>

      {/*Banner*/}
      <div style={{ width: '100%',maxWidth: '950px',margin: '10px auto', padding: '10px',fontSize: '13px',boxSizing: 'border-box',  }}>
        <Banner
          title="Make customize banner"
          action={{
            content: 'Create / Update',
            onAction: handleNavigate, // Trigger the handleNavigate function on button click
          }}
          tone="info"
        >
          <p style={{ marginLeft: '5px'}}>
            Click on the button and make a customized banner.
          </p>
        </Banner>
      </div>


      {/* Consent Tracking - Accepted/Declined Counts */}
      <div style={{width: '100%',maxWidth: '950px',margin: '-5px auto',padding: '10px',fontSize: '13px',boxSizing: 'border-box',}} >
        <Card title="Consent tracking">
          <h1 style={{ fontSize: '15px', fontWeight: '650', marginBottom: '10px' }}>
            Consent tracking
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '-30px',
            }}
          >
            <Button variant="plain" onClick={handleNavigate1}>
              View all consent logs
            </Button>
          </div>
          <DataTable
            columnContentTypes={["text", "text"]}
            headings={["Accepted all", "Declined all"]}
            rows={renderCookiePreferencesTable()}
          />
        </Card>
      </div>


      {/* Consent Tracking - Marketing/Analytics/Functional Counts */}
      <div style={{width: '100%',maxWidth: '950px',margin: '5px auto',padding: '10px',fontSize: '13px',boxSizing: 'border-box',}}>
        <Card title="Consent tracking">
        <h1 style={{ fontSize: '15px', fontWeight: '650', marginBottom: '10px' }}>Accepted partially</h1>
        <div style={{display: 'flex',justifyContent: 'flex-end',marginTop: '-30px',}}>
          <Button variant="plain" onClick={handleNavigate1}>
            View all consent logs
          </Button>
        </div>
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
