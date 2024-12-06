import {Page, LegacyCard,Icon, Badge, Banner, Button,Modal, Collapsible} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {CaretDownIcon,CaretUpIcon} from '@shopify/polaris-icons';

function GridExample() {
  const navigate = useNavigate();
  const [modalActive, setModalActive] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  const toggleModal = () => setModalActive(!modalActive);

  const handleStepToggle = (step) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

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
  
  return (
    <Page fullWidth>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px',margin:'20px auto',maxWidth:'1000px',width:'950px' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
          onClick={() => navigate('/Integrations')}
          aria-label="Go to Integration"
        >
          <Icon source={ArrowLeftIcon} />
        </button>
        <img src='../assets/gpc.png' alt="shopify" width='35px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>Global Privacy Control (GPC)</b></h1>
      </div>
      <div style={{margin:'auto',cursor:'pointer',maxWidth:'950px'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>SGlobal Privacy Control (GPC) allows visitors to set their privacy preferences once through their browsers or devices
            and automatically notify online businesses of these preferences. GPC is required under the California
            Consumer Protection Act (CCPA).</p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'615px'}}>
         <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with Global Privacy Control (GPC)?"></Banner></div>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'-115px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'15px'}}>
                Step 1 : Integrate with Global Privacy Control (GPC)
            </p>
            <p style={{marginBottom:'10 px'}}>Turn on to integrate our app with Global Privacy Control signals</p>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'15px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'15px'}}>
            Step 2 : Test if integration with Global Privacy Control (GPC) works successfully
            </p>
            <p style={{marginBottom:'10px'}}>Please click the button below for the instructions on how to test GPC.</p>
            <Button variant="primary"  onClick={toggleModal}>View guide</Button>
          </LegacyCard></div>
          {/* Modal Component */}
          {modalActive && (
        <Modal
          open={modalActive}
          onClose={toggleModal}
          title="How to Test GPC Integration"
          secondaryActions={{ content: 'Done', onAction: toggleModal }}
        >
          <Modal.Section>
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} style={{ marginBottom: '15px',borderBottom:'1px solid lightgray',paddingBottom:'10px' }}>
                <div
                  onClick={() => handleStepToggle(step)}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} >
                  <span style={{fontWeight:'750'}}>Step {step}</span>
                  <div><Icon source={expandedStep === step ? CaretUpIcon : CaretDownIcon} /></div>
                </div>
                <Collapsible open={expandedStep === step}>
                  <div style={{ padding: '10px 0', fontSize: '14px', color: '#5C5F62'}}>
                  {/* Conditional Image Rendering for Step 2 */}
                  {step === 1 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                        <span style={{fontWeight:'750'}}> Choose a Browser or Extension: </span>
                        <p><span style={{fontWeight:'750'}}> Browser </span>: Use BRAVE. Remember to turn off "Shield" on the website so the banner can be shown.</p>
                        <p><span style={{fontWeight:'750'}}> Extension </span>: Try the  <span style={{color:'rgb(0, 66, 153)',fontWeight:'650'}}> GPC Enabler </span> for Chrome.</p>
                      </div>
                    )}

                    {/* Conditional Image Rendering for Step 4 */}
                    {step === 2 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                       <p style={{marginBottom:'5px'}}>Turn on the GPC signal in your chosen browser or extension.</p>
                         <p>To confirm the signal is being passed, open the Storefront, then Developer Tools (F12) in Console, and enter:</p>
                         <p style={{ backgroundColor: '#f4f6f8', padding: '10px',marginBottom:'5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px' }}>
                         <span style={{color:'rgb(10,99,85)'}}>navigator</span>.globalPrivacyControl
                        </p>
                        <p>The value should read <span style={{fontWeight:'750'}}> true </span>.</p>
                      </div>
                    )}
                    
                    {/* Conditional Image Rendering for Step 2 */}
                    {step === 3 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                        <p style={{marginBottom:'5px'}}>Turn off the GPC signal in your chosen browser or extension.</p>
                        <p style={{marginBottom:'5px'}}>Clear your Cookies and Cache and refresh the page.</p>
                         <p>Open the Storefront, then Developer Tools (F12) in Console, and enter:</p>
                         <p style={{ backgroundColor: '#f4f6f8', padding: '10px',marginBottom:'5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px' }}>
                         <span style={{color:'rgb(10,99,85)'}}>navigator</span>.globalPrivacyControl
                        </p>
                        <p>The value should now read <span style={{fontWeight:'750'}}> false </span> or undefined.</p>
                      </div>
                    )}

                    {/* Conditional Image Rendering for Step 4 */}
                    {step === 4 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                        <p style={{fontWeight:'750'}}>Now, Test GPC Integration :</p>
                        <p style={{marginBottom:'5px'}}>If a customer in a “Data sales opt-out” region sends the GPC signal,
                             the following will occur:
                        </p>
                        <p style={{marginBottom:'5px'}}>
                            <span style={{ backgroundColor: 'rgb(229, 231, 235)', padding: '5px',marginBottom:'5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px'}} >sale_of_data</span>
                             will be set to 
                             <span style={{ backgroundColor: 'rgb(229, 231, 235)', padding: '5px',marginBottom:'5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px' }}> false </span> 
                             automatically, while declining other cookie types.
                        </p>
                        <p style={{marginBottom:'5px'}}>To verify, open the Storefront, then Developer Tools (F12) in Console, and enter:</p>
                        <p style={{ backgroundColor: '#f4f6f8', padding: '10px',marginBottom:'5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px' }}>
                        <span style={{color:'rgb(10,99,85)'}}>window.Shopify.customerPrivacy.</span> 
                         <span style={{color:'rgb(130, 80, 223)'}}>currentVisitorConsent();</span>
                        </p>
                        <p>The output should be:</p>
                        <p style={{ backgroundColor: '#f4f6f8', padding: '10px', marginBottom: '5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px' }}>
                            {JSON.stringify({ marketing: 'no', analytics: 'no', preferences: 'no', sale_of_data: 'no', gpc: '' })}
                        </p>
                      </div>
                    )}

                    {/* Conditional Image Rendering for Step 4 */}
                    {step === 5 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                       <p style={{marginBottom:'5px'}}>The cookie banner will not be shown initially. However, visitors can reopen the banner if the reopen feature is enabled.</p>
                       <p>Regardless of how the visitor interacts with the banner, consent will be set to 
                        <span style={{ backgroundColor: 'rgb(229, 231, 235)',marginLeft:'10px', padding: '5px',marginBottom:'5px',marginTop:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px'}} >sale_of_data = false</span>
                        , allowing only necessary cookies.</p>
                      </div>
                    )}

                  </div>
                </Collapsible>
              </div>
            ))}
          </Modal.Section>
        </Modal>
      )}
      </div>
      </Page>
  );
}

export default GridExample;