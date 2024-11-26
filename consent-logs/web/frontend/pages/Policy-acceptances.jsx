import { IndexTable, Card, Text, Badge, useBreakpoints, Page, Icon } from '@shopify/polaris';
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

function IndexTableWithoutCheckboxesExample() {
  const [cookiePreferences, setCookiePreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    const shopUrl = getShopUrl();
  
      if (!shopUrl) {
        console.error('Shop URL not found');
        setLoading(false);
        return;
      }

    // Fetch cookie preferences data from the API
    fetch('http://127.0.0.1:8000/shopify_app/cookie_preference_list/?shop_url=${shopUrl}')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // Check the data
        setCookiePreferences(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cookie preferences:', error);
        setLoading(false);
      });
  }, []);

  const resourceName = {
    singular: 'cookie preference',
    plural: 'cookie preferences',
  };

  // Render rows based on the cookiePreferences data
  const rowMarkup = cookiePreferences.map(
    (
      { 'Accepted page': url, 'Given consent': given_consent, 'IP address': ip_address, 'Created at': created_date },
      index
    ) => (
      <IndexTable.Row id={index} key={index} position={index}> {/* Using index as key */}
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {index + 1} {/* Displaying index + 1 for numbering */}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{url}</IndexTable.Cell>
        <IndexTable.Cell>{given_consent}</IndexTable.Cell>
        <IndexTable.Cell>{ip_address}</IndexTable.Cell>
        <IndexTable.Cell>{created_date}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page fullWidth>
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
        onClick={() => navigate('/Consent-logs')}
        aria-label="Go to checklist"
      >
        <Icon source={ArrowLeftIcon} />
      </button>
      <h1
        style={{
          marginLeft: '30px',
          marginTop: '10px',
          marginBottom: '30px',
          fontSize: '20px',
          fontWeight: '650',
        }}
      >
        Policy acceptances
      </h1>
      <p style={{ marginBottom: '20px', marginLeft: '30px', marginTop: '-20px' }}>
        View all the consents given for your store
      </p>
      <Card>
        <IndexTable
          condensed={useBreakpoints().smDown}
          resourceName={resourceName}
          itemCount={cookiePreferences.length}
          headings={[
            { title: `Total (${cookiePreferences.length})` }, // Display total count dynamically
            { title: 'Accepted page' },
            { title: 'Given consent' },
            { title: 'IP address' },
            { title: 'Created at' },
          ]}
          selectable={false}
        >
          {loading ? <div>Loading...</div> : rowMarkup} {/* Render the rows only after data is fetched */}
        </IndexTable>
      </Card>
    </Page>
  );
}

export default IndexTableWithoutCheckboxesExample;
