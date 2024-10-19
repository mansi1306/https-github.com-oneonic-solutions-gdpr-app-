import { Page, LegacyCard, TextContainer, Badge, Banner } from '@shopify/polaris';
import React from 'react';
import { useLocation } from 'react-router-dom';

function GridExample() {
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan; 

  // Calculate subscription details based on the selected plan
  let subscriptionAmount = 0;

  switch (selectedPlan) {
    case 'Basic':
      subscriptionAmount = 1 * 12; // $1 * 12 months
      break;
    case 'Standard':
      subscriptionAmount = 2 * 12; // $2 * 12 months
      break;
    case 'Advanced':
      subscriptionAmount = 3 * 12; // $3 * 12 months
      break;
    default:
      subscriptionAmount = 0; // Default value if no valid plan is selected
  }

  return (
    <Page fullWidth>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', marginLeft: '150px' }}>
        <h1 style={{ fontSize: '20px', paddingLeft: '10px' }}><b>Approve subscription</b></h1>
      </div>
      <div style={{ marginLeft: '150px', cursor: 'pointer' }}> 
        <div style={{ width: '600px' }}>
          <LegacyCard sectioned>
            <h2 style={{ borderBottom: '1px solid gray', paddingBottom: '10px' }}>Plan: {selectedPlan}</h2>
            <TextContainer>
              <h3 style={{marginTop:'10px',marginBottom:'-10px'}}>Subscription details</h3>
              <TextContainer variation="subdued">
                <span aria-hidden="false">${subscriptionAmount.toFixed(2)} USD</span>
                <span> every year</span>
              </TextContainer>
            </TextContainer>
          </LegacyCard>
        </div> 
        <div style={{ width: '350px', marginTop: '-120px', marginLeft: '610px' }}>
          <LegacyCard sectioned>
            <p style={{ fontWeight: '750', marginBottom: '7px', paddingBottom: '10px', borderBottom: '1px solid lightgray' }}>Guide</p>
            <p style={{ paddingBottom: '10px', paddingTop: '10px' }}>Useful links</p>
            <p style={{ paddingBottom: '10px', paddingTop: '10px' }}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{ marginTop: '20px' }}>
              <Banner tone="info" title="Cannot integrate with Shopify Customer Privacy?"></Banner>
            </div>
          </LegacyCard>
        </div> 
      </div>
    </Page>
  );
}

export default GridExample;
