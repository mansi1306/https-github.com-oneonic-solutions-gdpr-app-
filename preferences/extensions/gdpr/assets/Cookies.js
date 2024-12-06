// Function to get the user's country using ipapi
async function getUserCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.country_name;  // This returns the full country name
    } catch (error) {
        console.error('Error fetching user country:', error);
        return null;  // In case of error, return null
    }
}

// Function to get the Shopify shop URL
function getShopUrl() {
    let shopUrl = sessionStorage.getItem('shopUrl') || new URLSearchParams(window.location.search).get('shop');
    if (!shopUrl && window.Shopify && window.Shopify.shop) {
        shopUrl = window.Shopify.shop;
    }
    if (shopUrl) sessionStorage.setItem('shopUrl', shopUrl);
    return shopUrl;
} 

// Function to fetch banner type and selected countries from the backend
async function fetchStoreData() {

    const shopUrl = getShopUrl();
    if (!shopUrl) {
        console.error('Shop URL not found');
        return; // Exit if no shop URL is available
    }else{
        console.log(shopUrl);
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_store_data/?shop_url=${shopUrl}`);
        const data = await response.json();

        if (response.ok) {
            // Successfully fetched the store data
            const bannerType = data.banner_type;
            const selectedCountries = data.selected_countries;
            const selectedTheme = data.selected_theme;

            console.log('Banner Type:', bannerType);
            console.log('Selected Countries:', selectedCountries);
            console.log('Selected Theme:', selectedTheme);

            // Display banner or do something based on the data
            displayBanner(bannerType, selectedCountries, selectedTheme);
        } else {
            console.error('Error fetching store data:', data.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Function to create and display the banner based on banner type
async function displayBanner(bannerType, selectedCountries, selectedTheme) {
    const banner = document.createElement('div');

    // Define colors based on the selected theme
    let modalBackgroundColor, acceptButtonColor, rejectButtonColor;
    if (selectedTheme === 'Basic') {
        modalBackgroundColor = 'rgb(255, 255, 255)';
        acceptButtonColor = 'rgb(26, 172, 122)';
        acceptButtonFontColor = 'white';
        rejectButtonColor = 'white';
        rejectButtonBorder = '1px solid black';
    } else if (selectedTheme === 'Light theme') {
        modalBackgroundColor = 'rgb(248, 248, 248)';
        acceptButtonColor = 'black';
        acceptButtonFontColor = 'white';
        rejectButtonColor = 'black';
        rejectButtonBorder = '1px solid black'
    } else if (selectedTheme === 'Sense') {
        modalBackgroundColor = 'rgb(255, 220, 194)';
        acceptButtonColor = 'rgb(185, 219, 47)';
        acceptButtonFontColor = 'black';
        rejectButtonColor = 'black';
        rejectButtonBorder = '1px solid black';
    }

    // Check the selected theme and construct the banner accordingly
    if (selectedTheme === 'Basic') {
        banner.innerHTML = `
            <div style='background-color:rgb(248, 248, 248) ; width:100%;border-top:1px solid lightgray;'>
                <img src='${greenImageUrl}' alt="Cookie" width='40px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${cgImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style='font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px;'>We keep your privacy</h3>
                    <p style='font-size: 15px; margin-left: 70px;'>
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style='text-decoration: underline;'>Privacy Policy</span>
                    </p>
                <div style='margin-left: 70px; padding-bottom: 15px;'>
                    <div style='display: flex; gap: 5px;'>
                        ${bannerType === 'accept-only' ? `
                            <div style='background-color: rgb(26, 172, 122);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center;color:white; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style='padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style='background-color: rgb(26, 172, 122); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center;color:white; border-radius: 10px;'>Accept</div>
                            <div style='padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style='color:white;background-color: rgb(26, 172, 122);padding-left:22px; padding-top:3px; width:90px; height:35px; align: center; border-radius: 10px;'>Accept</div>
                            <div style='padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style='padding-left:10px;padding-top:3px; text-decoration:underline; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Light theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;border-top:1px solid lightgray;'>
                <img src='${ccImageUrl}' alt="Cookie" width='33px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${blackImageUrl}' alt="close" width='22px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style='font-weight: 650;font-size:18px;margin-left: 70px; margin-top: -20px;margin-bottom:-10px;'>We keep your privacy</h3>
                    <p style='font-size: 15px; margin-left: 70px;'>
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style='text-decoration: underline;'>Privacy Policy</span>
                    </p>
                <div style='margin-left: 70px; padding-bottom: 15px;'>
                    <div style='display: flex; gap: 5px;'>
                        ${bannerType === 'accept-only' ? `
                            <div style='border: 1px solid black; background-color: black; color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style='padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style='border: 1px solid black; background-color: black; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div style='padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style='border: 1px solid black; background-color: black; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div style='padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                            <div style='padding-left:10px;padding-top:3px; text-decoration:underline; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Sense') {
        banner.innerHTML = `
            <div style='background-color: rgb(255, 220, 194); width:100%;'>
                <img src='${ccImageUrl}' alt="Cookie" width='33px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${blackImageUrl}' alt="close" width='22px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline;">Privacy Policy</span>
                    </p>
                <div style=" margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(185, 219, 47); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid black;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(185, 219, 47);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(185, 219, 47); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid black;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="padding-left:10px;padding-top:3px; text-decoration:underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
         `;
    } else if (selectedTheme === 'Golden') {
        banner.innerHTML = `
            <div style='background-color: rgb(29, 29, 29); width:100%;'>
                <img src='${yellowImageUrl}' alt="Cookie" width='40px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${yeImageUrl}' alt="close" width='18px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px;margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline;">Privacy Policy</span>
                    </p>
                <div style=" margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Christmas') {
        banner.innerHTML = `
            <div style='background-color: rgb(22, 91, 51); width:100%;'>
                <img src='${whImageUrl}' alt="Cookie" width='38px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${whiteImageUrl}' alt="close" width='20px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px;color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline; color: rgb(242, 194, 50);">Privacy Policy</span>
                    </p>
                <div style=" margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Neumorphism') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;border-top:1px solid lightgray;'>
                <img src='${grayImageUrl}' alt="Cookie" width='40px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${gracImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px;margin-top: -20px;margin-bottom:-10px;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style="text-decoration: underline; font-weight: 650;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 20px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 20px;">Accept</div>
                            <div style="padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="border: 1px solid black;padding-left:22px;box-shadow:5px 5px 10px rgba(0, 0, 0, 0.5); padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 20px;">Accept</div>
                            <div style="padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:3px; text-decoration :underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Elegant') {
        banner.innerHTML = `
            <div style='background-color: rgb(246, 239, 235); width:100%;'>
                <img src='${brownImageUrl}' alt="Cookie" width='35px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${brImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px;margin-top: -20px;margin-bottom:-10px;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style="text-decoration: underline;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(163, 128, 100); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(163, 128, 100); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(163, 128, 100); color: white; padding-left:25px;padding-top:5px;width:100px;height:40px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="padding-left:25px;padding-top:5px;width:100px;height:40px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:5px; text-decoration:underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Dark theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(16, 24, 47); width:100%;'>
                <img src='${whImageUrl}' alt="Cookie" width='38px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${whiteImageUrl}' alt="close" width='20px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px;margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style="text-decoration: underline; color: white;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Autumn') {
        banner.innerHTML = `
            <div style='background-color:rgb(251, 200, 154) ; width:100%;'> 
                <img src='${brownImageUrl}' alt="Cookie" width='35px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${brImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: rgb(163, 72, 0);">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: rgb(163, 72, 0);">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline; color: rgb(163, 72, 0);">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:3px; text-decoration:underline;color: rgb(163, 72, 0); margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Crave') {
        banner.innerHTML = `
            <div style='background-color:rgb(145, 15, 63); width:100%;'>
                <img src='${whImageUrl}' alt="Cookie" width='38px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img src='${whiteImageUrl}' alt="close" width='20px' style='margin-left: 1489px;margin-top:10px;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline; color: white;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: white; padding-left:22px;color:rgb(145, 15, 63); padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: white;color:rgb(145, 15, 63); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: white;color:rgb(145, 15, 63); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    document.body.appendChild(banner);

    // // Get the user's country
    // const userCountry = await getUserCountry();
    // console.log('User Country:', userCountry);

    // // Check if the user's country is in the selected countries list
    // if (userCountry && selectedCountries.includes(userCountry)) {
    //     document.body.appendChild(banner);
    // } else {
    //     console.log('User country is not in the selected countries list.');
    // }
}

function openPreferencesModal(modalBackgroundColor, acceptButtonColor, rejectButtonColor) {
    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '1000';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = modalBackgroundColor;
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

    // Add modal title
    const modalTitle = document.createElement('h3');
    modalTitle.style.fontWeight = '650';
    modalTitle.textContent = 'Cookie Preferences';
    modalContent.appendChild(modalTitle);

    // Add the "Accept All" button
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept All';
    acceptButton.style.backgroundColor = acceptButtonColor;
    acceptButton.style.color = acceptButtonFontColor;
    acceptButton.style.border = 'none';
    acceptButton.style.borderRadius = '5px';
    acceptButton.style.padding = '10px';
    acceptButton.style.marginRight = '10px';
    acceptButton.addEventListener('click', () => {
        // Logic to accept all cookies
        console.log('All cookies accepted.');
        closePreferencesModal();
    });
    modalContent.appendChild(acceptButton);

    // Add the "Reject" button
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject';
    rejectButton.style.backgroundColor = rejectButtonColor;
    rejectButton.style.border = rejectButtonBorder;
    rejectButton.style.borderRadius = '5px';
    rejectButton.style.padding = '10px';
    rejectButton.addEventListener('click', () => {
        // Logic to reject all non-essential cookies
        console.log('All non-essential cookies rejected.');
        closePreferencesModal();
    });
    modalContent.appendChild(rejectButton);

    // Define sections
    const sections = [
        { title: 'Strictly Required', description: 'Those cookies are required to run our website properly and cannot be switched off.' },
        { title: 'Analytics', description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information.', checkbox: true },
        { title: 'Marketing', description: 'These cookies are set by our marketing partners to show you relevant ads.', checkbox: true },
        { title: 'Functional', description: 'Functional cookies enable our website to offer additional functions and personal settings.', checkbox: true },
    ];

    // Create sections in the modal
    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';

        // Create section title
        const sectionTitle = document.createElement('strong');
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);

        // Create section description
        const sectionDesc = document.createElement('p');
        sectionDesc.textContent = section.description;
        sectionDiv.appendChild(sectionDesc);

        // Create checkbox if applicable
        if (section.checkbox) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.float = 'right';
            sectionDiv.appendChild(checkbox);
        }

        // Append section to modal content
        modalContent.appendChild(sectionDiv);
    });

    // Add the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.padding = '10px';
    closeButton.addEventListener('click', closePreferencesModal);
    modalContent.appendChild(closeButton);

    // Append modal content to modal container
    modalContainer.appendChild(modalContent);

    // Append modal to the body
    document.body.appendChild(modalContainer);
}

// Function to close the modal
function closePreferencesModal() {
    const modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) {
        document.body.removeChild(modal);
    }
}


// Call the function to fetch store data and display the banner
fetchStoreData();