import { Page, LegacyCard, Spinner, Button, Badge, Modal, TextContainer } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function Checklist() {
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const navigate = useNavigate();

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
        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }

        const data = await response.json();
        setPlan(data.plan);
        console.log('Fetched plan:', data.plan);
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
    };

    loadData();
  }, []);

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);

    const planPricesForBackend = {
      Basic: "1.00",
      Standard: "2.00",
      Advanced: "3.00",
    };

    const getShopUrl = () => {
      let shopUrl = sessionStorage.getItem("shopUrl");
      if (!shopUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        shopUrl = urlParams.get("shop");
      }
      if (shopUrl) {
        sessionStorage.setItem("shopUrl", shopUrl);
      }
      return shopUrl;
    };

    const shopUrl = getShopUrl();
    if (!shopUrl) {
      console.error("Shop URL not found");
      return;
    }

    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/shopify_app/get_csrf_token/", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch CSRF token");
        const data = await response.json();
        return data.csrfToken;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    const csrfToken = await fetchCsrfToken();
    if (!csrfToken) {
      console.error("CSRF token could not be fetched.");
      return;
    }

    const accessTokenResponse = await fetch(
      "http://127.0.0.1:8000/shopify_app/get_access_token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ shop_url: shopUrl }),
      }
    );

    if (!accessTokenResponse.ok) {
      console.error("Failed to fetch access token");
      return;
    }

    const accessTokenData = await accessTokenResponse.json();
    const accessToken = accessTokenData.access_token;

    try {
      const planPrice = planPricesForBackend[plan];
      const chargeResponse = await fetch(
        "https://a1f7-103-105-234-95.ngrok-free.app/shopify_app/create_charge/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ shop_url: shopUrl, plan_price: planPrice }),
        }
      );

      if (chargeResponse.ok) {
        const chargeData = await chargeResponse.json();
        console.log("Charge creation response:", chargeData);

        if (chargeData.success) {
          const confirmationUrl = chargeData.charge.confirmation_url;
          console.log("Redirecting to confirmation URL:", confirmationUrl);
          window.top.location.href = confirmationUrl; // Redirect to the confirmation URL in the top-level browser window
        } else {
          console.error("Charge creation failed:", chargeData.error);
        }        
      } else {
        console.error("Failed to create charge:", chargeResponse.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSetupGCM = () => navigate('/GCM');
  const handleSetupIndex = () => navigate('/');
  const handleSetupType = () => navigate('/BannerType');
  const handleSetupOpen = () => navigate('/re-open');
  const handlePrivacyPolicy = () => navigate('/privacy-policy');

  const openModal = () => setIsModalOpen(true); // Open modal
  const closeModal = () => setIsModalOpen(false); // Close modal

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" />
      </div>
    );
  }

  const isBasicPlan = plan === 'Basic';

  return (
    <Page fullWidth>
    <h1
      style={{
       margin:'auto',
        marginBottom: '20px',
        fontSize: '20px',
        fontWeight: '650',
        maxWidth: '1150px',
      }}
    >
      GDPR Checklist
    </h1>
    <div
      style={{
        display: 'grid',
        gap: '20px',
        padding: '0 20px',
        margin: '0 auto',
        maxWidth: '1200px',
      }}
    >
      {/* Card 1 */}
      <div style={{ cursor: 'pointer' }}>
        <LegacyCard sectioned>
          <p style={{ fontWeight: '650', marginBottom: '7px' }}>
            Google Consent mode version 2
          </p>
          <p>
            Block Google tracking by default until customers give consent. Google Consent Mode v2 is mandatory by
            March 2024 for those who use Google tracking services.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Button variant="primary" onClick={handleSetupGCM}>Setup</Button>
          </div>
        </LegacyCard>
      </div>
  
      {/* Card 2 */}
      <div style={{ cursor: 'pointer' }}>
        <LegacyCard sectioned>
          <p style={{ fontWeight: '650', marginBottom: '7px', paddingTop: '5px' }}>Show re-open button</p>
          <p>
            Customers have the right to withdraw their consent at any time. This requirement is outlined in Article 7.3.
          </p>
          <div style={{ marginTop: '10px' }}>
            {isBasicPlan ? (
              <>
                <Button disabled>Setup</Button>
                <div style={{ marginLeft: '70px', marginTop: '-25px' }}>
                  <Button onClick={openModal} variant="plain">Upgrade to unlock </Button>
                </div>
              </>
            ) : (
              <Button variant="primary" onClick={handleSetupOpen}>Setup</Button>
            )}
          </div>
        </LegacyCard>
      </div>
  
      {/* Card 3 */}
      <div style={{ cursor: 'pointer' }}>
        <LegacyCard sectioned>
          <p style={{ fontWeight: '650', marginBottom: '7px', paddingTop: '5px' }}>Show privacy policy link</p>
          <p>
            Inform your customers why you’re processing their data. This requirement is outlined in Article 12.
          </p>
          <div style={{ marginTop: '10px' }}>
            {isBasicPlan ? (
              <>
                <Button disabled>Setup</Button>
                <div style={{ marginLeft: '70px', marginTop: '-25px' }}>
                  <Button onClick={openModal} variant="plain">Upgrade to unlock </Button>
                </div>
              </>
            ) : (
              <Button variant="primary" onClick={handlePrivacyPolicy}>Setup</Button>
            )}
          </div>
        </LegacyCard>
      </div>
  
      {/* Card 4 */}
      <div style={{ cursor: 'pointer' }}>
        <LegacyCard sectioned>
          <p style={{ fontWeight: '650', marginBottom: '7px', paddingTop: '5px' }}>Show cookie banner</p>
          <p>
            It is required to inform customers about data processing and ask for their consent. This requirement is outlined in recital 32.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Button variant="primary" onClick={handleSetupIndex}>Setup</Button>
          </div>
        </LegacyCard>
      </div>
  
      {/* Card 5 */}
      <div style={{ cursor: 'pointer' }}>
        <LegacyCard sectioned>
          <p style={{ fontWeight: '650', marginBottom: '7px', paddingTop: '5px' }}>Show preferences button</p>
          <p>
            Customers can view details and choose cookie categories to give consent. This requirement is outlined in Article 13.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Button variant="primary" onClick={handleSetupType}>Setup</Button>
          </div>
        </LegacyCard>
      </div>
    </div>
  
    {/* Modal for Upgrade */}
    <Modal
      open={isModalOpen}
      onClose={closeModal}
      title="Upgrade to Unlock"
      primaryAction={{
        content: 'Start 7 Days Free Trial',
        onAction: () => {
          handlePlanSelect('Standard');
          closeModal();
        },
      }}
      secondaryActions={[
        {
          content: 'See All Pricing',
          onAction: () => {
            navigate("/MonthPlan");
            closeModal();
          },
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p style={{ fontWeight: '650' }}>What's in pro in Standard</p>
          <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '30px' }}>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <img src="../assets/99.png" alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
              UNLIMITED IMPRESSIONS
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <img src="../assets/99.png" alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
              Auto-transfer Cookie
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <img src="../assets/99.png" alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
              GDPR Checklist
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <img src="../assets/99.png" alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
              Settings GDPR compliance
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <img src="../assets/99.png" alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
              Re-open Cookie banner
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <img src="../assets/99.png" alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
              Privacy Policy Consent
            </li>
          </ul>
        </TextContainer>
      </Modal.Section>
    </Modal>
  </Page>
  
  );
}

export default Checklist;
