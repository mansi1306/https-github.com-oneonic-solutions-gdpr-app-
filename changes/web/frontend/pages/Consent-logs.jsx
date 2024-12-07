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
      <h1
        style={{
          margin :'auto',
          marginBottom:'20px',
          fontSize: '20px',
          fontWeight: '650',
          maxWidth: '1150px',
        }}
      >
        Consent logs
      </h1>
      <div
        style={{
          display: 'grid', // Use grid to handle responsiveness
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive grid columns
          margin: '0 auto',
          padding: '0 20px',
          maxWidth: '1200px', // Limit max width for larger screens
        }}
      >
        <div style={{ cursor: 'pointer', width: '100%' }}>
          <LegacyCard sectioned>
            <div
              style={{
                marginBottom: '-40px',
                marginLeft: '0px',
                marginTop: '10px',
              }}
            >
              <img src="../assets/88888.png" alt="shopify" width="30px" />
            </div>
            <p style={{ marginLeft: '50px', fontWeight: '750', marginBottom: '7px' }}>
              Policy acceptances
            </p>
            <p style={{ marginLeft: '50px', marginBottom: '30px' }}>
              View all the consents given for your store
            </p>
            <div
              style={{
                marginLeft: '1050px', // Automatically center the button horizontally
                marginTop: '-70px',
                marginBottom: '10px',
              }}
            >
              <Button onClick={handleNavigate1}>View</Button>
            </div>
          </LegacyCard>
        </div>
      </div>
    </Page>    
    )
  );
}

export default GridExample;