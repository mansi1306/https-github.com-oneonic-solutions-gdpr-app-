import {Page, LegacyCard,Icon, Badge, Banner} from '@shopify/polaris';
import React from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

function GridExample() {
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <div style={{ display: 'flex', alignItems: 'center', margin :'20px auto',marginBottom:'20px',marginLeft:'auto',
          fontSize: '20px',
          fontWeight: '650',
          Width: '950px',
          maxWidth:'970px'  }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
          onClick={() => navigate('/Integrations')}
          aria-label="Go to Integration"
        >
          <Icon source={ArrowLeftIcon} />
        </button>
        <img src='../assets/shopify.png' alt="shopify" width='35px'/>
        <h1 style={{ fontSize: '20px',paddingLeft:'10px' }}><b>Shopify Customer Privacy</b></h1>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          marginLeft: "20px", // Reduce fixed spacing for responsiveness
          marginRight: "20px",
          cursor: "pointer",
        }}
      >
        {/* Introduction Card */}
        <div style={{ flex: "1 1 600px", maxWidth: "600px", minWidth: "300px" }}>
          <LegacyCard sectioned>
            <p style={{ fontWeight: "650", marginBottom: "7px" }}>Introduction</p>
            <p>
              Shopify Customer Privacy limits Shopify’s tracking of online store
              customers and notifies any third-party apps that you have installed in
              your store to limit their own tracking. This Customer Privacy API has
              been integrated into our Cookie Consent app.
            </p>
          </LegacyCard>
        </div>

        {/* Guide Card */}
        <div style={{ flex: "1 1 350px", maxWidth: "350px", minWidth: "300px" }}>
          <LegacyCard sectioned>
            <p
              style={{
                fontWeight: "750",
                marginBottom: "7px",
                paddingBottom: "10px",
                borderBottom: "1px solid lightgray",
              }}
            >
              Guide
            </p>
            <p style={{ paddingBottom: "10px", paddingTop: "10px" }}>Useful links</p>
            <p style={{ paddingBottom: "10px", paddingTop: "10px" }}>Category</p>
            <Badge>Cookie Integrations</Badge>
            <div style={{ marginTop: "20px" }}>
              <Banner tone="info" title="Cannot integrate with Shopify Customer Privacy?" />
            </div>
          </LegacyCard>
        </div>
      </div>

      </Page>
  );
}

export default GridExample;