import {Page, LegacyCard,Icon, Badge, Banner} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function GridExample() {
  const navigate = useNavigate();
  
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px',margin:'20px auto',maxWidth:'1000px',width:'950px', }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
          onClick={() => navigate('/Integrations')}
          aria-label="Go to Integration"
        >
          <Icon source={ArrowLeftIcon} />
        </button>
        <img src='../assets/tiktok.png' alt="shopify" width='35px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>TikTok Pixel</b></h1>
      </div>
      <div style={{margin:'auto',cursor:'pointer',maxWidth:'950px'}}> 
         <div style={{width:'600px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Introduction</p>
            <p>Integrating with TikTok Pixel allows you to adjust how your TikTok tracks visitors based on their consent status.
                When the initial state is set to block the Analytics or Marketing cookie groups, or the visitor opts out,
                tracking will not be executed. To integrate with TikTok Pixel.
            </p>
          </LegacyCard></div> 
         <div style={{width:'350px',marginTop:'-120px',marginLeft:'615px',marginTop:'-120px'}}>
         <LegacyCard sectioned>
            <p style={{fontWeight:'750',marginBottom:'7px',paddingBottom:'10px',borderBottom:'1px solid lightgray'}}>Guide</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Useful links</p>
            <p style={{paddingBottom:'10px',paddingTop:'10px'}}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{marginTop:'20px'}}><Banner tone="info" title="Cannot integrate with TikTok Pixel?"></Banner></div>
          </LegacyCard></div> 
          <div style={{width:'600px',marginTop:'-90px'}}>
          <LegacyCard sectioned>
            <p style={{fontWeight:'650',marginBottom:'7px'}}>Why it's Best</p>
            <p>Allows you to track events like page views, add to cart, and purchases made by users who click on your TikTok ads.
            With TikTok Pixel installed, you can create better-targeted TikTok ad campaigns by analyzing how users interact with
            your store after clicking on your ads.
            Consent-based tracking is required, and it will be limited based on user preferences set in a cookie banner or other privacy tools.
            </p>
          </LegacyCard></div> 
      </div>
      </Page>
  );
}

export default GridExample;