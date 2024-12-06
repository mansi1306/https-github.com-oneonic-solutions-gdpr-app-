import React, { useState, useEffect} from 'react';
import { Page, ProgressBar, Badge, ChoiceList, Card, TextContainer,Button,ButtonGroup,Icon } from '@shopify/polaris';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

const CookieBannerSettings = () => {
  const [selectedBanner, setSelectedBanner] = useState('preferences');
  const [shopName, setShopName] = useState('');
  const navigate = useNavigate();
  
  const handleBannerChange = (value) => setSelectedBanner(value);


  useEffect(() => {
    const getShopUrl = () => {
      let shopUrl = sessionStorage.getItem('shopUrl');

      if (!shopUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        shopUrl = urlParams.get('shop');
      }

      if (shopUrl) {
        sessionStorage.setItem('shopUrl', shopUrl);
      }

      return shopUrl;
    };

    const shopUrl = getShopUrl();

    if (!shopUrl) {
      console.error('Shop URL not found');
      return; 
    } else {
      console.log(shopUrl);
    }

    const fetchShopData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_store_data/?shop_url=${shopUrl}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.banner_type) {
          setSelectedBanner(data.banner_type); // Set the selected banner type from the backend
        }

        if (data.shop_name) {
          setShopName(data.shop_name);
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };

    fetchShopData();
  }, []);

  const handleFinishClick = async () => {
    const getShopUrl = () => {
      let shopUrl = sessionStorage.getItem('shopUrl');

      if (!shopUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        shopUrl = urlParams.get('shop');
      }

      if (shopUrl) {
        sessionStorage.setItem('shopUrl', shopUrl);
      }

      return shopUrl;
    };

    const shopUrl = getShopUrl();

    if (!shopUrl) {
      console.error('Shop URL not found');
      return;
    } else {
      console.log(shopUrl);
    }

    try {
      console.log('Shop URL from sessionStorage:', shopUrl);
      const response = await fetch(`http://127.0.0.1:8000/shopify_app/save_banner_type/?shop_url=${shopUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_url: shopUrl,
          banner_type: selectedBanner,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Banner type saved:', data.message);

      navigate('/BannerStyle');
    } catch (error) {
      console.error('Error saving banner type:', error);
    }
  };

  return (
    <div style={{boxSizing:'border-box'}}><Page>    
      <button
            style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '0px',
            marginBottom: '-30px',
            marginTop: '20px',
            }}
            onClick={() => navigate('/BannerRegion')}
            aria-label="Go to checklist"
        >
            <Icon source={ArrowLeftIcon} />
        </button>
        <h1
            style={{
            marginLeft: '50px',
            marginTop: '10px',
            marginBottom: '30px',
            fontSize: '20px',
            fontWeight: '650',
            }}
        >
            Banner Behavior
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
          fontSize:'13px',width:'800px', textAlign: 'center',borderRadius:'10px',color:'rgb(242,239,221)',height:'160px'}}>
          {selectedBanner === 'preferences' && (
            <div> <img src='../assets/11.png' alt="close" width='20px' style={{marginLeft:'740px'}} />
             <img src='../assets/456.png' alt="Cookie" width='40px' style={{marginTop:'-20px'}} />
             <p style={{fontSize:'15px'}}>This website uses cookies to make sure you get the best experience with us. <span style={{textDecoration:'underline'}}>Privacy Policy</span> </p>
            <div style={{marginTop:'20px',marginLeft:'300px'}}><ButtonGroup>
            <div><Button>Accept</Button></div>
            <div><Button>Reject</Button></div>
            <div><Button variant="plain">Preferences</Button></div>
          </ButtonGroup></div></div>
          )}
          {selectedBanner === 'accept-decline' && (
            <div> <img src='../assets/11.png' alt="close" width='20px' style={{marginLeft:'740px'}} />
            <img src='../assets/456.png' alt="Cookie" width='40px' style={{marginTop:'-20px'}} />
            <p style={{fontSize:'15px'}}>This website uses cookies to make sure you get the best experience with us. <span style={{textDecoration:'underline'}}>Privacy Policy</span> </p>
            <div style={{marginTop:'20px',marginLeft:'320px'}}><ButtonGroup>
            <div></div><Button>Accept</Button>
            <div><Button>Reject</Button></div>
            </ButtonGroup></div></div>
          )}
          {selectedBanner === 'accept-only' && (
            <div> <img src='../assets/11.png' alt="close" width='20px' style={{marginLeft:'740px'}} />
            <img src='../assets/456.png' alt="Cookie" width='40px' style={{marginTop:'-20px'}} />
            <p style={{fontSize:'15px'}}>This website uses cookies to make sure you get the best experience with us. <span style={{textDecoration:'underline'}}>Privacy Policy</span> </p>
            <div style={{marginTop:'20px'}}><Button>Accept</Button></div></div>
          )}
          {selectedBanner === 'decline-only' && (
            <div> <img src='../assets/11.png' alt="close" width='20px' style={{marginLeft:'740px'}} />
            <img src='../assets/456.png' alt="Cookie" width='40px' style={{marginTop:'-20px'}} />
            <p style={{fontSize:'15px'}}>This website uses cookies to make sure you get the best experience with us. <span style={{textDecoration:'underline'}}>Privacy Policy</span> </p>
            <div style={{marginTop:'20px'}}><Button>Reject</Button></div></div>
          )}
          {selectedBanner === 'informative' && (
            <div> <img src='../assets/11.png' alt="close" width='20px' style={{marginLeft:'740px'}} />
            <img src='../assets/456.png' alt="Cookie" width='40px' style={{marginBottom:'10px'}} />
            <p style={{fontSize:'15px'}}>This website uses cookies to make sure you get the best experience with us. <span style={{textDecoration:'underline'}}>Privacy Policy</span> </p>
            <div style={{marginTop:'20px',marginLeft:'300px'}}></div></div>
          )}
        </div>
         <div style={{ marginTop: '20px',marginLeft:'820px',boxSizing:'border-box'}}>
        <ButtonGroup>
          <div style={{marginLeft:'-820px'}}
          onClick={() => navigate('/')}><Button>Back</Button></div>
          <Button variant="primary"
           onClick={handleFinishClick}>Next step</Button>
        </ButtonGroup>
        </div>
      </Card>
    </Page></div>
  );
};

export default CookieBannerSettings;
