import React, { useState ,useEffect} from 'react';
import {
  Page,
  FormLayout,
  Checkbox,
  Button,
  Card,
  ProgressBar,
  ButtonGroup,
  Modal,
  Scrollable
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [shopName, setShopName] = useState('');

  useEffect(() => {
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

    const fetchShopName = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/shop_name/?shop_url=${shopUrl}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.shop_name) {
          // Set the shop name directly from the response
          setShopName(data.shop_name);
        }
      } catch (error) {
        console.error('Error fetching shop name:', error);
      }
    };    

    fetchShopName();
  }, []); // Empty dependency array ensures this runs only on component mount

  return (
    <Page narrowWidth>
       <h1 style={{ fontSize: '22px', marginLeft: '-130px', marginTop: '20px',marginBottom:'30px' }}>
        <b>Welcome {shopName || ''} Admin!</b>
      </h1>
      <CountryForm/>
    </Page>
  );
}

function CountryForm() {
  const [allCountries, setAllCountries] = useState(false);
  const [euCountries, setEuCountries] = useState(false);
  const [usStates, setUsStates] = useState(false);
  const [brazil, setBrazil] = useState(false);
  const [canada, setCanada] = useState(false);
  const [japan, setJapan] = useState(false);
  const navigate = useNavigate();
  const [selectedRegions, setSelectedRegions] = useState(286); // Number of regions selected
  const [modalActive, setModalActive] = useState(false);
  const [regions, setRegions] = useState({
    Africa: true,
    Asia: true,
    Europe: true,
    NorthAmerica: true,
    Oceania: true,
    SouthAmerica: true,
  });

  const toggleModal = () => setModalActive(!modalActive);

  const handleAllCountriesChange = () => {
    const newValue = !allCountries;
    setAllCountries(newValue);
    setEuCountries(false);
    setUsStates(false);
    setBrazil(false);
    setCanada(false);
    setJapan(false);
  };

  const handleRegionChange = (region) => {
    setRegions((prevRegions) => ({
      ...prevRegions,
      [region]: !prevRegions[region],
    }));
  };

  const handleIndividualChange = (setter, value) => {
    setter(value);
    if (value) {
      setAllCountries(false);
    }
  };

  const handleRegionSave = () => {
    const selectedCount = Object.values(regions).filter(Boolean).length;
    setSelectedRegions(selectedCount);
    toggleModal();
  };

  return (
    <div style={{width:'950px',marginLeft:'-160px'}}><Page>
      <Card sectioned>
        <span>Step 1/2</span><ProgressBar progress={50} size="small" tone="primary"/>
        <h1 style={{color:'rgb(33, 43, 92)',fontSize:'22px',fontWeight:'700',marginTop:'20px',marginBottom:'15px'}}>Choose region to show cookie banner</h1>
        <p style={{marginBottom:'15px'}}>Where do you want to show cookie banner</p>
        <FormLayout >
          <Checkbox
            label="All countries"
            checked={allCountries}
            onChange={handleAllCountriesChange}
            helpText="Visible to every customer around the world"
          />
          {allCountries && (
              <p style={{ marginLeft: '1.7rem', marginTop: '-18px', color: 'gray' }}>
                {selectedRegions} regions selected{' '}
                <Button variant='plain' onClick={toggleModal}>
                  Edit
                </Button>
              </p>
            )}

          <Checkbox
            label="EU & UK countries GDPR"
            checked={euCountries}
            onChange={(checked) => handleIndividualChange(setEuCountries, checked)}
            helpText="General Data Protection Regulation"
          />
          {euCountries && (
            <p style={{ marginLeft: '1.7rem',marginTop:'-18px',color:'gray' }}>32 regions selected <Button variant='plain'>Edit</Button></p>
          )}

          <Checkbox
            label="US State laws"
            checked={usStates}
            onChange={(checked) => handleIndividualChange(setUsStates, checked)}
            helpText="CCPA/CPRA, VCDPA, CPA, CTDPA and UCPA for California, Virginia and Colorado,
             Connecticut and Utah respectively"
          />
          {usStates && (
            <p style={{ marginLeft: '1.7rem',marginTop:'-18px',color:'gray' }}>5 regions selected <Button variant='plain'>Edit</Button></p>
          )}

          <Checkbox
            label="Brazil (LGPD)"
            checked={brazil}
            onChange={(checked) => handleIndividualChange(setBrazil, checked)}
            helpText="The General Data Protection Law"
          />

          <Checkbox
            label="Canada (PIPEDA)"
            checked={canada}
            onChange={(checked) => handleIndividualChange(setCanada, checked)}
            helpText="The Personal Information Protection and Electronic Documents Act"
          />

          <Checkbox
            label="Japan (APPI)"
            checked={japan}
            onChange={(checked) => handleIndividualChange(setJapan, checked)}
            helpText="The Act on the Protection of Personal Information"
          />
        </FormLayout>

        <div style={{ marginTop: '20px',marginLeft:'720px'}}>
        <ButtonGroup>
          <Button variant="plain"
          onClick={() => navigate('/MonthPlan')}>Skip</Button>
          <Button variant="primary"
          onClick={() => navigate('/BannerType')}>Next step</Button>
        </ButtonGroup>
        </div>

        {/* Modal for editing regions */}
        {modalActive && (
            <Modal open={modalActive} onClose={toggleModal} title="Edit regions">
              <Modal.Section>
                <Scrollable shadow style={{ height: '300px' }}>
                  <FormLayout>
                    {Object.keys(regions).map((region) => (
                      <Checkbox
                        key={region}
                        label={region}
                        checked={regions[region]}
                        onChange={() => handleRegionChange(region)}
                      />
                    ))}
                  </FormLayout>
                </Scrollable>
              </Modal.Section>
              <Modal.Section>
                <ButtonGroup>
                  <Button variant="plain" onClick={toggleModal}>Cancel</Button>
                  <Button onClick={handleRegionSave}>Save</Button>
                </ButtonGroup>
              </Modal.Section>
            </Modal>
            )}
      </Card>
    </Page></div>
  );
}

