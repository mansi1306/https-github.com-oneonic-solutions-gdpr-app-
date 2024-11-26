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
        <img src='../assets/shopify.png' alt="shopify" width='35px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>Shopify Customer Privacy</b></h1>
      </div>
      <div style={{marginLeft:'150px',cursor:'pointer'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>Shopify Customer Privacy limits Shopify’s tracking of online store customers and notifies any third-party apps that you have
               installed in your store to limit their own tracking.This Customer Privacy API has been integrated into our
                Our Cookie Consent app.</p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'610px'}}>
          <LegacyCard sectioned>
          <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
          <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
          <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
          <Badge>Cookie Integrations</Badge>
          <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with Shopify Customer Privacy?"></Banner></div>
          </LegacyCard></div> 
      </div>
      </Page>
  );
}

export default GridExample;