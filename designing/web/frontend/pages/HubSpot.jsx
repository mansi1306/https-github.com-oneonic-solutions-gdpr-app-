import {Page, LegacyCard,Icon, Badge, Banner} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

function GridExample() {
  const navigate = useNavigate();
  
  return (
    <Page fullWidth>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px',marginLeft:'150px',marginTop:'20px' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
          onClick={() => navigate('/Integrations')}
          aria-label="Go to Integration"
        >
          <Icon source={ArrowLeftIcon} />
        </button>
        <img src='../assets/hub.webp' alt="shopify" width='45px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>HubSpot</b></h1>
      </div>
      <div style={{marginLeft:'150px',cursor:'pointer'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>HubSpot offers a powerful CRM that helps businesses manage their contacts, track interactions, and
                 maintain a detailed history of customer relationships. It’s user-friendly and can be customized to fit various
                  business needs.
            </p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'615px',marginTop:'-120px'}}>
         <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with HubSpot?"></Banner></div>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'-90px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Why it's Best</p>
            <p>HubSpot provides a comprehensive platform that includes features for CRM, 
                email marketing, content management, and analytics. It has built-in tools to manage
                consent and automate privacy compliance, making it easier to handle user data responsibly.
                Their privacy and security settings help ensure compliance with GDPR and other regulations.
            </p>
          </LegacyCard></div> 
      </div>
      </Page>
  );
}

export default GridExample;