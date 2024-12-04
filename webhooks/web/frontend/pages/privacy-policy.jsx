import { Page, LegacyCard, Button, Checkbox, TextField, ChoiceList, Select, Icon } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

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

    if (shopUrl) {
      const shopDomain = shopUrl.includes('.myshopify.com') ? shopUrl : `${shopUrl}.myshopify.com`;
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
        'GDPR Cookies Consent': `https://${shopSubdomain}/pages/gdpr-privacy-policy`,
        'PIPEDA Cookies Consent': `https://${shopSubdomain}/pages/pipeda-privacy-policy`,
        'CCPA Cookies Consent': `https://${shopSubdomain}/pages/ccpa-privacy-policy`,
        'LGPD Cookies Consent': `https://${shopSubdomain}/pages/lgpd-privacy-policy`,
        'APPI Cookies Consent': `https://${shopSubdomain}/pages/appi-privacy-policy`,
      }
    : {};

  const handleGooglePrivacyPolicyChange = useCallback(
    (newChecked) => {
      setShowGooglePrivacyPolicy(newChecked);
      if (newChecked) {
        setShowPrivacyPolicyLink(false);
      }
    },
    []
  );

  const handlePrivacyPolicyLinkChange = useCallback(
    (newChecked) => {
      setShowPrivacyPolicyLink(newChecked);
      if (newChecked) {
        setShowGooglePrivacyPolicy(false);
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

  const fetchSettings = async () => {
    const shopUrl = getShopSubdomain();

    if (!shopUrl) {
      console.error('Shop URL not found');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/shopify_app/privacy_policy_settings/?shop_url=${shopUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        // Update state with fetched settings
        setShowGooglePrivacyPolicy(data.show_google_privacy_policy);
        setSelectedOption(data.selected_option || 'Shopify Policy (/policies/privacy-policy)');
        setShowPrivacyPolicyLink(data.show_google_privacy_policy ? false : true);
      }
    } catch (error) {
      console.error('Error fetching privacy policy settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const shopUrl = getShopSubdomain();

    if (!shopUrl) {
      console.error('Shop URL not found');
      return;
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

  const handlePreview = () => {
    const selectedUrl = policyUrls[selectedOption];
    if (selectedUrl) {
      window.open(selectedUrl, '_blank');
    } else {
      console.error('No URL found for selected privacy policy');
    }
  };

  return (
    <Page fullWidth>
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '150px', marginBottom: '-30px', marginTop: '20px' }}
        onClick={() => navigate('/checklist')}
        aria-label="Go to checklist"
      >
        <Icon source={ArrowLeftIcon} />
      </button>
      <h1 style={{ marginLeft: '200px', marginTop: '10px', marginBottom: '30px', fontSize: '20px', fontWeight: '650' }}>
        Privacy policy link
      </h1>
      <div style={{ marginLeft: '150px', cursor: 'pointer' }}>
        <div style={{ width: '850px' }}>
          <LegacyCard sectioned>
            <Checkbox
              label="Show Google privacy policy link"
              checked={showGooglePrivacyPolicy}
              onChange={handleGooglePrivacyPolicyChange}
            />
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

            <Checkbox
              label="Show Privacy Policy link (learn more)"
              checked={showPrivacyPolicyLink}
              onChange={handlePrivacyPolicyLinkChange}
            />
            <p style={{ marginLeft: '25px' }}>Link to specific Privacy Policy</p>
            {showPrivacyPolicyLink && (
              <div style={{ marginLeft: '25px', marginTop: '10px' }}>
                <ChoiceList
                  choices={[{ label: 'Use specific Privacy Policy', value: 'Use specific Privacy Policy' }]}
                  selected={selectedChoice}
                  onChange={handleChoiceListChange}
                />
                {selectedChoice.includes('Use specific Privacy Policy') && (
                  <div style={{alignItems: 'center', marginBottom: '10px' }}>
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
                      <Button variant="plain" onClick={handlePreview}>
                      Preview
                      </Button>
                  </div>
                )}
              </div>
            )}

            <Button primary onClick={handleSave} style={{ marginTop: '100px' }}>
              Save
            </Button>
          </LegacyCard>
        </div>
      </div>
    </Page>
  );
}

export default Checklist;
