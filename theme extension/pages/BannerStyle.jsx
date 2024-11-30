    import React, { useState, useEffect } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import {
    Page,
    Card,
    Text,
    ProgressBar,
    TextContainer,
    ButtonGroup,
    Button,
    } from '@shopify/polaris';

    const ThemeSelector = () => {
    const [shopName, setShopName] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const navigate = useNavigate();

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

        const fetchShopName = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/shopify_app/shop_name/?shop_url=${shopUrl}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.shop_name) {
            setShopName(data.shop_name);
            }
        } catch (error) {
            console.error('Error fetching shop name:', error);
        }
        };

        fetchShopName();
    }, []);

    const themes = [
        { label: 'Basic', color: 'rgb(26, 172, 122)', background: 'rgb(248, 248, 248)' },
        { label: 'Light theme', color: 'rgb(0, 0, 0)', background: 'rgb(248, 248, 248)' },
        { label: 'Sense', color: 'rgb(63, 67, 48)', background: 'rgb(255, 220, 194)' },
        { label: 'Golden', color: 'rgb(242, 194, 50)', background: 'rgb(29, 29, 29)' },
        { label: 'Christmas', color: 'rgb(248, 248, 248)', background: 'rgb(22, 91, 51)' },
        { label: 'Neumorphism', color: 'rgb(130, 130, 130)', background: 'rgb(248, 248, 248)' },
        { label: 'Elegant', color: 'rgb(163, 128, 100)', background: 'rgb(246, 239, 235)' },
        { label: 'Dark theme', color: 'rgb(248, 248, 248)', background: 'rgb(16, 24, 47)' },
        { label: 'Autumn', color: 'rgb(163, 72, 0)', background: 'rgb(238, 179, 99)' },
        { label: 'Crave', color: 'rgb(242, 239, 221)', background: 'rgb(145, 15, 63)' },
    ];

    const handleThemeClick = (theme) => {
        setSelectedTheme(theme.label);
        console.log(`Selected theme: ${theme.label}`);
        // Add your theme selection logic here

        if (theme.label === 'Basic' || theme.label === 'Light theme' || theme.label === 'Sense' || theme.label === 'Golden'|| 
            theme.label === 'Christmas' || theme.label === 'Neumorphism' || theme.label === 'Elegant' || theme.label === 'Dark theme' ||
            theme.label === 'Autumn' || theme.label === 'Crave') {
            setShowCookieConsent(true);
        } else {
            setShowCookieConsent(false); // Hide the box for other themes
        }
    };

    const handleFinishClick = async () => {

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

        if (selectedTheme) {
          try {
              console.log('Shop URL from sessionStorage:', shopUrl);
              const response = await fetch(`http://127.0.0.1:8000/shopify_app/save_theme/?shop_url=${shopUrl}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
              },
              body: JSON.stringify({
                shop_url: shopUrl,
                theme_label: selectedTheme,
              }),
            });
            if (!response.ok) throw new Error('Error saving theme');
    
            const data = await response.json();
            console.log('Theme saved successfully:', data);
            navigate('/MonthPlan'); // Redirect after saving
          } catch (error) {
            console.error('Error saving theme:', error);
          }
        }
      };
    
      const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + '=') {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      };

    const getBannerColor = () => {
        switch (selectedTheme) {
        case 'Basic':
            return 'rgb(248, 248, 248)'; // Green for Basic theme
        case 'Light theme':
            return 'rgb(248, 248, 248)'; // Black for Light theme
        case 'Sense':
            return 'rgb(255, 220, 194)'; // Dark grey for Sense
        case 'Golden':
            return 'rgb(29, 29, 29)'; // Gold for Golden
        case 'Christmas':
            return 'rgb(22, 91, 51)'; // Dark green for Christmas
        case 'Neumorphism':
            return 'rgb(248, 248, 248)'; // Grey for Neumorphism
        case 'Elegant':
            return 'rgb(246, 239, 235)'; // Brown for Elegant
        case 'Dark theme':
            return 'rgb(16, 24, 47)'; // Dark grey for Dark theme
        case 'Autumn':
            return 'rgb(238, 179, 99)'; // Orange for Autumn
        case 'Crave':
            return 'rgb(145, 15, 63)'; // Dark red for Crave
        default:
            return 'transparent'; // Default color
        }
    };

    return (
        <div style={{}}>
        <Page>
        <h1 style={{ fontSize: '22px', marginLeft: '5px', marginTop: '20px', marginBottom: '40px' }}>
            <b>Welcome {shopName || ''} Admin</b>
        </h1>
        <Card>
            <div style={{ marginBottom: '20px',marginLeft:'12px',marginRight:'15px'}}>
            <TextContainer variation="strong">Step 3/3</TextContainer>
            <ProgressBar progress={100} size="small" tone="primary" />
            </div>
            <h1 style={{ color: 'rgb(33, 43, 92)', fontSize: '22px', fontWeight: '700', marginTop: '20px', marginBottom: '15px', marginLeft:'12px',marginRight:'15px'}}>
            Choose style of cookie banner
            </h1>
            <p style={{ marginBottom: '15px', marginLeft:'12px',marginRight:'15px' }}>Design your cookie banner’s look</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
            {themes.map((theme, index) => (
                <div key={index} style={{ width: '47%', marginBottom: '20px',outline: `1px solid ${selectedTheme === theme.label ? 'black' : 'lightgray'}`,padding:'6px',borderRadius:'5px',marginLeft:'12px',marginRight:'15px'}}>
                <div
                    style={{
                    outline: '1px solid lightgray',
                    padding: '7px',
                    borderRadius: '5px',
                    textAlign: 'center',
                    backgroundColor: theme.background,
                    color: theme.color,
                    cursor: 'pointer',
                    width:'100%',
                    }}
                    onClick={() => handleThemeClick(theme)}
                >
                <Text variation="strong">{theme.label}</Text>
                </div>
                </div>
            ))}
            </div>

            {showCookieConsent && selectedTheme && ( // Render cookie consent box if showCookieConsent is true and selectedTheme is defined
                <div
                    style={{
                    marginTop: '20px',
                    border: '1px solid gray',
                    borderRadius: '5px',
                    backgroundColor: getBannerColor(),
                    width:'700px',
                    marginLeft:'12px'
                    }}
                >
                {selectedTheme === 'Basic' && (
                    <div> <img src='../assets/cg.png' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/green.png' alt="Cookie" width='45px' style={{ marginTop: '-30px',marginBottom:'-10px',marginLeft:'5px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-40px' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'rgb(26, 172, 122)',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',border:'1px solid black',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Light theme' && (
                    <div> <img src='../assets/blcak.png' alt="close" width='25px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/cc.png' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-5px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-40px' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{border:'1px solid black',backgroundColor:'black',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',border:'1px solid black',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Sense' && (
                    <div> <img src='../assets/blcak.png' alt="close" width='25px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/cc.png' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-5px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-40px'}}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'rgb(185, 219, 47)',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{border:'1px solid black',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Golden' && (
                    <div> <img src='../assets/ye.webp' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/cc.webp' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-10px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-30px', color:'white' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'rgb(242, 194, 50)',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{border:'1px solid white',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Christmas' && (
                    <div> <img src='../assets/11.png' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/456.png' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-10px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-30px', color:'white' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline',color:'rgb(242, 194, 50)' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'red',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{border:'1px solid white',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Neumorphism' && (
                    <div> <img src='../assets/grac.png' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/gray.png' alt="Cookie" width='42px' style={{ marginTop: '-30px',marginBottom:'-5px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-40px' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline',fontWeight:650 }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{border:'1px solid black',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'20px'}}>Accept</div>
                            <div style={{padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Elegant' && (
                    <div> <img src='../assets/br.svg' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/brown.avif' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-5px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-40px' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'rgb(163, 128, 100)',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',border:'1px solid black',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Dark theme' && (
                    <div> <img src='../assets/11.png' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/456.png' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-10px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-30px', color:'white' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline',color:'white' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{border:'1px solid white',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Autumn' && (
                    <div> <img src='../assets/br.svg' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/brown.avif' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-10px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-30px', color:'rgb(163, 72, 0)' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline',color:'rgb(163, 72, 0)' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'rgb(163, 72, 0)',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{border:'1px solid rgb(163, 72, 0)',color:'rgb(163, 72, 0)',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                {selectedTheme === 'Crave' && (
                    <div> <img src='../assets/11.png' alt="close" width='20px' style={{ marginLeft: '660px',paddingTop:'15px'}} />
                    <img src='../assets/456.png' alt="Cookie" width='38px' style={{ marginTop: '-30px',marginBottom:'-10px',marginLeft:'9px' }} />
                        <p style={{ fontSize: '15px',marginLeft:'55px',lineHeight:'30px',marginTop:'-30px', color:'white' }}>
                        <h3 style={{fontWeight:750}}>We keep your privacy</h3>
                        This website uses cookies to make sure you get the best experience with us. <span style={{ textDecoration: 'underline',color:'white' }}>Privacy Policy</span>
                        </p>
                        <div style={{ marginTop: '10px', marginLeft: '50px',marginBottom:'20px'}}>
                        <ButtonGroup>
                            <div style={{backgroundColor:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px'}}>Accept</div>
                            <div style={{border:'1px solid white',color:'white',padding:'8px 20px 10px 20px',alignItems:'center',borderRadius:'10px',marginLeft:'5px'}}>Reject</div>
                        </ButtonGroup>
                        </div></div>
                )}
                </div>
                )}


            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonGroup>
                <Button onClick={() => navigate('/BannerType')}>Back</Button>
                <Button variant="primary" onClick={handleFinishClick}>Finish</Button>
            </ButtonGroup>
            </div>
        </Card>
        </Page></div>
    );
    };

    export default ThemeSelector;
