import React, { useState, useEffect} from 'react';
import { Page, ProgressBar, Badge, ChoiceList, Card, TextContainer,Button,ButtonGroup, Banner } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

const CookieBannerSettings = () => {
  const [selectedBanner, setSelectedBanner] = useState('preferences');
  const [shopName, setShopName] = useState('');
  const navigate = useNavigate();
  
  const handleBannerChange = (value) => setSelectedBanner(value);

  useEffect(() => {
    // Function to retrieve or set shop URL
    const getShopUrl = () => {
      // First, check if shop URL is stored in session storage
      let shopUrl = sessionStorage.getItem('shopUrl');

      // If not in session storage, try to extract it from the URL parameters
      if (!shopUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        shopUrl = urlParams.get('shop');
      }

      // If we have a valid shop URL, store it in session storage for future use
      if (shopUrl) {
        sessionStorage.setItem('shopUrl', shopUrl);
      }

      return shopUrl;
    };

    const shopUrl = getShopUrl();

    if (!shopUrl) {
      console.error('Shop URL not found');
      return; // Exit if no shop URL is available
    } else {
      console.log(shopUrl);
    }

    const fetchShopName = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/shop_name/?shop_url=${shopUrl}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.shop_name) {
          // Set the shop name directly from the response
          setShopName(data.shop_name);
        }
      } catch (error) {
        console.error('Error fetching shop name:', error);
      }
    };    

    fetchShopName();
  }, []); // Empty dependency array ensures this runs only on component mount

  return (
    <div style={{boxSizing:'border-box'}}><Page>    
      <h1 style={{ fontSize: '22px', marginLeft: '5px', marginTop: '20px',marginBottom:'40px' }}>
        <b>Welcome {shopName || ''} Admin</b>
      </h1>  
      {/* Cookie Banner Type Selection */}
      <Card>
      <div style={{ marginBottom: '20px' }}>
      <TextContainer variation="strong">Step 2/3</TextContainer>
        <ProgressBar progress={66} size="small" tone='primary' />
      </div>
      <h1 style={{color:'rgb(33, 43, 92)',fontSize:'22px',fontWeight:'700',marginTop:'20px',marginBottom:'15px'}}>Choose type of cookie banner</h1>
      <p style={{marginBottom:'15px'}}>Where do you want to show cookie banner</p>
        <ChoiceList
          choices={[
            {
              label: (
                <>
                  Preferences <Badge tone="attention">Pro</Badge>
                </>
              ),
              value: 'preferences',
              helpText: 'Customize your cookie banner',
            },
            {
              label: 'Accept/Decline',
              value: 'accept-decline',
              helpText: (
                <TextContainer>
                  <p>Allow only necessary cookies at the start.“Accept” &</p>
                  <p style={{marginTop:'-2px'}}>“Decline” buttons</p>
                </TextContainer>
              ),
            },
            {
              label: 'Accept only',
              value: 'accept-only',
              helpText: (
                <TextContainer>
                  <p>Allow only necessary cookies at the start. The only button</p>
                  <p style={{marginTop:'-2px'}}>available is “Accept”</p>
                </TextContainer>
              ),
            },
            {
              label: 'Decline only',
              value: 'decline-only',
              helpText: (
                <TextContainer>
                  <p>Allow all cookies at the start. The only button available is</p>
                  <p style={{marginTop:'-2px'}}>“Decline”</p>
                </TextContainer>
              ),
            },
            {
              label: 'Informative',
              value: 'informative',
              helpText: 'Allow all cookies at all times. Notifications only',
            },
          ]}
          selected={selectedBanner}
          onChange={(selected) => handleBannerChange(selected[0])}
        />
        <div style={{  marginLeft:'50px' ,marginTop:'20px',border: '5px solid #ccc', padding: '10px',backgroundColor:'rgb(145,15,63)',
          fontSize:'13px',width:'800px', textAlign: 'center',borderRadius:'10px',color:'rgb(242,239,221)'}}>
          {selectedBanner === 'preferences' && (
            <ButtonGroup>
            <div style={{backgroundColor:'rgb(242,239,221)',color:'rgb(145,15,63)'}}><Button>Accept</Button></div>
            <div style={{backgroundColor:'rgb(145,15,63)'}}><Button>Reject</Button></div>
            <div style={{color:'rgb(242,239,221)'}}><Button variant="plain">Preferences</Button></div>
          </ButtonGroup>
          )}
          {selectedBanner === 'accept-decline' && (
            <ButtonGroup>
            <div style={{backgroundColor:'rgb(242,239,221)',color:'rgb(145,15,63)'}}></div><Button>Accept</Button>
            <div style={{backgroundColor:'rgb(145,15,63)'}}><Button>Reject</Button></div>
            </ButtonGroup>
          )}
          {selectedBanner === 'accept-only' && (
            <div style={{color:'rgb(145,15,63)'}}><Button>Accept</Button></div>
          )}
          {selectedBanner === 'decline-only' && (
            <div style={{backgroundColor:'rgb(145,15,63)'}}><Button>Reject</Button></div>
          )}
          {selectedBanner === 'informative' && (
            <div>Informative Banner Preview</div>
          )}
        </div>
         <div style={{ marginTop: '20px',marginLeft:'750px',boxSizing:'border-box'}}>
        <ButtonGroup>
          <div style={{marginLeft:'-730px'}}
          onClick={() => navigate('/')}><Button>Back</Button></div>
          <Button variant="plain">Skip</Button>
          <Button variant="primary"
          onClick={() => navigate('/BannerStyle')}>Next step</Button>
        </ButtonGroup>
        </div>
      </Card>
    </Page></div>
  );
};

export default CookieBannerSettings;
