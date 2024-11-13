import {Page, LegacyCard ,Spinner, Button} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function Checklist() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSetupGCM = () => {
    navigate('/GCM'); 
  };

  const handleSetupindex = () => {
    navigate('/'); 
  };

  const handleSetuptype = () => {
    navigate('/BannerType'); 
  };

  const handleSetupopen = () => {
    navigate('/re-open'); 
  };

  return (
    // loading ? (
    //   <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    //     <Spinner size="large" />
    //   </div>
    // ) : (
    <Page fullWidth>
      <h1 style={{marginLeft:'155px',marginTop:'10px',marginBottom:'30px',fontSize:'20px',fontWeight:'650'}}>GDPR Checklist</h1>
      <div style={{marginLeft:'150px',cursor:'pointer'}}> 
         <div style={{width:'850px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Google Consent mode version 2</p>
            <p style={{}}>Block Google tracking by default until customers give consent.
               Google Consent Mode v2 is mandatory by March 2024 for who use Google tracking services
            </p>
            <div style={{marginTop:'10px'}}><Button variant='primary' onClick={handleSetupGCM}>Setup</Button></div>
          </LegacyCard></div> 
         <div style={{width:'850px',marginTop:'15px'}}>
          <LegacyCard sectioned>
          <p style={{fontWeight:'650',marginBottom:'7px',paddingTop:'5px'}}>Show re-open button</p>
          <p style={{}}>Customers have the right to withdraw their consent at any time. This requirement is outlined in Article 7.3. </p>
          <div style={{marginTop:'10px'}}><Button variant='primary' onClick={handleSetupopen}>Setup</Button></div>
          </LegacyCard></div> 
          <div style={{width:'850px',marginTop:'15px'}}>
          <LegacyCard sectioned>
          <p style={{fontWeight:'650',marginBottom:'7px',paddingTop:'5px'}}>Show privacy policy link</p>
          <p style={{}}>Inform your customers why you’re processing their data. This requirement is outlined in Article 12.</p>
          <div style={{marginTop:'10px'}}><Button variant='primary'>Setup</Button></div>
          </LegacyCard></div> 
          <div style={{width:'850px',marginTop:'15px'}}>
          <LegacyCard sectioned>
          <p style={{fontWeight:'650',marginBottom:'7px',paddingTop:'5px'}}>Show cookie banner</p>
          <p style={{}}>It is required to inform customers about data processing and ask for their consent.
             This requirement is outlined in recital 32.</p>
          <div style={{marginTop:'10px'}}><Button variant='primary' onClick={handleSetupindex}>Setup</Button></div>
          </LegacyCard></div> 
          <div style={{width:'850px',marginTop:'15px'}}>
          <LegacyCard sectioned>
          <p style={{fontWeight:'650',marginBottom:'7px',paddingTop:'5px'}}>Show preferences button</p>
          <p style={{}}>Customers can view details and choose cookie categories to give consent.
             This requirement is outlined in Article 13. </p>
          <div style={{marginTop:'10px'}}><Button variant='primary' onClick={handleSetuptype}>Setup</Button></div>
          </LegacyCard></div> 
      </div>
    </Page>
    // )
  );
}

export default Checklist;