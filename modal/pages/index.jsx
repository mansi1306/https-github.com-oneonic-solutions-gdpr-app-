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
  Badge
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import {CaretDownIcon,CaretUpIcon} from '@shopify/polaris-icons';

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
  const [selectedRegions, setSelectedRegions] = useState(0); // Number of regions selected
  const [modalActive, setModalActive] = useState(false);
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

  const toggleModal = () => setModalActive(!modalActive);

  const handleAllCountriesChange = () => {
    const newValue = !allCountries;
    setAllCountries(newValue);
    setEuCountries(false);
    setUsStates(false);
    setBrazil(false);
    setCanada(false);
    setJapan(false);
    // Reset region selection when all countries are selected/deselected
    if (newValue) {
      setRegions({
        Africa: false,
        Asia: false,
        Europe: false,
        NorthAmerica: false,
        Oceania: false,
        SouthAmerica: false,
      });
      setSelectedRegions(0); // Reset count when selecting all countries
    }
  };

  const handleRegionChange = (region) => {
    setRegions((prevRegions) => {
      const updatedRegions = {
        ...prevRegions,
        [region]: !prevRegions[region],
      };
      const count = Object.values(updatedRegions).filter(Boolean).length;
      setSelectedRegions(count); // Update selected regions count
      return updatedRegions;
    });
  };

  // Initialize regions state
  useEffect(() => {
    // Initialize the regions and their checked states
    const initialRegions = Object.keys(regionsData).reduce((acc, region) => {
        acc[region] = {}; // Initialize the region
        regionsData[region].forEach(item => {
            // For countries and states
            if (typeof item === 'string') {
                acc[region][item] = true; // Set all countries to true
            } else {
                acc[region][item.name] = true; // Set country with states to true
                if (item.states) {
                    item.states.forEach(state => {
                        acc[region][state.name] = true; // Set all states to true
                        state.cities.forEach(city => {
                            acc[region][city] = true; // Set all cities to true
                        });
                    });
                }
            }
        });
        return acc;
    }, {});

    setRegions(initialRegions);
    setExpandedRegions(Object.keys(regionsData).reduce((acc, region) => ({ ...acc, [region]: true }), {})); // All regions expanded
    setExpandedStates({}); // Initialize expanded states
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

  const handleCountryChange = (region, country) => {
    const isChecked = !regions[region][country]; // Get the new checked state
    setRegions(prevRegions => {
        const newRegions = { ...prevRegions };
        newRegions[region][country] = isChecked; // Set country checked state

        // If the country has states, check/uncheck them and their cities
        const countryData = regionsData[region].find(item => (typeof item === 'string' ? item : item.name) === country);
        if (countryData && countryData.states) {
            countryData.states.forEach(state => {
                newRegions[region][state.name] = isChecked; // Check/uncheck state
                state.cities.forEach(city => {
                    newRegions[region][city] = isChecked; // Check/uncheck city
                });
            });
        }
        return newRegions;
    });
};
  

  // Function to count selected countries in the specified regions
  const countSelectedCountries = () => {
    let count = 0;

    // Iterate through each region and count selected countries
    Object.keys(regionsData).forEach(region => {
      if (regions[region]) { // Check if the region is selected
        count += regionsData[region].filter(country => regions[region][country]).length;
      }
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
    const selectedCount = Object.values(regions).filter(Boolean).length;
    setSelectedRegions(selectedCount);
    toggleModal();
  };

  const handleNextStep = async () => {
    let selectedCountries = [];
  
    // Check if "All Countries" is selected
    if (allCountries) {
      selectedCountries.push("All Countries");
    } else {
      // Check for individual selections
      if (euCountries) selectedCountries.push("EU & UK");
      if (usStates) selectedCountries.push("US States");
      if (brazil) selectedCountries.push("Brazil");
      if (canada) selectedCountries.push("Canada");
      if (japan) selectedCountries.push("Japan");
    }
  
    console.log("Selected countries:", selectedCountries); // For debugging
  
    // Exit if no countries are selected
    if (selectedCountries.length === 0) {
      console.error('No countries selected');
      return; 
    }
  
    // Retrieve the shop URL (you already have this logic)
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
      return; // Exit if no shop URL is available
    } else {
      console.log('Shop URL from sessionStorage:', shopUrl);
    }
  
    try {
      // Make POST request to save selected countries
      const response = await fetch(`http://127.0.0.1:8000/shopify_app/save_selected_countries/?shop_url=${shopUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_url: shopUrl,
          selected_countries: selectedCountries, // Send the selected countries/regions
        }),
      });
  
      // Check for response status
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Selected countries saved:', data.message);
  
      // Redirect after saving
      navigate('/BannerType');
    } catch (error) {
      console.error('Error saving selected countries:', error);
    }
  };
  
  return (
    <div style={{width:'950px',marginLeft:'-160px'}}><Page>
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
          onClick={handleNextStep}>Next step</Button>
        </ButtonGroup>
        </div>

      {/* Modal for editing regions */}
      {/* Modal for editing regions */}
      {modalActive && (
                <Modal open={modalActive} onClose={toggleModal} title="Edit regions">
                    <Modal.Section>
                        <Scrollable shadow style={{ height: '300px' }}>
                            <FormLayout>
                                {Object.keys(regions).map((region) => (
                                    <div key={region} style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Checkbox
                                                label={region}
                                                checked={expandedRegions[region]}
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

                                        {expandedRegions[region] && (
                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                {regionsData[region].map((item, index) => {
                                                    if (typeof item === 'string') {
                                                        return (
                                                            <div key={index} style={{ marginBottom: '5px' }}>
                                                                <Checkbox
                                                                    label={item}
                                                                    checked={regions[region][item]} // Checked state
                                                                    onChange={() => handleCountryChange(region, item)}
                                                                />
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div key={index} style={{ marginBottom: '5px' }}>
                                                                <Checkbox
                                                                    label={item.name}
                                                                    checked={regions[region][item.name]} // Checked state
                                                                    onChange={() => handleCountryChange(region, item.name)}
                                                                />
                                                                {item.states && item.states.map((state, stateIndex) => (
                                                                    <div key={stateIndex} style={{ marginLeft: '20px' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Checkbox
                                                                                label={state.name}
                                                                                checked={regions[region][state.name]} // Checked state
                                                                                onChange={() => handleCountryChange(region, state.name)}
                                                                            />
                                                                            <Button variant="plain" onClick={() => handleStateToggle(region, state.name)}>
                                                                                {expandedStates[region]?.[state.name] ? (
                                                                                    <Icon source={CaretUpIcon} tone="base" />
                                                                                ) : (
                                                                                    <Icon source={CaretDownIcon} tone="base" />
                                                                                )}
                                                                            </Button>
                                                                        </div>

                                                                        {expandedStates[region]?.[state.name] && (
                                                                            <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                                                {state.cities.map((city, cityIndex) => (
                                                                                    <Checkbox
                                                                                        key={cityIndex}
                                                                                        label={city}
                                                                                        checked={regions[region][city]} // Checked state
                                                                                        onChange={() => handleCountryChange(region, city)}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
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
                            <Button onClick={toggleModal}>Cancel</Button>
                            <Button variant="primary" onClick={handleRegionSave}>Select</Button>
                        </div>
                    </Modal.Section>
                </Modal>
            )}
      </Card>
    </Page></div>
  );
}

