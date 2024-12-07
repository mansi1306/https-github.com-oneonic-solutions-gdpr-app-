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

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const shopUrl = sessionStorage.getItem('shopUrl') || new URLSearchParams(window.location.search).get('shop');
        if (!shopUrl) {
          console.error('Shop URL not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_plan/?shop_url=${shopUrl}`);
        
        if (response.status === 404) {
          // If the plan fetch returns 404, navigate to MonthPlan page
          navigate("/MonthPlan");
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [navigate]);


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
      <div
        style={{
          marginLeft:'220px',
          margin: '20px auto', 
          cursor: 'pointer',
          width: '950px',
          maxWidth:'950px' ,
          fontSize: '20px',
          fontWeight: '650',
        }}
      >
      {/* <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          margin: '0px auto',
          marginLeft:'0px',
          marginBottom:'-40px',
        }}
        onClick={() => navigate('/checklist')}
        aria-label="Go to checklist"
      >
        <Icon source={ArrowLeftIcon} />
      </button> */}
      <h1
        style={{
          marginLeft:'50px',
          margin: '20px auto', 
          cursor: 'pointer',
          width: '950px',
          maxWidth:'950px' ,
          fontSize: '20px',
          fontWeight: '650',
        }}
      >
        Re-open banner
      </h1></div>
      <div style={{ margin: '20px auto', cursor: 'pointer',width: '950px',maxWidth:'950px' }}>
          <LegacyCard sectioned>
            <p style={{ fontWeight: '650', marginBottom: '7px' }}>
              <Checkbox label="Show re-open banner" checked={checked} onChange={handleChange} />
            </p>
            <p>
              checked show re-open banner checkbox to allow visitors to
              open banner again
            </p>
            <div style={{ marginTop: '10px' }}>
              <Button primary onClick={handleSave} loading={loading}>
                Save
              </Button>
            </div>
          </LegacyCard>
        </div>
    </Page>
  );
}

export default Checklist;
