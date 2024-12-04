import { Page, Card, Button, Layout, ButtonGroup, Badge, Text } from '@shopify/polaris';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PricingTable() {
  const [selectedOption, setSelectedOption] = useState('monthly');
  const navigate = useNavigate();

  return (
    <Page>
        <h1 style={{fontSize:'20px',fontWeight:'700',marginLeft:'280px',marginTop:'10px'}}>Select your plan now for an exclusive deal</h1>
        <h1 style={{fontSize:'20px',fontWeight:'700',marginLeft:'330px',marginTop:'10px',color:'rgb(33, 43, 92)',marginBottom:'30px'}}>only in this onboarding session</h1>
        <ButtonGroup segmented>
            <div style={{width:'250px',marginLeft:'220px',marginBottom:'20px'}}><Button fullWidth
              pressed={selectedOption === 'monthly'}
              onClick={() => navigate('/MonthPlan')}
            >
              Monthly
            </Button></div>
            <div style={{width:'250px',marginBottom:'20px'}}><Button fullWidth
              pressed={selectedOption === 'yearly'}
              onClick={() => navigate('/YearPlan')}
            >
              Yearly(Save up to $119.00)
            </Button></div>
          </ButtonGroup>
      <Layout>
        <Layout distribution="equalSpacing">
            <div style={{width:'230px',height:'200px',marginTop:'50px',marginLeft:'10px'}}>
          <Card sectioned>
            <Layout vertical>
            <img src='../assets/free.png' alt="Plan icon" width='55px' style={{marginRight:'120px',paddingTop:'20px'}}  /><br></br>
            <h1 style={{marginLeft:'-30px',marginRight:'90px',fontSize:'20px',fontWeight:'650',marginTop:'10px'}}>Free</h1>
              <p style={{marginTop:'20px',marginLeft:'10px',fontWeight:'650',marginRight:'130px'}}>
                <span style={{fontSize:'30px'}}>$</span>
                    <span style={{fontSize:'30px'}}>0</span>
            </p>
              <div style={{marginTop:'10px',marginRight:'130px'}}><Text>Free</Text></div>
              <div style={{width:'250px',marginLeft:'10px',marginTop:'10px',height:'50px'}}><Button fullWidth>Get started</Button></div>
              <Layout vertical spacing="tight">
                <div style={{marginRight:'110px',marginBottom:'-10px',marginTop:'10px'}}>Includes:</div>
                <ul style={{ listStyleType: 'none', padding: 0 ,lineHeight:'30px' }}>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    UNLIMITED IMPRESSIONS
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    FREE Cookie Banner creation
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Auto-scan store's cookies
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Customer Data request
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Data sales opt-out
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Tracking consent
                  </li>
                </ul>
              </Layout>
            </Layout>
          </Card></div>

          <div style={{width:'230px',height:'200px',marginTop:'50px',marginLeft:'10px'}}><Card sectioned>
            <Layout vertical>
            <img src='../assets/120.png' alt="Plan icon" width='55px' style={{marginRight:'120px',paddingTop:'20px'}}  />
            <h1 style={{marginLeft:'50px',marginRight:'90px',fontSize:'20px',fontWeight:'650',marginTop:'10px'}}>Professional</h1>
            <p style={{marginTop:'-20px',marginLeft:'150px'}}><Badge tone="success">50% off</Badge></p>
            <p style={{marginTop:'20px',marginLeft:'100px',fontWeight:'650',marginRight:'130px'}}>
                <span style={{fontSize:'30px'}}>$</span>
                    <span style={{fontSize:'30px'}}>4.98</span>
                    <span>/month</span>
            </p>
            <div style={{marginTop:'10px'}}><Text>First 3 months, then $9.95/mo</Text></div>
            <div style={{width:'250px',marginLeft:'10px',marginTop:'10px',height:'50px'}}><Button fullWidth>Start 7-day FREE trial</Button></div>
              <Layout vertical spacing="tight">
              <div style={{marginRight:'70px',marginBottom:'-10px',marginTop:'10px'}}>All in Free, plus:</div>
              <ul style={{ listStyleType: 'none', padding: 0 ,lineHeight:'30px' }}>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    UNLIMITED IMPRESSIONS
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Google Consent Mode V2
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Custom Preferences page
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Global Privacy Control (GPC)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Auto block tracking script
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Re-open Cookie banner
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    2 banner languages
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Cookie management
                  </li>
                </ul>
              </Layout>
            </Layout>
          </Card></div>

          <div style={{width:'230px',height:'200px',marginTop:'50px',marginLeft:'10px'}}><div style={{border:'2px solid rgb(33, 43, 92)',borderRadius:'10px'}}><Card sectioned>
            <Layout vertical>
            <img src='../assets/advanced.png' alt="Plan icon" width='55px' style={{marginRight:'120px',paddingTop:'20px'}} />
            <h1 style={{marginLeft:'30px',marginRight:'90px',fontSize:'20px',fontWeight:'650',marginTop:'10px'}}>Advanced</h1>
            <p style={{marginTop:'-20px',marginLeft:'120px'}}><Badge tone="success">50% off</Badge></p>
            <p style={{marginTop:'-90px',marginLeft:'120px'}}><Badge tone="info">Best for you</Badge></p>
            <p style={{marginTop:'20px',marginLeft:'100px',fontWeight:'650',marginRight:'130px'}}>
                <span style={{fontSize:'30px'}}>$</span>
                    <span style={{fontSize:'30px'}}>11.98</span>
                    <span>/month</span>
            </p>
            <div style={{marginTop:'10px'}}><Text>First 3 months, then $23.95/mo</Text></div>
            <div style={{width:'250px',marginLeft:'10px',marginTop:'10px',height:'50px'}}><Button fullWidth variant='primary'>Start 7-day FREE trial</Button></div>
              <Layout vertical spacing="tight">
              <div style={{marginRight:'20px',marginBottom:'-10px',marginTop:'10px'}}>All in Professional, plus:</div>
              <ul style={{ listStyleType: 'none', padding: 0 ,lineHeight:'30px' }}>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    UNLIMITED IMPRESSIONS
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Advanced cookie scanner
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Auto-transfer Cookie
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Scheduled Cookie scanning
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Unlimited banner languages
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Custom email display
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Consent logs
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Reset given consents
                  </li>
                  </ul>
              </Layout>
            </Layout>
          </Card></div></div>

          <div style={{width:'230px',height:'200px',marginTop:'50px',marginLeft:'10px'}}><Card>
            <Layout vertical>
            <img src='../assets/130.png' alt="Plan icon" width='55px' style={{marginRight:'120px',paddingTop:'20px'}} />
            <h1 style={{marginLeft:'30px',marginRight:'90px',fontSize:'20px',fontWeight:'650',marginTop:'10px'}}>Enterprise</h1>
            <p style={{marginTop:'-20px',marginLeft:'120px'}}><Badge tone="success">50% off</Badge></p>
            <p style={{marginTop:'20px',marginLeft:'100px',fontWeight:'650',marginRight:'130px'}}>
                <span style={{fontSize:'30px'}}>$</span>
                    <span style={{fontSize:'30px'}}>17.00</span>
                    <span>/month</span>
            </p>
            <div style={{marginTop:'10px'}}><Text>First 3 months, then $34/mo</Text></div>
            <div style={{width:'250px',marginLeft:'10px',marginTop:'10px',height:'50px'}}><Button fullWidth>Start 7-day FREE trial</Button></div>
              <Layout vertical spacing="tight">
              <div style={{marginRight:'40px',marginBottom:'-10px',marginTop:'10px'}}>All in Advanced, plus:</div>
              <ul style={{ listStyleType: 'none', padding: 0 ,lineHeight:'30px' }}>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    UNLIMITED IMPRESSIONS
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Checkout banner block
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Auto-fit branding theme
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <img src='../assets/99.png' alt="Plan icon" width="25px" style={{marginLeft:'20px'}} />
                    Highest priority support
                  </li>
                  </ul>
              </Layout>
            </Layout>
          </Card></div>
        </Layout>
      </Layout>
    </Page>
  );
}

export default PricingTable;
