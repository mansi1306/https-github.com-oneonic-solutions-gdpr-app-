  import { IndexTable, Card, Text, Badge, useBreakpoints, Page, Icon, Button,TextContainer,Modal } from '@shopify/polaris';
  import React, { useState, useEffect } from 'react';
  import { ArrowLeftIcon } from '@shopify/polaris-icons';
  import { useNavigate } from 'react-router-dom';

  function IndexTableWithoutCheckboxesExample() {
    const [cookiePreferences, setCookiePreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () => {
        const shopUrl = sessionStorage.getItem('shopUrl') || new URLSearchParams(window.location.search).get('shop');
        if (!shopUrl) {
          console.error('Shop URL not found');
          setLoading(false);
          return;
        }
    
        try {
          const planResponse = await fetch(`http://127.0.0.1:8000/shopify_app/get_plan/?shop_url=${shopUrl}`);
          const planData = await planResponse.json();
          setPlan(planData.plan);
    
          const cookieResponse = await fetch(`http://127.0.0.1:8000/shopify_app/cookie_preference_list/?shop_url=${shopUrl}`);
          const cookieData = await cookieResponse.json();
          setCookiePreferences(Array.isArray(cookieData) ? cookieData : []);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
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

    const breakpoints = useBreakpoints();
    const isBasicOrStandardPlan = plan === 'Basic' || plan === 'Standard';

    const openModal = () => setIsModalOpen(true); // Open modal
    const closeModal = () => setIsModalOpen(false); // Close modal

    const resourceName = {
      singular: 'cookie preference',
      plural: 'cookie preferences',
    };

    const rowMarkup = cookiePreferences.map(
      ({ 'Accepted page': url, 'Given consent': given_consent, 'IP address': ip_address, 'Created at': created_date }, index) => (
        <IndexTable.Row id={index} key={index} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {index + 1}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{url}</IndexTable.Cell>
          <IndexTable.Cell>{given_consent}</IndexTable.Cell>
          <IndexTable.Cell>{ip_address}</IndexTable.Cell>
          <IndexTable.Cell>{created_date}</IndexTable.Cell>
        </IndexTable.Row>
      )
    );

    return (
      <Page fullWidth>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '0px',
            marginBottom: '-30px',
            marginTop: '20px',
          }}
          onClick={() => navigate('/Consent-logs')}
          aria-label="Go to checklist"
        >
          <Icon source={ArrowLeftIcon} />
        </button>
        <h1
          style={{
            marginLeft: '30px',
            marginTop: '10px',
            marginBottom: '30px',
            fontSize: '20px',
            fontWeight: '650',
          }}
        >
          Policy acceptances
        </h1>
        <p style={{ marginBottom: '20px', marginLeft: '30px', marginTop: '-20px' }}>
          View all the consents given for your store
        </p>

        {loading ? (
          <div>Loading...</div>
        ) : isBasicOrStandardPlan ? (
          <Card sectioned>
            <div style={{textAlign: 'center',}}><Text variant="bodyMd">
              Upgrade to a higher plan to unlock this feature.
            </Text></div>
            <div style={{textAlign: 'center',marginTop:'10px'}}><Button primary onClick={openModal} variant="plain">
              Upgrade to unlock
            </Button></div>
          </Card>
        ) : (
          <Card>
            <IndexTable
              condensed={breakpoints.smDown}
              resourceName={resourceName}
              itemCount={cookiePreferences.length}
              headings={[
                { title: `Total (${cookiePreferences.length})` },
                { title: 'Accepted page' },
                { title: 'Given consent' },
                { title: 'IP address' },
                { title: 'Created at' },
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        )}
        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title="Upgrade to Unlock"
          primaryAction={{
            content: 'Start 7 Days Free Trial',
            onAction: async () => {
              await handlePlanSelect('Advanced');
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
              <p style={{fontWeight:'650'}}>what's in pro in Advanced</p>
              <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '30px' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      UNLIMITED IMPRESSIONS
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Constent logs
                      </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Premium Support
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Re-open Cookie banner
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Privacy Policy Consent
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Highest priority support
                      </li>
              </ul>
            </TextContainer>
          </Modal.Section>
        </Modal>
      </Page>
    );
  }

  export default IndexTableWithoutCheckboxesExample;
