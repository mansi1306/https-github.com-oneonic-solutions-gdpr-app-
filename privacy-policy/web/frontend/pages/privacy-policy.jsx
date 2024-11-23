import { Page, LegacyCard, Button, Checkbox, TextField, ChoiceList, Select } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback } from 'react';

function Checklist() {
  const [showGooglePrivacyPolicy, setShowGooglePrivacyPolicy] = useState(false);
  const [showPrivacyPolicyLink, setShowPrivacyPolicyLink] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(['Use specific Privacy Policy']);
  const [selectedOption, setSelectedOption] = useState('Shopify Policy (/policies/privacy-policy)');
  const navigate = useNavigate();

  // Fetch shop subdomain from session storage or URL parameters
const getShopSubdomain = () => {
  let shopUrl = sessionStorage.getItem('shopUrl');
  if (!shopUrl) {
    const urlParams = new URLSearchParams(window.location.search);
    shopUrl = urlParams.get('shop');
  }
  
  // Ensure we only keep the shop subdomain (e.g., 'gdprstore11.myshopify.com')
  if (shopUrl) {
    const shopDomain = shopUrl.includes('.myshopify.com')
      ? shopUrl
      : `${shopUrl}.myshopify.com`;
    sessionStorage.setItem('shopUrl', shopDomain);
    return shopDomain;
  }
  
  return null;
};

// Generate policy URLs dynamically based on the shop subdomain
const shopSubdomain = getShopSubdomain();

const policyUrls = shopSubdomain
  ? {
      'Shopify Policy (/policies/privacy-policy)': `https://${shopSubdomain}/policies/privacy-policy`,
      'GDPR Cookies Consent': `https://${shopSubdomain}/gdpr-privacy-policy`,
      'PIPEDA Cookies Consent': `https://${shopSubdomain}/pipeda-privacy-policy`,
      'CCPA Cookies Consent': `https://${shopSubdomain}/ccpa-privacy-policy`,
      'LGPD Cookies Consent': `https://${shopSubdomain}/lgpd-privacy-policy`,
      'APPI Cookies Consent': `https://${shopSubdomain}/appi-privacy-policy`,
    }
  : {};

  const handleGooglePrivacyPolicyChange = useCallback(
    (newChecked) => setShowGooglePrivacyPolicy(newChecked),
    []
  );

  const handlePrivacyPolicyLinkChange = useCallback(
    (newChecked) => {
      setShowPrivacyPolicyLink(newChecked);
      if (newChecked) {
        setSelectedChoice(['Use specific Privacy Policy']);
      }
    },
    []
  );

  const handleChoiceListChange = useCallback(
    (value) => setSelectedChoice(value),
    []
  );

  const handleSelectChange = useCallback(
    (value) => setSelectedOption(value),
    []
  );

  const handleSave = async () => {
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
      console.log('Shop URL from sessionStorage:', shopUrl);
    }

    const payload = {
      shopUrl: shopUrl,
      showGooglePrivacyPolicy: showGooglePrivacyPolicy,
      showPrivacyPolicyLink: showPrivacyPolicyLink,
      selectedChoice: selectedChoice,
      selectedOption: selectedOption,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/shopify_app/save_privacy_policy_settings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        console.log('Privacy policy settings saved successfully');
      } else {
        console.error('Error saving privacy policy settings:', data.message);
      }
      navigate('/checklist');
    } catch (error) {
      console.error('Error saving privacy policy settings:', error);
    }
  };

  // Function to handle preview link click
  const handlePreview = () => {
    const selectedUrl = policyUrls[selectedOption];
    if (selectedUrl) {
      window.open(selectedUrl, '_blank'); // Opens the policy in a new tab
    } else {
      console.error('No URL found for selected privacy policy');
    }
  };

  return (
    <Page fullWidth>
      <h1 style={{ marginLeft: '155px', marginTop: '10px', marginBottom: '30px', fontSize: '20px', fontWeight: '650' }}>
        Privacy policy link
      </h1>
      <div style={{ marginLeft: '150px', cursor: 'pointer' }}> 
        <div style={{ width: '850px' }}>
          <LegacyCard sectioned>
            <p style={{ fontWeight: '650', marginBottom: '2px'}}>
              <Checkbox
                label="Show Google privacy policy link"
                checked={showGooglePrivacyPolicy}
                onChange={handleGooglePrivacyPolicyChange} 
              />
            </p>
            <p style={{ marginLeft: '25px' }}>Required if you use Google tracking services</p>

            {showGooglePrivacyPolicy && (
              <div style={{ marginLeft: '25px', marginTop: '10px' }}>
                <TextField
                  label="Google Privacy Policy URL"
                  value="https://business.safety.google/privacy/"
                  readOnly
                />
              </div>
            )}
            
            <p style={{ fontWeight: '650', marginBottom: '2px', marginTop:'15px' }}>
              <Checkbox
                label="Show Privacy Policy link (learn more)"
                checked={showPrivacyPolicyLink}
                onChange={handlePrivacyPolicyLinkChange} 
              />
            </p>
            <p style={{ marginLeft: '25px' }}>Link to specific Privacy Policy</p>
            
            {showPrivacyPolicyLink && (
              <div style={{ marginLeft: '25px', marginTop: '10px' }}>
                <ChoiceList
                  choices={[
                    { label: 'Use specific Privacy Policy', value: 'Use specific Privacy Policy' },
                  ]}
                  selected={selectedChoice}
                  onChange={handleChoiceListChange}
                />
                {showPrivacyPolicyLink && selectedChoice.includes('Use specific Privacy Policy') && (
                  <div style={{marginLeft:'720px',marginBottom:'-25px'}}>
                    <Button variant="plain" onClick={handlePreview} style={{ marginLeft: '10px' }}>Preview</Button>
                  </div>
                )}
                {selectedChoice.includes('Use specific Privacy Policy') && (
                  <div style={{ marginTop: '10px' }}>
                    <Select
                      label="Privacy link"
                      options={[
                        { label: 'Shopify Policy (/policies/privacy-policy)', value: 'Shopify Policy (/policies/privacy-policy)' },
                        { label: 'GDPR Cookies Consent', value: 'GDPR Cookies Consent' },
                        { label: 'PIPEDA Cookies Consent', value: 'PIPEDA Cookies Consent' },
                        { label: 'CCPA Cookies Consent', value: 'CCPA Cookies Consent' },
                        { label: 'LGPD Cookies Consent', value: 'LGPD Cookies Consent' },
                        { label: 'APPI Cookies Consent', value: 'APPI Cookies Consent' },
                      ]}
                      value={selectedOption}
                      onChange={handleSelectChange}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div style={{ marginTop: '10px' }}>
              <Button primary onClick={handleSave}>Save</Button>
            </div>
          </LegacyCard>
        </div> 
      </div>
    </Page>
  );
}

export default Checklist;
