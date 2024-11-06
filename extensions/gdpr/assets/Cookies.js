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
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'white';
        rejectButtonBorder = '1px solid black';
        rejectButtonFontColor = 'black';
        closeButtonIcon = cgImageUrl;
        closeButtonWidth = '18px';
        cookieIcon = greenImageUrl;
        modalImagewidth = '40px';
        modalTitleFontColor = 'black';
    } else if (selectedTheme === 'Light theme') {
        modalBackgroundColor = 'rgb(255, 255, 255)';
        acceptButtonColor = 'black';
        acceptButtonFontColor = 'white';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'white';
        rejectButtonBorder = '1px solid black';
        rejectButtonFontColor = 'black';
        closeButtonIcon = blackImageUrl;
        cookieIcon = ccImageUrl;
        closeButtonWidth = '25px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'black';
    } else if (selectedTheme === 'Sense') {
        modalBackgroundColor = 'rgb(255, 220, 194)';
        acceptButtonColor = 'rgb(185, 219, 47)';
        acceptButtonFontColor = 'black';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(255, 220, 194)';
        rejectButtonBorder = '1px solid black';
        rejectButtonFontColor = 'black';
        closeButtonIcon = blackImageUrl;
        cookieIcon = ccImageUrl;
        closeButtonWidth = '25px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'black';
    } else if (selectedTheme === 'Golden') {
        modalBackgroundColor = 'rgb(29, 29, 29)';
        acceptButtonColor = 'rgb(242, 194, 50)';
        acceptButtonFontColor = 'black';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(29, 29, 29)';
        rejectButtonBorder = '1px solid white';
        rejectButtonFontColor = 'white';
        closeButtonIcon = yeImageUrl;
        cookieIcon = yellowImageUrl;
        closeButtonWidth = '20px';
        modalImagewidth = '40px';
        modalTitleFontColor = 'white';
    } else if (selectedTheme === 'Christmas') {
        modalBackgroundColor = 'rgb(22, 91, 51)';
        acceptButtonColor = 'red';
        acceptButtonFontColor = 'white';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(22, 91, 51)';
        rejectButtonBorder = '1px solid white';
        rejectButtonFontColor = 'white';
        closeButtonIcon = whiteImageUrl;
        cookieIcon = whImageUrl;
        closeButtonWidth = '25px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'white';
    } else if (selectedTheme === 'Elegant') {
        modalBackgroundColor = 'rgb(246, 239, 235)';
        acceptButtonColor = 'rgb(163, 128, 100)';
        acceptButtonFontColor = 'white';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(246, 239, 235)';
        rejectButtonBorder = '1px solid black';
        rejectButtonFontColor = 'black';
        closeButtonIcon = brImageUrl;
        cookieIcon = brownImageUrl;
        closeButtonWidth = '18px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'black';
    } else if (selectedTheme === 'Dark theme') {
        modalBackgroundColor = 'rgb(16, 24, 47)';
        acceptButtonColor = 'white';
        acceptButtonFontColor = 'black';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(16, 24, 47)';
        rejectButtonBorder = '1px solid white';
        rejectButtonFontColor = 'white';
        closeButtonIcon = whiteImageUrl;
        cookieIcon = whImageUrl;
        closeButtonWidth = '25px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'white';
    } else if (selectedTheme === 'Autumn') {
        modalBackgroundColor = 'rgb(251, 200, 154)';
        acceptButtonColor = 'rgb(163, 72, 0)';
        acceptButtonFontColor = 'white';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(251, 200, 154)';
        rejectButtonBorder = '1px solid rgb(163, 72, 0)';
        rejectButtonFontColor = 'rgb(163, 72, 0)';
        closeButtonIcon = brImageUrl;
        cookieIcon = brownImageUrl;
        closeButtonWidth = '18px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'black';
    } else if (selectedTheme === 'Crave') {
        modalBackgroundColor = 'rgb(145, 15, 63)';
        acceptButtonColor = 'white';
        acceptButtonFontColor = 'rgb(145, 15, 63)';
        acceptButtonBorder = 'none';
        acceptButtonBorderRadius = '10px';
        rejectButtonColor = 'rgb(145, 15, 63)';
        rejectButtonBorder = '1px solid white';
        rejectButtonFontColor = 'white';
        closeButtonIcon = whiteImageUrl;
        cookieIcon = whImageUrl;
        closeButtonWidth = '25px';
        modalImagewidth = '35px';
        modalTitleFontColor = 'white';
    }

    // Check the selected theme and construct the banner accordingly
    if (selectedTheme === 'Basic') {
        banner.innerHTML = `
            <div style='background-color:rgb(248, 248, 248) ; width:100%;border-top:1px solid lightgray;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${greenImageUrl}' alt="Cookie" width='40px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${cgImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style='font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px;'>We keep your privacy</h3>
                    <p style='font-size: 15px; margin-left: 70px;'>
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style='text-decoration: underline;'>Privacy Policy</span>
                    </p>
                <div style='margin-left: 70px; padding-bottom: 15px;'>
                    <div style='display: flex; gap: 5px;'>
                        ${bannerType === 'accept-only' ? `
                            <div style='cursor:pointer;background-color: rgb(26, 172, 122);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center;color:white; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style='cursor:pointer;background-color: rgb(26, 172, 122); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center;color:white; border-radius: 10px;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style='cursor:pointer;color:white;background-color: rgb(26, 172, 122);padding-left:22px; padding-top:3px; width:90px; height:35px; align: center; border-radius: 10px;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style='padding-left:10px;padding-top:3px;cursor:pointer; text-decoration:underline; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Light theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;border-top:1px solid lightgray;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${ccImageUrl}' alt="Cookie" width='33px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${blackImageUrl}' alt="close" width='22px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style='font-weight: 650;font-size:18px;margin-left: 70px; margin-top: -20px;margin-bottom:-10px;'>We keep your privacy</h3>
                    <p style='font-size: 15px; margin-left: 70px;'>
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style='text-decoration: underline;'>Privacy Policy</span>
                    </p>
                <div style='margin-left: 70px; padding-bottom: 15px;'>
                    <div style='display: flex; gap: 5px;'>
                        ${bannerType === 'accept-only' ? `
                            <div style='cursor:pointer;border: 1px solid black; background-color: black; color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style='cursor:pointer;border: 1px solid black; background-color: black; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style='cursor:pointer;border: 1px solid black; background-color: black; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style='padding-left:10px;cursor:pointer;padding-top:3px; text-decoration:underline; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Sense') {
        banner.innerHTML = `
            <div style='background-color: rgb(255, 220, 194); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${ccImageUrl}' alt="Cookie" width='33px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${blackImageUrl}' alt="close" width='22px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline;">Privacy Policy</span>
                    </p>
                <div style=" margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: rgb(185, 219, 47); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: rgb(185, 219, 47);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;background-color: rgb(185, 219, 47); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="padding-left:10px;padding-top:3px;cursor:pointer; text-decoration:underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
         `;
    } else if (selectedTheme === 'Golden') {
        banner.innerHTML = `
            <div style='background-color: rgb(29, 29, 29); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${yellowImageUrl}' alt="Cookie" width='40px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${yeImageUrl}' alt="close" width='18px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px;margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline;">Privacy Policy</span>
                    </p>
                <div style=" margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Christmas') {
        banner.innerHTML = `
            <div style='background-color: rgb(22, 91, 51); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${whImageUrl}' alt="Cookie" width='38px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${whiteImageUrl}' alt="close" width='20px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px;color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline; color: rgb(242, 194, 50);">Privacy Policy</span>
                    </p>
                <div style=" margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Neumorphism') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;border-top:1px solid lightgray;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${grayImageUrl}' alt="Cookie" width='40px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${gracImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px;margin-top: -20px;margin-bottom:-10px;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style="text-decoration: underline; font-weight: 650;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 20px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 20px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;border: 1px solid black;padding-left:22px;box-shadow:5px 5px 10px rgba(0, 0, 0, 0.5); padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 20px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:3px; text-decoration :underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Elegant') {
        banner.innerHTML = `
            <div style='background-color: rgb(246, 239, 235); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${brownImageUrl}' alt="Cookie" width='35px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${brImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px;margin-top: -20px;margin-bottom:-10px;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style="text-decoration: underline;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:25px;padding-top:5px;width:100px;height:40px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:25px;padding-top:5px;width:100px;height:40px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:5px; text-decoration:underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Dark theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(16, 24, 47); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${whImageUrl}' alt="Cookie" width='38px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${whiteImageUrl}' alt="close" width='20px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px;margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <span style="text-decoration: underline; color: white;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;background-color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Autumn') {
        banner.innerHTML = `
            <div style='background-color:rgb(251, 200, 154) ; width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'> 
                <img src='${brownImageUrl}' alt="Cookie" width='35px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${brImageUrl}' alt="close" width='15px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: rgb(163, 72, 0);">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: rgb(163, 72, 0);">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline; color: rgb(163, 72, 0);">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:3px; text-decoration:underline;color: rgb(163, 72, 0); margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Crave') {
        banner.innerHTML = `
            <div style='background-color:rgb(145, 15, 63); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;'>
                <img src='${whImageUrl}' alt="Cookie" width='38px' style='margin-bottom: -30px;margin-top:15px; margin-left: 20px;' />
                <img id="closeBanner" src='${whiteImageUrl}' alt="close" width='20px' style='margin-left: 1489px;margin-top:10px;cursor:pointer;' />
                    <h3 style="font-weight: 650;font-size:18px; margin-left: 70px; margin-top: -20px;margin-bottom:-10px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 15px; margin-left: 70px; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <span style="text-decoration: underline; color: white;">Privacy Policy</span>
                    </p>
                <div style="margin-left: 70px; padding-bottom: 15px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="cursor:pointer;background-color: white; padding-left:22px;color:rgb(145, 15, 63); padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="cursor:pointer;background-color: white;color:rgb(145, 15, 63); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white;color:rgb(145, 15, 63); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:3px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    document.body.appendChild(banner);

    // Add event listener to close the banner when the close button is clicked
    document.getElementById('closeBanner').addEventListener('click', function() {
        banner.style.display = 'none'; // Hides the banner
    });

    // Add event listener to the "Accept" button
    document.getElementById("acceptButton").addEventListener("click", function() {
        // Set cookies for functional, analytics, and marketing
        document.cookie = "functional=true; path=/; expires=" + new Date(new Date().getTime() + 365*24*60*60*1000).toUTCString();
        document.cookie = "analytics=true; path=/; expires=" + new Date(new Date().getTime() + 365*24*60*60*1000).toUTCString();
        document.cookie = "marketing=true; path=/; expires=" + new Date(new Date().getTime() + 365*24*60*60*1000).toUTCString();
        
        // Optional: Display a message or close the banner after accepting
        banner.style.display = 'none';
    });

    // Add event listener to the "Reject" button if present
    if (document.getElementById("rejectButton")) {
        document.getElementById("rejectButton").addEventListener("click", function() {
            // You can set cookies to reflect the user's choice to reject cookies
            document.cookie = "functional=false; path=/; expires=" + new Date(new Date().getTime() + 365*24*60*60*1000).toUTCString();
            document.cookie = "analytics=false; path=/; expires=" + new Date(new Date().getTime() + 365*24*60*60*1000).toUTCString();
            document.cookie = "marketing=false; path=/; expires=" + new Date(new Date().getTime() + 365*24*60*60*1000).toUTCString();

            // Optional: Hide the banner after rejecting cookies
            banner.style.display = 'none';
        });
    }

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
    modalContainer.id = 'preferencesModal'; 
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
    

    // Create the image element
    const modalImage = document.createElement('img');
    modalImage.src = cookieIcon; // Replace with the correct image URL or variable holding the URL
    modalImage.alt = 'cookie Icon';
    modalImage.style.width = modalImagewidth; // Adjust the size based on your preference
    modalImage.style.marginLeft = '380px'; // Optional: Add some space between the image and the title
    modalImage.style.marginBottom = '30px';

    // Create a container for the image and the title
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center'; // Vertically align image and title

    // Add modal title
    const modalTitle = document.createElement('h3');
    modalTitle.style.fontWeight = '650';
    modalTitle.style.marginBottom = '10px';
    modalTitle.style.marginTop = '50px';
    modalTitle.style.marginLeft = '-180px';
    modalTitle.style.color = modalTitleFontColor;
    modalTitle.textContent = 'Select type of Cookies you accept using.';

    // Append the image and the title to the container
    titleContainer.appendChild(modalImage);
    titleContainer.appendChild(modalTitle);

    // Append the container to the modal content
    modalContent.appendChild(titleContainer);


    // Add the "Accept All" button
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept All';
    acceptButton.style.backgroundColor = acceptButtonColor;
    acceptButton.style.color = acceptButtonFontColor;
    acceptButton.style.border = acceptButtonBorder;
    acceptButton.style.borderRadius = acceptButtonBorderRadius;
    acceptButton.style.padding = '10px';
    acceptButton.style.width = '100px';
    acceptButton.style.marginLeft = '300px';
    acceptButton.style.marginBottom = '20px';
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
    rejectButton.style.color = rejectButtonFontColor;
    rejectButton.style.width = '100px';
    rejectButton.style.border = rejectButtonBorder;
    rejectButton.style.borderRadius = '10px';
    rejectButton.style.padding = '10px';
    rejectButton.addEventListener('click', () => {
        if (rejectButton.textContent === 'Save Consent') {
            // Logic to save consent with selected checkboxes
            console.log('Consent saved with selected preferences.');
        } else {
            // Logic to reject all non-essential cookies
            console.log('All non-essential cookies rejected.');
        }
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

    // Function to update reject button text based on checkbox state
    function updateRejectButtonText() {
        const checkboxes = modalContent.querySelectorAll('input[type="checkbox"]');
        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        rejectButton.textContent = anyChecked ? 'Save Consent' : 'Reject';
        rejectButton.style.width = '120px';
    }

    // Create sections in the modal
        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section';

            // Create section title
            const sectionTitle = document.createElement('strong');
            sectionTitle.textContent = section.title;
            sectionDiv.appendChild(sectionTitle);

            // Create styled checkbox if applicable
            if (section.checkbox) {
                const checkboxContainer = document.createElement('label');
                checkboxContainer.style.position = 'relative';
                checkboxContainer.style.display = 'inline-block';
                checkboxContainer.style.width = '20px'; // Change width for visual size
                checkboxContainer.style.height = '20px'; // Change height for visual size
                checkboxContainer.style.marginLeft = '10px';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.opacity = '0'; // Hide the actual checkbox
                checkbox.style.position = 'absolute'; // Position it absolutely
                checkbox.style.cursor = 'pointer';
                checkbox.style.width = '100%'; // Cover the entire container
                checkbox.style.height = '100%'; // Cover the entire container

                // Create a visual representation of the checkbox
                const customCheckbox = document.createElement('span');
                customCheckbox.style.position = 'absolute';
                customCheckbox.style.top = '0';
                customCheckbox.style.left = '0';
                customCheckbox.style.width = '100%';
                customCheckbox.style.height = '100%';
                customCheckbox.style.border = '2px solid #ccc'; // Border color
                customCheckbox.style.borderRadius = '5px'; // Rounded corners
                customCheckbox.style.backgroundColor = 'white'; // Background color
                customCheckbox.style.transition = 'background-color 0.3s, border-color 0.3s'; // Transition effects
                customCheckbox.style.marginTop = '5px';

                // Create span for black checkmark
                const checkmark = document.createElement('span');
                checkmark.textContent = '✓'; // Checkmark symbol
                checkmark.style.color = 'black'; // Black color for the checkmark
                checkmark.style.position = 'absolute';
                checkmark.style.top = '2px'; // Adjust position as needed
                checkmark.style.left = '2px'; // Adjust position as needed
                checkmark.style.fontSize = '16px'; // Adjust size as needed
                checkmark.style.display = 'none'; // Hide initially

            
            // Change color when checked
            checkbox.addEventListener('change', () => {
                customCheckbox.style.backgroundColor = checkbox.checked ? 'black' : 'white';
                customCheckbox.style.borderColor = checkbox.checked ? 'black' : '#ccc';
                checkmark.style.display = checkbox.checked ? 'block' : 'none';
                checkmark.style.color = checkbox.checked ? 'white' : 'black';

                // Update reject button text based on checkbox states
                updateRejectButtonText();
            });

            // Handle right-click to toggle checkbox
            checkboxContainer.addEventListener('contextmenu', (event) => {
                event.preventDefault(); // Prevent the default context menu
                checkbox.checked = !checkbox.checked; // Toggle the checkbox state
                checkbox.dispatchEvent(new Event('change')); // Trigger change event manually
            });

            // Append checkbox and visual representation to the container
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(customCheckbox);
            checkboxContainer.appendChild(checkmark); // Append checkmark
            sectionDiv.appendChild(checkboxContainer);
    }

    // Create section description
    const sectionDesc = document.createElement('p');
    sectionDesc.textContent = section.description;
    sectionDiv.appendChild(sectionDesc);

    // Append section to modal content
    modalContent.appendChild(sectionDiv);
});



    // Add the close button
    const closeButton = document.createElement('img');
    closeButton.src = closeButtonIcon; // Apply the close button icon based on the theme
    closeButton.alt = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginRight = '360px';
    closeButton.style.marginTop = '45px';
    closeButton.style.width = closeButtonWidth;
    closeButton.addEventListener('click', closePreferencesModal);
    modalContent.appendChild(closeButton);

    // Append modal content to modal container
    modalContainer.appendChild(modalContent);

    // Append modal to the body
    document.body.appendChild(modalContainer);
}

// Function to close the modal
function closePreferencesModal() {
    const modal = document.getElementById('preferencesModal'); // Use the ID to select the modal
    if (modal) {
        document.body.removeChild(modal); // Remove the modal from the DOM
    }
}


// Call the function to fetch store data and display the banner
fetchStoreData();