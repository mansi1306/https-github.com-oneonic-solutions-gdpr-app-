import React, { useState } from 'react';
import { Page, Card, Button, Layout, Badge } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

function PricingTable() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);

    const planPrices = {
      Basic: '1.00',
      Standard: '2.00',
      Premium: '3.00'
  };
    
  
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
    } else {
      console.log('Shop URL:', shopUrl);
    }
  
    try {
      // First, make the request to select the plan
      const planResponse = await fetch(`http://127.0.0.1:8000/shopify_app/select_plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, shop_url: shopUrl }),
      });
  
      if (planResponse.ok) {
        const data = await planResponse.json();
        console.log('Plan selected successfully:', data);
  
        // Assuming the plan includes a price, set it here
        const planPrice = planPrices[plan];
        
        // Create charge
        const chargeResponse = await fetch(`http://127.0.0.1:8000/shopify_app/create_charge/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shop_url: shopUrl,  plan_price: planPrice }),
        });
  
        if (chargeResponse.ok) {
          const chargeData = await chargeResponse.json();
          console.log('Charge created successfully:', chargeData);
  
          const host = new URLSearchParams(window.location.search).get('host');
          console.log('Host:', host);
  
          if (!host) {
            console.error('Host parameter is missing from the URL. Redirecting to Shopify Admin...');
            window.location.href = `https://${shopUrl}/admin/apps/4d48baea68b47ab91304b6080392c538`;
            return;
          }
  
          const app = createApp({
            apiKey: '4d48baea68b47ab91304b6080392c538',
            host: host,
          });
  
          const redirect = Redirect.create(app);
  
          // Correct redirect to your app page
          redirect.dispatch(Redirect.Action.REMOTE, `https://${shopUrl}/admin/apps/4d48baea68b47ab91304b6080392c538`);
        } else {
          console.error('Failed to create charge:', chargeResponse.status);
        }
      } else {
        console.error('Failed to select plan:', planResponse.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
  return (
    <Page>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginLeft: '280px', marginTop: '10px' }}>Select your plan now for an exclusive deal</h1>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginLeft: '330px', marginTop: '10px', color: 'rgb(33, 43, 92)', marginBottom: '30px' }}>only in this onboarding session</h1>
      <Layout>
        <Layout distribution="equalSpacing">
          <div style={{ width: '230px', height: '200px', marginTop: '50px', marginLeft: '10px' }}>
            <Card sectioned>
              <Layout vertical>
                <img src='../assets/free.png' alt="Plan icon" width='55px' style={{ marginRight: '120px', paddingTop: '20px' }} />
                <h1 style={{ marginLeft: '-20px', marginRight: '90px', fontSize: '20px', fontWeight: '650', marginTop: '10px' }}>Basic</h1>
                <p style={{ marginTop: '20px', marginLeft: '40px', fontWeight: '650', marginRight: '130px' }}>
                  <span style={{ fontSize: '30px' }}>$</span>
                  <span style={{ fontSize: '30px' }}>1</span>
                  <span>/month</span>
                </p>
                <div style={{ width: '250px', marginLeft: '10px', marginTop: '10px', height: '50px' }}>
                  <Button fullWidth onClick={() => handlePlanSelect('Basic')}>Start 7-day FREE trial</Button>
                </div>
                <Layout vertical spacing="tight">
                  <div style={{ marginRight: '70px', marginBottom: '-10px', marginTop: '10px' }}>All in Basic, plus:</div>
                  <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '30px' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      UNLIMITED IMPRESSIONS
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Google Consent Mode V2
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Cookie Banner creation
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Global Privacy Control (GPC)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Cookie management
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Integrations
                    </li>
                  </ul>
                </Layout>
              </Layout>
            </Card>
          </div>

          {/* Standard Plan */}
          <div style={{ width: '230px', height: '200px', marginTop: '50px', marginLeft: '10px' }}>
            <div style={{ border: '2px solid rgb(33, 43, 92)', borderRadius: '10px' }}>
              <Card sectioned>
                <Layout vertical>
                  <img src='../assets/120.png' alt="Plan icon" width='55px' style={{ marginRight: '120px', paddingTop: '20px' }} />
                  <h1 style={{ marginLeft: '10px', marginRight: '90px', fontSize: '20px', fontWeight: '650', marginTop: '10px' }}>Standard</h1>
                  <p style={{ marginTop: '-90px', marginLeft: '120px' }}><Badge tone="info">Best for you</Badge></p>
                  <p style={{ marginTop: '20px', marginLeft: '50px', fontWeight: '650', marginRight: '130px' }}>
                    <span style={{ fontSize: '30px' }}>$</span>
                    <span style={{ fontSize: '30px' }}>2</span>
                    <span>/month</span>
                  </p>
                  <div style={{ width: '250px', marginLeft: '10px', marginTop: '10px', height: '50px' }}>
                    <Button fullWidth variant='primary' onClick={() => handlePlanSelect('Standard')}>Start 7-day FREE trial</Button>
                  </div>
                  <Layout vertical spacing="tight">
                    <div style={{ marginRight: '40px', marginBottom: '-10px', marginTop: '10px' }}>All in Standard, plus:</div>
                    <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '30px' }}>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        UNLIMITED IMPRESSIONS
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Advanced cookie scanner
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Auto-transfer Cookie
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        GDPR Checklist
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        settings GDPR compliance
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                        Re-open Cookie banner
                      </li>
                    </ul>
                  </Layout>
                </Layout>
              </Card>
            </div>
          </div>

          {/* Advanced Plan */}
          <div style={{ width: '230px', height: '200px', marginTop: '50px', marginLeft: '10px' }}>
            <Card sectioned>
              <Layout vertical>
                <img src='../assets/advanced.png' alt="Plan icon" width='55px' style={{ marginRight: '120px', paddingTop: '20px' }} />
                <h1 style={{ marginLeft: '30px', marginRight: '90px', fontSize: '20px', fontWeight: '650', marginTop: '10px' }}>Advanced</h1>
                <p style={{ marginTop: '20px', marginLeft: '50px', fontWeight: '650', marginRight: '130px' }}>
                  <span style={{ fontSize: '30px' }}>$</span>
                  <span style={{ fontSize: '30px' }}>3</span>
                  <span>/month</span>
                </p>
                <div style={{ width: '250px', marginLeft: '10px', marginTop: '10px', height: '50px' }}>
                  <Button fullWidth onClick={() => handlePlanSelect('Advanced')}>Start 7-day FREE trial</Button>
                </div>
                <Layout vertical spacing="tight">
                  <div style={{ marginRight: '0px', marginBottom: '-10px', marginTop: '10px' }}>All in Advanced, plus:</div>
                  <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '30px' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      UNLIMITED IMPRESSIONS
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Dynamic Cookie Banner
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Auto-Create Consent
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <img src='../assets/99.png' alt="Plan icon" width="25px" style={{ marginLeft: '20px' }} />
                      Premium Support
                    </li>
                  </ul>
                </Layout>
              </Layout>
            </Card>
          </div>
        </Layout>
      </Layout>
    </Page>
  );
}

export default PricingTable;
