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
let banner = document.createElement('div'); 

// Function to create and display the banner based on banner type
async function displayBanner(bannerType, selectedCountries, selectedTheme) {

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
                            <div id="acceptButton" style='cursor:pointer;background-color: rgb(26, 172, 122);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center;color:white; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style='cursor:pointer;background-color: rgb(26, 172, 122); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center;color:white; border-radius: 10px;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style='cursor:pointer;color:white;background-color: rgb(26, 172, 122);padding-left:22px; padding-top:3px; width:90px; height:35px; align: center; border-radius: 10px;'>Accept</div>
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
                            <div id="acceptButton" style='cursor:pointer;border: 1px solid black; background-color: black; color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style='cursor:pointer;border: 1px solid black; background-color: black; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style='cursor:pointer;border: 1px solid black; background-color: black; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;'>Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(185, 219, 47); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(185, 219, 47);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(185, 219, 47); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: red; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 10px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 20px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;border: 1px solid black; padding-left:22px; padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 20px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;border: 1px solid black;padding-left:22px;box-shadow:5px 5px 10px rgba(0, 0, 0, 0.5); padding-top:3px; width:90px; height:35px;align-items: center; border-radius: 20px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:25px;padding-top:5px;width:100px;height:40px; align-items: center; border-radius: 10px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: white;padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0);padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
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
                            <div id="acceptButton" style="cursor:pointer;background-color: white; padding-left:22px;color:rgb(145, 15, 63); padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white;color:rgb(145, 15, 63); padding-left:22px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;">Accept</div>
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
    const acceptBtn = document.getElementById("acceptButton");
    if (acceptBtn) {
        acceptBtn.addEventListener("click", function() {
            console.log("Accept button clicked."); // Debugging line
            // Set cookies for functional, analytics, and marketing
            document.cookie = "functional=true; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "analytics=true; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "marketing=true; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();

            // Hide the banner after accepting
            banner.style.display = 'none';
        });
    }

    // Function to get a specific cookie value by name
    function getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    }

    // Check for Functional Cookies
    if (getCookie('functional') === 'true') {
        banner.style.display = 'none';
        // Functional cookies are enabled, proceed with functional scripts
        console.log("Functional cookies are enabled");
        enableFunctionalFeatures();
        // Shopify Customer Privacy and Global Privacy Control (GPC) can be initialized here
        initShopifyCustomerPrivacy();
        initGPC();
    } else {
        banner.style.display = 'block';
    }

    // Check for Analytics Cookies
    if (getCookie('analytics') === 'true') {
        banner.style.display = 'none';
        // Analytics cookies are enabled, start Google Consent Mode V2
        console.log("Analytics cookies are enabled");
        loadAnalytics();
    } else {
        banner.style.display = 'block';
    }

    // Check for Marketing Cookies
    if (getCookie('marketing') === 'true') {
        banner.style.display = 'none';
        // Marketing cookies are enabled, load Meta Pixel and TikTok Pixel
        console.log("Marketing cookies are enabled");
        loadMarketing();
    } else {
        banner.style.display = 'block';
    }

    // Enable functional features like Shopify Customer Privacy and GPC
    function enableFunctionalFeatures() {
        // Example: User Session Management, Language Preferences, Theme Preferences
        manageUserSession();
        initializeCart();
    }

    function manageUserSession() {
        // Check if user is logged in (this could be from a cookie, local storage, or an API call)
        const userSession = getSessionData(); // Example: Fetch session data from storage or API
    
        if (userSession) {
            console.log("User is logged in:", userSession);
            // Perform actions for logged-in users
            displayUserProfile(userSession);
        } else {
            console.log("User is not logged in.");
            // Redirect to login or show login options
            showLoginPrompt();
        }
    }
    
    // Mock function to fetch session data
    function getSessionData() {
        // Here you would typically fetch from local storage or an API
        return JSON.parse(localStorage.getItem('userSession')); // Example of retrieving session data
    }
    
    // Function to display user profile
    function displayUserProfile(userSession) {
        // Code to display user information in the UI
        console.log(`Welcome back, ${userSession.username}!`);

        // Example: Update the UI to show user profile information
        const profileDiv = document.getElementById('userProfile');
        if (profileDiv) {
            profileDiv.innerHTML = `Welcome back, <strong>${userSession.username}</strong>!`;
        }
    }
    
    // Function to show login prompt
    function showLoginPrompt() {
        console.log("Please log in to access your account.");
    }

    function initializeCart() {
        // Get cart data from local storage or an API
        const cartData = JSON.parse(localStorage.getItem('shoppingCart')) || []; // Default to an empty cart
        console.log("Initializing cart with data:", cartData);
        
        // Render cart items in the UI
        renderCartItems(cartData);
    }
    
    // Example function to render cart items
    function renderCartItems(cartData) {
        // Code to update the UI with cart items
        if (cartData.length === 0) {
            console.log("Your cart is empty.");
        } else {
            cartData.forEach(item => {
                console.log(`Cart item: ${item.name}, Quantity: ${item.quantity}`);
                // Add code to display each item in the UI
            });
        }
    }    

    // Initialize Shopify Customer Privacy (example)
    function initShopifyCustomerPrivacy() {
        // Check if Shopify's privacy API is available
        if (window.Shopify && Shopify.customerPrivacy) {
            // Initialize the Shopify customer privacy API
            console.log("Initializing Shopify Customer Privacy");
    
            // Retrieve user's privacy preferences (as an example)
            Shopify.customerPrivacy.getTrackingConsent(function (consentStatus) {
                if (consentStatus === 'granted') {
                    console.log("Tracking consent granted by user.");
                    // Load analytics or tracking scripts as per user's consent
                    loadAnalytics();
                    loadMarketing();
                } else if (consentStatus === 'denied') {
                    console.log("Tracking consent denied by user.");
                    // Prevent loading tracking or analytics scripts
                } else {
                    console.log("Tracking consent not yet provided.");
                }
            });
        } else {
            console.warn("Shopify Customer Privacy API is not available.");
        }
    }    

    // Initialize Global Privacy Control (GPC)
    function initGPC() {
        console.log("Initializing Global Privacy Control (GPC)");
    
        // Check if the browser supports GPC and if GPC is enabled
        if (navigator.globalPrivacyControl) {
            const gpcEnabled = navigator.globalPrivacyControl;
    
            if (gpcEnabled) {
                console.log("GPC signal detected: User does not want tracking.");
                // Call the function to disable tracking scripts
                disableTracking();
            } else {
                console.log("No GPC signal detected.");
                // If GPC is not enabled, allow tracking scripts
                loadAnalytics();
                loadMarketing();
            }
        } else {
            console.log("Global Privacy Control (GPC) is not supported by this browser.");
            // Fallback: If GPC is not supported, continue as usual
            loadAnalytics();
            loadMarketing();
        }
    }
    
    // Function to disable tracking scripts (for GPC opt-out)
    function disableTracking() {
        // Block loading of analytics and marketing scripts
        console.log("Disabling all tracking scripts due to GPC.");
    
        // Disable Google Analytics
        window['ga-disable-UA-XXXXXXXXX-X'] = true;  // Replace with your Google Analytics ID
    
        // Optionally, remove previously added tracking scripts
        // Remove Google Analytics script
        const gaScript = document.querySelector("script[src*='googletagmanager']");
        if (gaScript) {
            gaScript.remove();
            console.log("Google Analytics script removed.");
        }
    
        // Remove Meta Pixel script (if already loaded)
        const metaPixelScript = document.querySelector("script[src*='fbevents']");
        if (metaPixelScript) {
            metaPixelScript.remove();
            console.log("Meta Pixel script removed.");
        }
    
        // Remove TikTok Pixel script (if already loaded)
        const tiktokPixelScript = document.querySelector("script[src*='analytics.tiktok']");
        if (tiktokPixelScript) {
            tiktokPixelScript.remove();
            console.log("TikTok Pixel script removed.");
        }
    
        // Add more removals for other tracking scripts as needed
    }

    // Function to load Google Consent Mode V2 for analytics
    function loadAnalytics() {
        (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','G-XXXXXX'); // Replace 'G-XXXXXX' with your GA4 ID
    }    

    function loadMarketing() {
        // Load Meta Pixel (Facebook Pixel)
        !function(f,b,e,v,n,t,s) {
            if(f.fbq) return; n = f.fbq = function() {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if(!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', 'XXXXXXXXXXXXXX');  // Replace 'XXXXXXXXXXXXXX' with your Meta Pixel ID
        fbq('track', 'PageView');
    
        // Load TikTok Pixel
        !function(w,d,t) {
            w.TiktokAnalyticsObject=t;
            var ttq=w[t]=w[t]||[];
            ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],
            ttq.setAndDefer=function(t,e){
                t[e]=function(){
                    t.push([e].concat(Array.prototype.slice.call(arguments,0)))
                }
            };
            for(var i=0;i<ttq.methods.length;i++) ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){
                for(var e=ttq._i[t]||[],n=0;n<e.length;n++) ttq[e[n]]()
            };
            ttq.load=function(e,n){
                var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{};
                ttq._i[e]=ttq._i[e]||[],ttq._i[e].push(n),ttq._u=i;
                var o=d.createElement("script");
                o.type="text/javascript",o.async=!0,o.src=i;
                var a=d.getElementsByTagName("script")[0];
                a.parentNode.insertBefore(o,a)
            };
            ttq.load('YYYYYYYYYYYYYY');  // Replace 'YYYYYYYYYYYYYY' with your TikTok Pixel ID
            ttq.page();
        }(window, document, 'ttq');

        // Load HubSpot Tracking Code
        !function(d,s,i) {
            var h=d.getElementsByTagName(s)[0];
            if(d.getElementById(i)) return;
            var js=d.createElement(s); js.id=i; js.src='https://js.hubspot.com/cs.js';
            h.parentNode.insertBefore(js, h);
        }(document, 'script', 'hubspot-script');

        window._hsq = window._hsq || [];
        _hsq.push(['setAccount', 'YOUR_HUBSPOT_ACCOUNT_ID']);  // Replace with your HubSpot Account ID
        _hsq.push(['trackPageView']);

        // Load Google Ads Conversion Tracking Code
        !function(g,s,n){
            g.gtag = g.gtag || function(){(g.gtag.q=g.gtag.q||[]).push(arguments)};
            g.gtag.l = 1 * new Date();
            var script = s.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX'; // Replace 'AW-XXXXXXXXXX' with your Google Ads ID
            script.async = true;
            s.getElementsByTagName('head')[0].appendChild(script);
        }(window, document);

        gtag('js', new Date());
        gtag('config', 'AW-XXXXXXXXXX'); // Replace 'AW-XXXXXXXXXX' with your Google Ads ID
    }    

    // Add event listener to the "Reject" button if present
    const rejectBtn = document.getElementById("rejectButton");
    if (rejectBtn) {
        rejectBtn.addEventListener("click", function() {
            console.log("Reject button clicked."); // Debugging line
            // You can set cookies to reflect the user's choice to reject cookies
            document.cookie = "functional=false; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "analytics=false; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "marketing=false; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();

            // Hide the banner after rejecting cookies
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
    
    banner.style.opacity = 0.5;
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
        document.cookie = `functional=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()}`; // Store functional cookie
        document.cookie = `analytics=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()}`; // Store analytics cookie
        document.cookie = `marketing=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()}`; // Store marketing cookie
        
        console.log('All cookies accepted.');
        banner.style.display='none';
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
        // Logic for saving consent if button is 'Save Consent'
        if (rejectButton.textContent === 'Save Consent') {
            sections.forEach(section => {
                if (section.checkbox) {
                    const checkbox = modalContent.querySelectorAll('input[type="checkbox"]')[sections.indexOf(section)];
    
                    // Set cookies based on the checked state
                    if (checkbox.checked) {
                        document.cookie = `${section.cookieName}=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()};`; // Expires in 1 year
                    } else {
                        // Clear the cookie if unchecked
                        document.cookie = `${section.cookieName}=; path=/; max-age=0`;
                    }
                }
                banner.style.display = 'none';
                closePreferencesModal();
            });
            closePreferencesModal();
        } else {
            // Logic to reject all non-essential cookies
            console.log('All non-essential cookies rejected.');
        }
    
        // Close the preferences modal
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

    // Close modal on 'Esc' key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closePreferencesModal();
        }
    });

    // Close modal when clicking outside
    modalContainer.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            closePreferencesModal();
        }
    });
}

// Close modal function
function closePreferencesModal() {
    banner.style.opacity = 1;
    const modalContainer = document.getElementById('preferencesModal');
    if (modalContainer) {
        modalContainer.remove(); // Remove modal from DOM
    }
    document.removeEventListener('keydown', closePreferencesModal); // Clean up
}


// Call the function to fetch store data and display the banner
fetchStoreData();