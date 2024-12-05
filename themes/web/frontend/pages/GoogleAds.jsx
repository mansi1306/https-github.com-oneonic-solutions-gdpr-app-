import {Page, LegacyCard,Icon, Badge, Banner} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

function GridExample() {
  const navigate = useNavigate();
  
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
        <img src='../assets/ads.png' alt="shopify" width='35px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>Google Ads</b></h1>
      </div>
      <div style={{margin:'auto',cursor:'pointer',maxWidth:'950px'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>Google Ads enables businesses to reconnect with users who have previously interacted with their website or app through
                 remarketing campaigns. This feature helps reinforce brand awareness and encourage conversions by showing tailored ads
                  to these users.
            </p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'615px',marginTop:'-120px'}}>
         <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with Google Ads?"></Banner></div>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'-90px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Why it's Best</p>
            <p>Google Ads has robust features for user consent management
                and integrates well with Google Analytics. It provides transparency in data 
                collection and allows for customization of how data is used. The 
                platform also offers tools to help you manage privacy settings effectively.
            </p>
          </LegacyCard></div> 
      </div>
      </Page>
  );
}

export default GridExample;