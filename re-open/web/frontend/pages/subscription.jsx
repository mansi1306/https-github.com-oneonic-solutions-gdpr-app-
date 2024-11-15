import { Page, LegacyCard, TextContainer, Badge, Banner } from '@shopify/polaris';
import React from 'react';
import { useLocation } from 'react-router-dom';

function GridExample() {
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan; 

  // Calculate subscription details based on the selected plan
  let subscriptionAmount = 0;
  let planDetails = '';

  switch (selectedPlan) {
    case 'Basic':
      subscriptionAmount = 1;
      planDetails = 'Basic plan includes UNLIMITED IMPRESSIONS, Google Consent Mode V2, Cookie Banner creation, Global Privacy Control (GPC), and more.';
      break;
    case 'Standard':
      subscriptionAmount = 2;
      planDetails = 'Standard plan includes everything in Basic, plus Advanced Cookie Scanner, Auto-transfer Cookie, GDPR Checklist, and more.';
      break;
    case 'Advanced':
      subscriptionAmount = 3;
      planDetails = 'Advanced plan includes everything in Standard, plus Dynamic Cookie Banner, Auto-Create Consent, Premium Support, and more.';
      break;
    default:
      planDetails = 'No plan selected';
  }

  return (
    <Page title="Subscription Details">
      {selectedPlan ? (
        <LegacyCard title={`Selected Plan: ${selectedPlan}`} sectioned>
          <TextContainer>
            <Badge status="success">{selectedPlan}</Badge>
            <p>Subscription Amount: ${subscriptionAmount}/month</p>
            <p>{planDetails}</p>
            <Banner title="Start your 7-day FREE trial!" status="info">
              <p>Your trial will start immediately after subscribing to the {selectedPlan} plan.</p>
            </Banner>
          </TextContainer>
        </LegacyCard>
      ) : (
        <Banner title="No Plan Selected" status="warning">
          <p>Please go back and select a plan to view subscription details.</p>
        </Banner>
      )}
    </Page>
  );
}

export default GridExample;
