import { Page, LegacyCard, Icon, Button, Checkbox } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

function Checklist() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  const getShopUrl = () => {
    let shopUrl = sessionStorage.getItem('shopUrl');
    if (!shopUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      shopUrl = urlParams.get('shop');
    }
    if (shopUrl) {
      sessionStorage.setItem('shopUrl', shopUrl);
    }
    console.log('Shop URL:', shopUrl); // Debug log
    return shopUrl;
  };

  // Fetch the initial state when the component mounts
  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      const shopUrl = getShopUrl();
  
      if (!shopUrl) {
        console.error('Shop URL not found');
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/shopify_app/display_shop_preferences/?shop_url=${shopUrl}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
  
        if (data.status === 'success') {
          setChecked(data.preference.show_reopen_button); // Extract correctly
        } else {
          console.error('Backend Error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
      setLoading(false);
    };
  
    fetchInitialState();
  }, []);
  

  const handleChange = useCallback((newChecked) => setChecked(newChecked), []);

  const handleSave = async () => {
    setLoading(true);
    const shopUrl = getShopUrl();

    if (!shopUrl) {
      console.error('Shop URL not found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/shopify_app/save_shop_preferences/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            show_reopen_button: checked,
            shop_url: shopUrl,
          }),
        }
      );
      const data = await response.json();
      console.log(data); // Display the server response
      navigate('/checklist');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
    setLoading(false);
  };

  return (
    <Page fullWidth>
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          marginLeft: '150px',
          marginBottom: '-30px',
          marginTop: '20px',
        }}
        onClick={() => navigate('/checklist')}
        aria-label="Go to checklist"
      >
        <Icon source={ArrowLeftIcon} />
      </button>
      <h1
        style={{
          marginLeft: '185px',
          marginTop: '10px',
          marginBottom: '30px',
          fontSize: '20px',
          fontWeight: '650',
        }}
      >
        Re-open banner
      </h1>
      <div style={{ marginLeft: '150px', cursor: 'pointer' }}>
        <div style={{ width: '850px' }}>
          <LegacyCard sectioned>
            <p style={{ fontWeight: '650', marginBottom: '7px' }}>
              <Checkbox label="Show re-open button" checked={checked} onChange={handleChange} />
            </p>
            <p>
              Small button that keeps displaying on the corner of the screen to allow visitors to
              open banner again
            </p>
            <div style={{ marginTop: '10px' }}>
              <Button primary onClick={handleSave} loading={loading}>
                Save
              </Button>
            </div>
          </LegacyCard>
        </div>
      </div>
    </Page>
  );
}

export default Checklist;
