import {Page, LegacyCard ,Spinner, Icon, Button} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function GridExample() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setLoading(false);
    };

    loadData();
  }, []);

  const handleNavigate1 = () => {
    navigate('/Policy-acceptances');  // Programmatically navigate to the '/BannerRegion' page
  };

  return (
    loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" />
      </div>
    ) : (
    <Page fullWidth>
      <h1 style={{marginLeft:'155px',marginTop:'10px',marginBottom:'30px',fontSize:'20px',fontWeight:'650'}}>Consent logs</h1>
      <div style={{marginLeft:'150px',cursor:'pointer'}}> 
         <div style={{width:'950px'}}>
          <LegacyCard sectioned>
          <div style={{marginBottom:'-40px',marginLeft:'0px',marginTop:'10px'}}><img src='../assets/88888.png' alt="shopify" width='30px'/></div>
            <p style={{marginLeft:'50px',fontWeight:'750',marginBottom:'7px'}}>Policy acceptances</p>
            <p style={{marginLeft:'50px',marginBottom:'30px'}}>View all the consents given for your store</p>
            <div style={{marginLeft:'850px',marginTop:'-70px',marginBottom:'10px'}}><Button onClick={handleNavigate1}>view</Button></div>
          </LegacyCard></div> 
      </div>


    </Page>
    )
  );
}

export default GridExample;