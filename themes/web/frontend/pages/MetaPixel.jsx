import {Page, LegacyCard,Icon, Badge, Banner, Button,Modal, Collapsible} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {CaretDownIcon,CaretUpIcon} from '@shopify/polaris-icons';

function GridExample() {
  const navigate = useNavigate();
  const [modalActive, setModalActive] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  const toggleModal = () => setModalActive(!modalActive);

  const handleStepToggle = (step) => {
    setExpandedStep(expandedStep === step ? null : step);
  };
  
  return (
    <Page fullWidth>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px',margin:'20px auto',maxWidth:'1000px',width:'950px',marginLeft:'auto' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
          onClick={() => navigate('/Integrations')}
          aria-label="Go to Integration"
        >
          <Icon source={ArrowLeftIcon} />
        </button>
        <img src='../assets/meta.png' alt="shopify" width='40px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>Meta Pixel</b></h1>
      </div>
      <div style={{margin:'auto',cursor:'pointer',maxWidth:'950px'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>Integrating with Meta Pixel allows you to adjust how your Facebook and Instagram track visitors based on their consent status.
                 When the initial state is set to block the Analytics or Marketing cookie groups, or the visitor opts out
                 , tracking will not be executed. To integrate with Meta Pixel.
            </p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'615px',marginTop:'-140px'}}>
         <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with Meta Pixel?"></Banner></div>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'-70px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Why it's Best</p>
            <p>It collects data on user behavior (such as page views, purchases, and form submissions) and sends this information
                 to Meta for ad targeting and analytics.
                Requires user consent to track personal data, and can be restricted by privacy controls in apps.
                Helps you optimize Facebook and Instagram ads by measuring their performance and adjusting targeting strategies based on user interactions.
            </p>
          </LegacyCard></div> 
      </div>
      </Page>
  );
}

export default GridExample;