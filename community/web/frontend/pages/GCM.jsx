import {Page, LegacyCard,Icon, Badge, Banner, Button,Modal, Collapsible} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { useState , useEffect } from 'react';
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
        <img src='../assets/gc.png' alt="shopify" width='40px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>Google Consent Mode V2</b></h1>
      </div>
      <div style={{margin:'auto',cursor:'pointer',maxWidth:'950px'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>Google Consent Mode allows you to adjust how your Google services behave based on the consent status of your visitors.
                 When the initial state is set to block the Analytics or Marketing cookie groups, or the customer opts out,
                  Google’s tags and scripts will not be executed.
                 To integrate with Google Consent Mode V2, you need to follow three steps below.
            </p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'615px',marginTop:'-160px'}}>
         <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with Google Consent Mode V2?"></Banner></div>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'-70px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'15px'}}>
                Step 1 :  Integrate with Google Consent Mode V2
            </p>
            <p style={{marginBottom:'10 px'}}>Adjust the behavior of Google tags based on the consent status provided by visitors</p>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'15px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'15px'}}>
            Step 2 : Test if integration with Google Consent Mode V2 works successfully
            </p>
            <p style={{marginBottom:'10px'}}>Please click the button below for the instructions on how to test Google Consent Mode V2.</p>
            <Button variant="primary"  onClick={toggleModal}>View guide</Button>
          </LegacyCard></div>
          {/* Modal Component */}
          {modalActive && (
        <Modal
          open={modalActive}
          onClose={toggleModal}
          title="How to test if integration with Google Consent Mode works successfully"
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

                  {step === 1 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                        Let's make sure that GTM is working correctly before you integrate it with GCM. This is a crucial step,
                         so please don't skip it!
                      </div>
                    )}

                    {step === 2 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                       <p style={{marginBottom:'5px'}}>Next, on storefront, we're going to open the Developer Tool. You can do this by pressing F12 or Ctrl + Shift + i. 
                        Once you're there, please select the Console tab and type in
                         <span style={{color:'rgb(0, 66, 153)',fontWeight:'650'}}> "dataLayer" </span>.</p>
                         <p>We need to check if the entry is:</p>
                         <p style={{ backgroundColor: '#f4f6f8', padding: '10px',marginBottom:'5px', borderRadius: '5px', fontFamily: 'monospace',fontSize:'12px' }}>
                            {"{"} "consent", "default", {"{"} "ad_storage": "denied", "analytics_storage": "denied" {"}"} {"}"}
                        </p>
                        <p>Here's an image to help you understand better:</p>
                        <img src='../assets/gcm-guide.png' alt="shopify" width='100%' style={{marginTop:'10px'}}/>
                      </div>
                    )}

                    {step === 3 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                        Once you've confirmed that the dataLayer is set correctly, it's time to check your store's cookies.
                         It's important not to set the _ga, _gid, and _gat cookies before the Cookie bar is accepted.
                      </div>
                    )}

                    {step === 4 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                        Now, let's accept the Cookie bar and make sure that the Marketing and Analytics cookie categories are not blocked.
                         Here's an image to guide you:
                         <img src='../assets/gcm-guide-2.png' alt="shopify" width='100%' style={{marginTop:'10px'}}/>
                      </div>
                    )}

                    {step === 5 && (
                      <div style={{ marginTop: '10px',fontSize:'13px' }}>
                       After accepting, let's check if the cookies we mentioned in step 3 (_ga, _gid, and _gat) are set for your store. Also,
                       let's verify if <span style={{color:'rgb(0, 66, 153)',fontWeight:'650'}}> ad_personalization, ad_storage, ad_user_data and analytics_storage </span>
                        are set to granted in the <span style={{color:'rgb(0, 66, 153)',fontWeight:'650'}}> dataLayer </span>,as illustrated in this image:
                        <img src='../assets/gcm-guide-3.png' alt="shopify" width='100%' style={{marginTop:'10px'}}/>
                        <p>
                            Google Consent Mode is essentially an API that we use to transfer consent data to Google Tag Manager.
                            However, we don't have detailed information about the effect of the tag with these settings.
                            We can't comment on how Google Analytics will operate when receiving instructions about Google Consent
                            Mode or speak on behalf of Google about what data will be recorded. This seems arbitrary,
                            but we can't do anything to improve data recording in Google Analytics. Our application scripts only 
                            set and update the corresponding consent status on Google's Tag Manager.
                        </p>
                        <p style={{marginTop:'15px'}}>We hope this guide has been helpful. If you have any questions, please don't hesitate to ask. We're here to help!</p>
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