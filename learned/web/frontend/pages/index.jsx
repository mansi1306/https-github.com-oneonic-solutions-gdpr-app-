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
  Scrollable,
  Icon,
  Badge,
  Spinner
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import {CaretDownIcon,CaretUpIcon} from '@shopify/polaris-icons';

export default function HomePage() {
  const [shopName, setShopName] = useState('');

  useEffect(() => {
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
      console.log(shopUrl);
    }

    const fetchShopName = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/shop_name/?shop_url=${shopUrl}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.shop_name) {
          setShopName(data.shop_name);
        }
      } catch (error) {
        console.error('Error fetching shop name:', error);
      }
    };    

    fetchShopName();
  }, []);

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
  const [loading, setLoading] = useState(true);
  const [allCountries, setAllCountries] = useState(true);
  const [euCountries, setEuCountries] = useState(false);
  const [usStates, setUsStates] = useState(false);
  const [brazil, setBrazil] = useState(false);
  const [canada, setCanada] = useState(false);
  const [japan, setJapan] = useState(false);
  const navigate = useNavigate();
  const [selectedRegions, setSelectedRegions] = useState(0);
  const [modalActive, setModalActive] = useState(false);
  const [euModalActive, setEuModalActive] = useState(false);
  const [usModalActive, setusModalActive] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState({});
  const [expandedStates, setExpandedStates] = useState({});
  const [regions, setRegions] = useState({
    Africa: {},
    Asia: {},
    Europe: {},
    NorthAmerica:{},
    Oceania: {},
    SouthAmerica: {},
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setLoading(false);
    };

    loadData();
  }, []);

  const [selectedeuRegions, setSelectedeuRegions] = useState({
    'Europe': true,
  });

  const [selectedusRegions, setSelectedusRegions] = useState({
    'United States': true,
  });

  const toggleModal = () => setModalActive(!modalActive);

  const toggleEuModal = () => setEuModalActive(!euModalActive);

  const toggleusModal = () => setusModalActive(!usModalActive);

  const handleAllCountriesChange = () => {
    const newValue = !allCountries;
    setAllCountries(newValue);

    if (newValue) {
      setEuCountries(false);
      setUsStates(false);
      setBrazil(false);
      setCanada(false);
      setJapan(false);
    }
    
    setRegions(prevRegions => {
      const updatedRegions = {};
      Object.keys(prevRegions).forEach(region => {
        updatedRegions[region] = {};
        regionsData[region].forEach(country => {
          updatedRegions[region][country] = newValue;
        });
      });
      return updatedRegions;
    });
  };

  const handleRegionChange = (region) => {
    setRegions(prevRegions => {
      const updatedRegion = { ...prevRegions[region] };
      const allChecked = Object.values(updatedRegion).every((checked) => checked);
      Object.keys(updatedRegion).forEach((country) => {
        updatedRegion[country] = !allChecked;
      });
      return {
        ...prevRegions,
        [region]: updatedRegion,
      };
    });
  };

  const handleSubRegionChange = (region, subRegion) => {
    setSelectedSubRegions((prev) => ({
      ...prev,
      [region]: {
        ...prev[region],
        [subRegion]: !prev[region]?.[subRegion],
      },
    }));
  };

  const handleSupRegionChange = (region, supRegion) => {
    setSelectedSupRegions((prev) => ({
      ...prev,
      [region]: {
        ...prev[region],
        [supRegion]: !prev[region]?.[supRegion],
      },
    }));
  };

  useEffect(() => {
    const initialRegions = Object.keys(regionsData).reduce((acc, region) => {
      acc[region] = {};
      regionsData[region].forEach(item => {
        const countryName = typeof item === 'string' ? item : item.name;
        acc[region][countryName] = true;
      });
      return acc;
    }, {});
    setRegions(initialRegions);
  }, []);

  const handleRegionToggle = (region) => {
    setExpandedRegions(prevExpandedRegions => ({
      ...prevExpandedRegions,
      [region]: !prevExpandedRegions[region],
    }));
  };

  const handleStateToggle = (region, state) => {
    setExpandedStates(prevExpandedStates => ({
        ...prevExpandedStates,
        [region]: {
            ...prevExpandedStates[region],
            [state]: !prevExpandedStates[region]?.[state],
        },
    }));
  };

  const regionsData = {
    Africa: ["Algeria","Angola","Benin","Botswana","British Indian Ocean Territory","Burkina Faso","Burundi","Cabo Verde",   
      "Cameroon","Central African Republic","Chad","Comoros","Congo - Brazzaville","Congo - Kinshasa","Côte d'Ivoire","Djibouti","Egypt",
      "Equatorial Guinea","Eritrea","Eswatini","Ethiopia","French Southern Territories","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau",
      "Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali","Mauritania","Mauritius","Mayotte","Morocco","Mozambique",
      "Namibia","Niger","Nigeria","Réunion","Rwanda","Sao Tome & Principe","Senegal","Seychelles","Sierra Leone","Somalia","South Africa",
      "South Sudan","Saint Helena","Sudan","Tanzania","Togo","Tristan da Cunha","Tunisia","Uganda","Western Sahara","Zambia","Zimbabwe"],

    Asia: ["Afghanistan","Armenia","Azerbaijan","Bahrain","Bangladesh","Bhutan","Brunei","Cambodia","China","Georgia","Hong Kong SAR",
      "India","Indonesia","Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait","Kyrgyzstan","Laos","Lebanon","Macao SAR","Malaysia",
      "Maldives","Mongolia","Myanmar (Burma)","Nepal","Oman","Pakistan","Palestinian Territories","Philippines","Qatar","Saudi Arabia",
      "Singapore","South Korea","Sri Lanka","Taiwan","Tajikistan","Thailand","Timor-Leste","Türkiye","Turkmenistan","United Arab Emirates",
      "Uzbekistan","Vietnam","Yemen"],

    Europe: ["Åland Islands","Albania","Andorra",{ name: "Austria", recommended: true },
      "Belarus",{ name: "Belgium", recommended: true },"Bosnia & Herzegovina",{ name: "Bulgaria", recommended: true },
      { name: "Croatia", recommended: true },{ name: "Cyprus", recommended: true },{ name: "Czechia", recommended: true },
      { name: "Denmark", recommended: true },{ name: "Estonia", recommended: true },"Faroe Islands",{ name: "Finland", recommended: true },
      { name: "France", recommended: true },{ name: "Germany", recommended: true },"Gibraltar",{ name: "Greece", recommended: true },
      "Guernsey",{ name: "Hungary", recommended: true },{ name: "Iceland", recommended: true },{ name: "Ireland", recommended: true },
      "Isle of Man",{ name: "Italy", recommended: true },"Jersey","Kosovo",{ name: "Latvia", recommended: true },
      { name: "Liechtenstein", recommended: true },{ name: "Lithuania", recommended: true },{ name: "Luxembourg", recommended: true },
      { name: "Malta", recommended: true },"Moldova","Monaco","Montenegro",{ name: "Netherlands", recommended: true },
      "North Macedonia",{ name: "Norway", recommended: true },{ name: "Poland", recommended: true },{ name: "Portugal", recommended: true },
      { name: "Romania", recommended: true },"Russia","San Marino","Serbia",{ name: "Slovakia", recommended: true },
      { name: "Slovenia", recommended: true },{ name: "Spain", recommended: true },"Svalbard & Jan Mayen",{ name: "Sweden", recommended: true },
      { name: "Switzerland", recommended: true }, "Ukraine",{ name: "United Kingdom", recommended: true }, "Vatican City",],

    NorthAmerica: ["Anguilla","Antigua & Barbuda","Aruba","Bahamas","Barbados","Belize","Bermuda","Bonaire",
      "British Virgin Islands","Canada","Cayman Islands","Costa Rica","Curaçao","Dominica","Dominican Republic","El Salvador","Greenland",
      "Grenada","Guadeloupe","Guatemala","Haiti","Honduras","Jamaica","Martinique","Mexico","Montserrat","Nicaragua","Panama","Puerto Rico",
      "Sint Maarten","St. Kitts & Nevis","St. Luciac","St. Pierre & Miquelonc","St. Vincent","Trinidad & Tobago","Turks & Caicos Islands",
      "Alabama","Alaska","Arizona","Arkansas",{ name: "California", recommended: true },{ name:  "Colorado", recommended: true },
      { name: "Connecticut", recommended: true },"Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas",
      "Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska",
      "Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
      "Rhode Island","South Carolina","South Dakota","Tennessee","Texas",{ name: "Utah", recommended: true },"Vermont",
      { name: "Virginia", recommended: true },"Washington","Washington DC","West Virginia","Wisconsin","Wyoming","US Virgin Islands",
  ],

    Oceania: ["Australia","Christmas Island","Cocos (Keeling) Islands","Cook Islands","Fiji","French Polynesia",
    "Guam","Heard Island & McDonald Islands","Kiribati","Marshall Islands","Micronesia, Federated States of","Nauru","New Caledonia",
    "New Zealand","Niue","Norfolk Island","Northern Mariana Islands","Palau","Papua New Guinea","Pitcairn","Samoa","Solomon Islands"],
    
    SouthAmerica: ["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Falkland Islands",
      "French Guiana","Guyana","Paraguay","Peru","South Georgia & South Sandwich Islands","Suriname","Uruguay","Venezuela"],
  };

  const [selectedSubRegions, setSelectedSubRegions] = useState({
    'Europe': {
      'Austria': true,
      'Belgium': true,
      'Bulgaria': true,
      'Croatia': true,
      'Cyprus': true,
      'Czechia': true,
      'Denmark': true,
      'Estonia': true,
      'Connecticut': true,
      'France': true,
      'Germany': true,
      'Greece': true,
      'Hungary': true,
      'Iceland': true,
      'Ireland': true,
      'Italy': true,
      'Latvia': true,
      'Liechtenstein': true,
      'Lithuania': true,
      'Luxembourg': true,
      'Malta': true,
      'Netherlands': true,
      'Norway': true,
      'Poland': true,  
      'Portugal': true, 
      'Romania' : true,
      'Slovakia' : true, 
      'Slovenia' : true,
      'Spain' : true,
      'Sweden' : true,
      'Switzerland' : true,
      'United Kingdom': true,
    },
  });

  const subRegions = {
    'Europe': ["Åland Islands","Albania","Andorra",{ name: "Austria", recommended: true },"Belarus",
        { name: "Belgium", recommended: true },"Bosnia & Herzegovina",{ name: "Bulgaria", recommended: true },
        { name: "Croatia", recommended: true },{ name: "Cyprus", recommended: true },{ name: "Czechia", recommended: true },
        { name: "Denmark", recommended: true },{ name: "Estonia", recommended: true },"Faroe Islands","Finland",
        { name: "Connecticut", recommended: true },{ name: "France", recommended: true },{ name: "Germany", recommended: true },
        "Gibraltar",{ name: "Greece", recommended: true },"Guernsey",{ name: "Hungary", recommended: true },
        { name: "Iceland", recommended: true },{ name: "Ireland", recommended: true },"Isle of Man",
        { name: "Italy", recommended: true },"Jersey","Kosovo",{ name: "Latvia", recommended: true },
        { name: "Liechtenstein", recommended: true },{ name: "Lithuania", recommended: true },{ name: "Luxembourg", recommended: true },
        { name: "Malta", recommended: true },"Moldova","Monaco","Montenegro",{ name: "Netherlands", recommended: true },
        "North Macedonia",{ name: "Norway", recommended: true },{ name: "Poland", recommended: true },{ name: "Portugal", recommended: true },
        { name: "Romania", recommended: true },"Russia","San Marino","Serbia",{ name: "Slovakia", recommended: true },
        { name: "Slovenia", recommended: true },{ name: "Spain", recommended: true },"Svalbard & Jan Mayen",
        { name: "Sweden", recommended: true },{ name: "Switzerland", recommended: true },"Ukraine",
        { name: "United Kingdom", recommended: true },"Vatican City",],
  };

  const selectedEuropeCountriesCount = Object.values(selectedSubRegions['Europe'] || {}).filter(Boolean).length;

  const [selectedSupRegions, setSelectedSupRegions] = useState({
    'United States': {
      'California': true,
      'Colorado': true,
      'Connecticut': true,
      'Utah': true,
      'Virginia': true,
    },
  });

  const supRegions = {
    'United States': ["Alabama","Alaska","Arizona","Arkansas",{ name: "California", recommended: true },
      { name: "Colorado", recommended: true },{ name: "Connecticut", recommended: true },"Delaware","Florida","Georgia","Hawaii",
      "Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota",
      "Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
      "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas",
      { name: "Utah", recommended: true },"Vermont",{ name: "Virginia", recommended: true },"Washington","Washington DC",
      "West Virginia","isconsin","Wyoming",],
  };

  const selectedUnitedCountriesCount = Object.values(selectedSupRegions['United States'] || {}).filter(Boolean).length;

  const handleCountryChange = (region, country) => {
    setRegions(prevRegions => ({
      ...prevRegions,
      [region]: {
        ...prevRegions[region],
        [country]: !prevRegions[region][country],
      },
    }));
  };
  
  const countSelectedCountries = () => {
    let count = 0;
    Object.keys(regionsData).forEach((region) => {
      regionsData[region].forEach((country) => {
        const countryName = typeof country === 'string' ? country : country.name;
        const isRecommended = typeof country !== 'string' && country.recommended;
        if (regions[region][countryName] || isRecommended) {
          count++;
        }
      });
    });
    return count;
  };

  const handleIndividualChange = (setter, value) => {
    setter(value);
    if (value) {
      setAllCountries(false);
    }
  };

  const handleRegionSave = () => {
    const selectedCount = countSelectedCountries();
    setSelectedRegions(selectedCount);
    toggleModal();
  };

  const handleSave = () => {
    toggleEuModal(); 
  };

  const handleSaves = () => {
    toggleusModal(); 
  };

  const handleNextStep = async () => {
    let selectedCountries = [];

    if (allCountries) {
      Object.keys(regionsData).forEach((region) => {
        regionsData[region].forEach((country) => {
          const countryName = typeof country === 'string' ? country : country.name;
          selectedCountries.push(countryName);
        });
      });
    } else {
      if (euCountries) {
        const europeCountries = Object.keys(selectedSubRegions['Europe'] || {}).filter(
          (country) => selectedSubRegions['Europe'][country]
        );
        selectedCountries = [...selectedCountries, ...europeCountries];
      }

      if (usStates) {
        const usStatesSelected = Object.keys(selectedSupRegions['United States'] || {}).filter(
          (state) => selectedSupRegions['United States'][state]
        );
        selectedCountries = [...selectedCountries, ...usStatesSelected];
      }
  
      if (brazil) selectedCountries.push("Brazil");
      if (canada) selectedCountries.push("Canada");
      if (japan) selectedCountries.push("Japan");
    }
  
    console.log("Selected countries:", selectedCountries);
  
    if (selectedCountries.length === 0) {
      console.error('No countries selected');
      return;
    }
  
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
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/shopify_app/save_selected_countries/?shop_url=${shopUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_url: shopUrl,
          selected_countries: selectedCountries, 
        }),
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Selected countries saved:', data.message);
  
      navigate('/BannerType');
    } catch (error) {
      console.error('Error saving selected countries:', error);
    }
  };  
  
  return (
    <div style={{width:'950px',marginLeft:'-160px'}}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',paddingBottom:'150px' }}>
          <Spinner size="large" />
        </div>
      ) : (
      <Page>
      <Card sectioned>
        <span>Step 1/3</span><ProgressBar progress={33} size="small" tone="primary"/>
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
              {countSelectedCountries()} countries selected{' '}
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
            <p style={{ marginLeft: '1.7rem', marginTop: '-18px', color: 'gray' }}>
              {selectedEuropeCountriesCount} countries selected{' '}  
              <Button variant="plain" onClick={toggleEuModal}>
                Edit
              </Button>
            </p>
          )}

          <Checkbox
            label="US State laws"
            checked={usStates}
            onChange={(checked) => handleIndividualChange(setUsStates, checked)}
            helpText="CCPA/CPRA, VCDPA, CPA, CTDPA and UCPA for California, Virginia and Colorado,
             Connecticut and Utah respectively"
          />
          {usStates && (
            <p style={{ marginLeft: '1.7rem', marginTop: '-18px', color: 'gray' }}>
              {selectedUnitedCountriesCount} countries selected{' '}  
              <Button variant="plain" onClick={toggleusModal}>
                Edit
              </Button>
            </p>
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

        <div style={{ marginTop: '20px',marginLeft:'780px'}}>
        <ButtonGroup>
          <Button variant="primary"
          onClick={handleNextStep}>Next step</Button>
        </ButtonGroup>
        </div>

      {/* Modal for editing regions */}
      {modalActive && (
        <Modal open={modalActive} onClose={toggleModal} title="Edit regions">
          <Modal.Section>
            <Scrollable shadow style={{ height: '300px' }}>
              <FormLayout>
                {Object.keys(regions).map((region) => (
                  <div key={region} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Checkbox
                        label={region}
                        checked={Object.values(regions[region]).every(
                          (checked) => checked
                        )}
                        onChange={() => handleRegionChange(region)}
                      />
                      <Button
                        variant="plain"
                        onClick={() => handleRegionToggle(region)}
                      >
                        {expandedRegions[region] ? (
                          <Icon source={CaretUpIcon} tone="base" />
                        ) : (
                          <Icon source={CaretDownIcon} tone="base" />
                        )}
                      </Button>
                    </div>

                    {expandedRegions[region] && (
                      <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {regionsData[region].map((item, index) => {
                          const isString = typeof item === 'string';
                          const label = isString ? item : item.name;
                          const isRecommended = !isString && item.recommended;
                          const isChecked = isString
                            ? regions[region][item]
                            : regions[region][item.name];

                          return (
                            <div
                              key={index}
                              style={{
                                marginBottom: '5px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Checkbox
                                label={
                                  <span>
                                    {label}
                                    {isRecommended && (
                                      <Badge style={{ marginLeft: '10px' }}>Recommended</Badge>
                                    )}
                                  </span>
                                }
                                checked={isChecked}
                                onChange={() => handleCountryChange(region, label)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </FormLayout>
            </Scrollable>
          </Modal.Section>
          <Modal.Section>
            <div style={{ textAlign: 'right' }}>
              <ButtonGroup>
                <Button onClick={toggleModal}>Cancel</Button>
                <Button variant="primary" onClick={handleRegionSave}>
                  Select
                </Button>
              </ButtonGroup>
            </div>
          </Modal.Section>
        </Modal>
      )}

      {/* Modal for selecting EU & UK countries */}
      {euModalActive && (
        <Modal open={euModalActive} onClose={toggleEuModal} title="Edit EU & UK Countries">
          <Modal.Section>
            <Scrollable shadow style={{ height: '300px' }}>
              <FormLayout>
                {/* Loop through regions (Europe in this case) */}
                {Object.keys(subRegions).map((region) => (
                  <div key={region} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Checkbox
                        label={region}
                        checked={!!selectedSubRegions[region]}
                        onChange={() => handleRegionToggle(region)}
                      />
                      <Button variant="plain" onClick={() => handleRegionToggle(region)}>
                        {expandedRegions[region] ? (
                          <Icon source={CaretUpIcon} tone="base" />
                        ) : (
                          <Icon source={CaretDownIcon} tone="base" />
                        )}
                      </Button>
                    </div>

                    {expandedRegions[region] && subRegions[region] && (
                      <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {subRegions[region].map((subRegion) => {
                          const subRegionName = typeof subRegion === 'string' ? subRegion : subRegion.name;
                          const isRecommended = typeof subRegion === 'object' && subRegion.recommended;

                          if (isRecommended && !selectedSubRegions[region]?.[subRegionName]) {
                            setSelectedSubRegions((prev) => ({
                              ...prev,
                              [region]: {
                                ...prev[region],
                                [subRegionName]: true,
                              },
                            }));
                          }

                          return (
                            <div key={subRegionName} style={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                label={subRegionName}
                                checked={selectedSubRegions[region]?.[subRegionName] || isRecommended || false}
                                onChange={() => handleSubRegionChange(region, subRegionName)}
                              />
                              {isRecommended && (
                                <Badge style={{ marginLeft: '10px' }}>Recommended</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </FormLayout>
            </Scrollable>
          </Modal.Section>
          <Modal.Section>
            <div style={{ marginLeft: '450px' }}>
              <ButtonGroup>
                <Button onClick={toggleEuModal}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Select</Button>
              </ButtonGroup>
            </div>
          </Modal.Section>
        </Modal>
      )}

      {/* Modal for selecting US State countries */}
      {usModalActive && (
        <Modal open={usModalActive} onClose={toggleusModal} title="Edit US State Countries">
          <Modal.Section>
            <Scrollable shadow style={{ height: '300px' }}>
              <FormLayout>
                {Object.keys(supRegions).map((region) => (
                  <div key={region} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Checkbox
                        label={region}
                        checked={!!selectedSupRegions[region]}
                        onChange={() => handleRegionToggle(region)}
                      />
                      <Button variant="plain" onClick={() => handleRegionToggle(region)}>
                        {expandedRegions[region] ? (
                          <Icon source={CaretUpIcon} tone="base" />
                        ) : (
                          <Icon source={CaretDownIcon} tone="base" />
                        )}
                      </Button>
                    </div>

                    {expandedRegions[region] && supRegions[region] && (
                      <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {supRegions[region].map((supRegion) => {
                          const supRegionName = typeof supRegion === 'string' ? supRegion : supRegion.name;
                          const isRecommended = typeof supRegion === 'object' && supRegion.recommended;

                          return (
                            <div key={supRegionName} style={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                label={supRegionName}
                                checked={selectedSupRegions[region]?.[supRegionName] || false}
                                onChange={() => handleSupRegionChange(region, supRegionName)}
                              />
                              {isRecommended && (
                                <div style={{ marginLeft: '10px' }}>
                                  <Badge>Recommended</Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </FormLayout>
            </Scrollable>
          </Modal.Section>
          <Modal.Section>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonGroup>
                <Button onClick={toggleusModal}>Cancel</Button>
                <Button variant="primary" onClick={handleSaves}>Select</Button>
              </ButtonGroup>
            </div>
          </Modal.Section>
        </Modal>
      )}
      </Card>
    </Page>
    )}
    </div>
  );
}

