import {Page, Grid, LegacyCard} from '@shopify/polaris';
import React from 'react';

function GridExample() {
  return (
    <Page fullWidth>
      <h1 style={{marginLeft:'155px',marginTop:'10px',marginBottom:'30px',fontSize:'20px',fontWeight:'650'}}>Integration</h1>
      <div style={{marginLeft:'150px',cursor:'pointer'}}> 
         <div style={{width:'450px'}}>
          <LegacyCard sectioned>
          <div style={{marginBottom:'-50px',marginLeft:'-10px'}}><img src='../assets/shopify.png' alt="shopify" width='48px'/></div>
            <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>Shopify Customer Privacy</p>
            <p style={{marginLeft:'50px'}}>Limits Shopify’s tracking of visitors and notifies any third-party apps that you have installed in your 
              store to limit their own tracking.</p>
          </LegacyCard></div> 
         <div style={{width:'450px',marginTop:'-120px',marginLeft:'470px'}}>
          <LegacyCard sectioned>
          <div style={{marginBottom:'-50px',marginLeft:'-5px'}}><img src='../assets/ads.png' alt="shopify" width='40px'/></div>
          <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>Google Ads</p>
          <p style={{marginLeft:'50px'}}>Allows you to manage user consent and customize how Google tracks and uses data,
               ensuring transparency and integration with Google Analytics.</p>
          </LegacyCard></div> 
      </div>

      <div style={{marginLeft:'150px',marginTop:'20px',cursor:'pointer'}}> 
          <div style={{width:'450px'}}><LegacyCard sectioned>
          <div style={{marginBottom:'-50px',marginLeft:'-5px'}}><img src='../assets/gpc.png' alt="shopify" width='40px' /></div>
            <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>Global Privacy Control (GPC)</p>
            <p style={{marginLeft:'50px'}}>Allows you to automatically 
              collect visitor privacy preferences based on their GPC signal.</p>
          </LegacyCard></div>
          <div style={{width:'450px',marginTop:'-93px',marginLeft:'470px'}}>
          <LegacyCard sectioned>
          <div style={{marginBottom:'-50px',marginLeft:'-5px'}}><img src='../assets/meta.png' alt="shopify" width='40px' /></div>
            <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>Meta Pixel</p>
            <p style={{marginLeft:'50px'}}>Allows you to adjust how your Facebook and Instagram track visitors based on
               their consent status.</p>
          </LegacyCard></div>
        </div>

      <div style={{marginLeft:'150px',marginTop:'20px',cursor:'pointer'}}>
          <div style={{width:'450px'}}><LegacyCard sectioned>
            <div style={{marginBottom:'-50px',marginLeft:'-10px'}}><img src='../assets/gc.png' alt="shopify" width='48px' /></div>
            <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>Google Consent Mode V2</p>
            <p style={{marginLeft:'50px'}}>Allows you to adjust how your Google services behave based on the consent status of your visitors.</p>
          </LegacyCard></div>
          <div style={{width:'450px',marginTop:'-100px',marginLeft:'470px'}}>
          <LegacyCard sectioned>
            <div style={{marginBottom:'-50px',marginLeft:'-5px'}}><img src='../assets/tiktok.png' alt="shopify" width='40px' /></div>
            <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>TikTok Pixel</p>
            <p style={{marginLeft:'50px'}}>Allows you to adjust how your TikTok tracks visitors based on their consent status.</p>
          </LegacyCard></div>
      </div>

      <div style={{marginLeft:'150px',marginTop:'20px',cursor:'pointer'}}>
        <div style={{width:'450px'}}>
          <LegacyCard sectioned>
            <div style={{marginBottom:'-50px',marginLeft:'-10px'}}><img src='../assets/hub.webp' alt="shopify" width='55px' /></div>
            <p style={{marginLeft:'50px',fontWeight:'650',marginBottom:'7px'}}>HubSpot</p>
            <p style={{marginLeft:'50px'}}>Allows you to manage consent and automate privacy compliance across your CRM, email marketing,
               and analytics, ensuring adherence to GDPR and other regulations.</p>
          </LegacyCard>
        </div>
      </div>
      
    </Page>
  );
}

export default GridExample;