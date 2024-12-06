 function getShopUrl() {
    let shopUrl = sessionStorage.getItem('shopUrl') || new URLSearchParams(window.location.search).get('shop');
    if (!shopUrl && window.Shopify && window.Shopify.shop) {
        shopUrl = window.Shopify.shop;
    }
    if (shopUrl) sessionStorage.setItem('shopUrl', shopUrl);
    return shopUrl;
} 

async function getUserCountry() {
    try {
        // Replace with your Django endpoint URL
        const response = await fetch('http://127.0.0.1:8000/shopify_app/get_user_country/');
        
        if (!response.ok) {
            console.error(`Failed to fetch user country: ${response.status}`);
            return null;
        }

        const data = await response.json();
        if (data.error) {
            console.error('Error from backend:', data.error);
            return null;
        }

        return data.country;
    } catch (error) {
        console.error('Error fetching user country from backend:', error);
        return null;
    }
}

async function getUserIpAddress() {
    // Example: Use a service like ip-api or similar to fetch user's IP
    try {
        let response = await fetch('https://api.ipify.org?format=json');
        let data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Failed to fetch user IP address:", error);
        return null;
    }
}

async function storePreferencesInDb(preference, url, createdDate, ipAddress, shopUrl, selectedPreferences = {}) {
    const data = {
        preference: preference,
        url: url,
        createdDate: createdDate,
        ipAddress: ipAddress,
        shopUrl: shopUrl,
        selectedPreferences: selectedPreferences, // Include detailed preferences
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/shopify_app/cookie_save_preferences/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read error response as text
            console.error('Error response:', errorText); // Log the error response for debugging
            return;
        }

        const result = await response.json();
        console.log('Preferences stored in DB:', result);
    } catch (error) {
        console.error('Error storing preferences:', error);
    }
}

let bannerType, selectedCountries, selectedTheme;

async function fetchShopPreferences() {
    const shopUrl = getShopUrl();
    if (!shopUrl) {
        console.error('Shop URL not found');
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/display_shop_preferences/?shop_url=${shopUrl}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching shop preferences:', errorData.message);
            return;
        }

        const data = await response.json();
        console.log('Shop Preferences:', data);

        if (data.status === 'success') {
            const showReopenButton = data.preference.show_reopen_button;
            console.log('Show Reopen Button:', showReopenButton);

            if (showReopenButton) {
                createReopenBannerButton();
            }
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

async function createReopenBannerButton() {
    let reopenButton = document.createElement('button');
    reopenButton.innerText = "Reopen Banner";
    reopenButton.style.position = "fixed";
    reopenButton.style.bottom = "20px";
    reopenButton.style.right = "20px";
    reopenButton.style.padding = "10px 15px";
    reopenButton.style.backgroundColor = "white";
    reopenButton.style.color = "black";
    reopenButton.style.border = "none";
    reopenButton.style.borderRadius = "5px";
    reopenButton.style.cursor = "pointer";
    reopenButton.id = "reopenBannerButton";

    reopenButton.onclick = function() {
        // Call displayBanner using globally stored variables
        displayBanner(bannerType, selectedCountries, selectedTheme);
    };

    const userCountry = await getUserCountry();
    const isEditorMode = window.Shopify && Shopify.designMode;
    
    if (!isEditorMode && userCountry && selectedCountries.includes(userCountry)) {
        document.body.appendChild(reopenButton);
    } 
}

async function fetchStoreData() {

    const shopUrl = getShopUrl();
    if (!shopUrl) {
        console.error('Shop URL not found');
        return; 
    }else{
        console.log(shopUrl);
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_store_data/?shop_url=${shopUrl}`);
        const data = await response.json();

        if (response.ok) {
            const bannerType = data.banner_type;
            const selectedCountries = data.selected_countries;
            const selectedTheme = data.selected_theme;

            console.log('Banner Type:', bannerType);
            console.log('Selected Countries:', selectedCountries);
            console.log('Selected Theme:', selectedTheme);

            displayBanner(bannerType, selectedCountries, selectedTheme);
        } else {
            console.error('Error fetching store data:', data.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

let banner = document.createElement('div'); 

async function displayBanner(bannerType, selectedCountries, selectedTheme) {

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

    const shopUrl = getShopUrl();
    if (!shopUrl) {
        console.error('Shop URL not found');
        return; 
    }else{
        console.log(shopUrl);
    }

    // Fetch privacy policy settings from the backend
    const response = await fetch(`http://127.0.0.1:8000/shopify_app/privacy_policy_settings/?shop_url=${shopUrl}`);
    if (!response.ok) {
        console.error('Failed to fetch privacy policy settings');
        return;
    }

    const data = await response.json();
    
    // Determine the privacy policy link
    let privacyLink;
    if (data.show_google_privacy_policy) {
        privacyLink = "https://business.safety.google/privacy/";
    } else {
        // Determine the privacy policy link based on selected_option
        switch (data.selected_option) {
            case 'Shopify Policy':
                privacyLink = `https://${shopUrl}/policies/privacy-policy`;
                break;
            case 'GDPR Cookies Consent':
                privacyLink = `https://${shopUrl}/pages/gdpr-privacy-policy`;
                break;
            case 'PIPEDA Cookies Consent':
                privacyLink = `https://${shopUrl}/pages/pipeda-privacy-policy`;
                break;
            case 'CCPA Cookies Consent':
                privacyLink = `https://${shopUrl}/pages/ccpa-privacy-policy`;
                break;
            case 'LGPD Cookies Consent':
                privacyLink = `https://${shopUrl}/pages/lgpd-privacy-policy`;
                break;
            case 'APPI Cookies Consent':
                privacyLink = `https://${shopUrl}/pages/appi-privacy-policy`;
                break;
            default:
                privacyLink = `https://${shopUrl}/policies/privacy-policy`; // Fallback to default
        }
    } 

    // Prevent banner from displaying on privacy policy page
    const currentPath = window.location.pathname;
    const policyPaths = [
        '/policies/privacy-policy',
        '/pages/gdpr-privacy-policy',
        '/pages/pipeda-privacy-policy',
        '/pages/ccpa-privacy-policy',
        '/pages/lgpd-privacy-policy',
        '/pages/appi-privacy-policy'
    ];

    if (policyPaths.includes(currentPath)) {
        console.log('Banner not displayed on privacy policy page');
        return;
    }

    if (selectedTheme === 'Basic') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width: 100%; border-top: 1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${greenImageUrl}' alt="Cookie" style='width: 3vw; margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${cgImageUrl}' alt="close" style='width: 1vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                <h3 style='font-weight: 650; font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px;'>We keep your privacy</h3>
                <p style='font-size: 1.1vw; margin-left: 5vw;'>
                    This website uses cookies to make sure you get the best experience with us.
                    <a href="${privacyLink}" target="_blank" style='text-decoration: underline; color: inherit;'>Privacy Policy</a>
                </p>
                <div style='margin-left: 5vw; padding-bottom: 15px;'>
                    <div style='display: flex; gap: 10px; flex-wrap: wrap;'>
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style='cursor: pointer; background-color: rgb(26, 172, 122); padding-left: 20px; padding-top: 2px; width: 90px; height: 35px; display: flex; align-items: center; color: white; border-radius: 10px; text-align: center;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style='cursor: pointer; padding-left: 20px; padding-top: 2px; width: 90px; height: 35px; display: flex; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px; text-align: center;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style='cursor: pointer; background-color: rgb(26, 172, 122); padding-left: 20px; padding-top: 2px; width: 90px; height: 35px; display: flex; align-items: center; color: white; border-radius: 10px; text-align: center;'>Accept</div>
                            <div id="rejectButton" style='cursor: pointer; padding-left: 20px; padding-top: 2px; width: 90px; height: 35px; display: flex; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px; text-align: center;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style='cursor: pointer; color: white; background-color: rgb(26, 172, 122); padding-left: 20px; padding-top: 2px; width: 90px; height: 35px; display: flex; align-items: center; border-radius: 10px; text-align: center;'>Accept</div>
                            <div id="rejectButton" style='cursor: pointer; padding-left: 20px; padding-top: 2px; width: 90px; height: 35px; display: flex; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px; text-align: center;'>Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style='padding-left: 10px; padding-top: 2px; cursor: pointer; text-decoration: underline; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Light theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;border-top:1px solid lightgray;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${ccImageUrl}' alt="Cookie"  style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${blackImageUrl}' alt="close" style='width: 1.5vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style='font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px;'>We keep your privacy</h3>
                    <p style='font-size: 1.1vw; margin-left: 5vw;'>
                        This website uses cookies to make sure you get the best experience with us. 
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: inherit;'>Privacy Policy</a>
                    </p>
                <div style='margin-left: 5vw; padding-bottom: 15px;'>
                    <div style='display: flex; gap: 10px; flex-wrap: wrap;'>
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style='cursor:pointer;border: 1px solid black; background-color: black; color: white;padding-left:20px; padding-top:2px; display: flex; width:90px; height:35px; align-items: center; border-radius: 10px;text-align: center;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style='cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex; border: 1px solid black; margin-left: 5px;text-align: center;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style='cursor:pointer;border: 1px solid black; background-color: black; color: white; padding-left:20px; padding-top:2px; display: flex; width:90px; height:35px; align-items: center; border-radius: 10px;text-align: center;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex; border: 1px solid black; margin-left: 5px;text-align: center;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style='cursor:pointer;border: 1px solid black; background-color: black; color: white; padding-left:20px; padding-top:2px; display: flex; width:90px; height:35px; align-items: center; border-radius: 10px;text-align: center;'>Accept</div>
                            <div id="rejectButton" style='cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex; border: 1px solid black; margin-left: 5px;text-align: center;'>Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style='padding-left:10px;cursor:pointer;padding-top:2px; text-decoration:underline; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Sense') {
        banner.innerHTML = `
            <div style='background-color: rgb(255, 220, 194); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${ccImageUrl}' alt="Cookie" style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${blackImageUrl}' alt="close" style='width: 1.5vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw;">
                        This website uses cookies to make sure you get the best experience with us.
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: inherit;'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(185, 219, 47); padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; display: flex; border-radius: 10px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(185, 219, 47);padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black; padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; display: flex; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(185, 219, 47); padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid black;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px; display: flex;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="padding-left:10px;padding-top:2px;cursor:pointer; text-decoration:underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
         `;
    } else if (selectedTheme === 'Golden') {
        banner.innerHTML = `
            <div style='background-color: rgb(29, 29, 29); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${yellowImageUrl}' alt="Cookie" style='width: 3vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${yeImageUrl}' alt="close" style='width: 1vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: inherit;'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(242, 194, 50); padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Christmas') {
        banner.innerHTML = `
            <div style='background-color: rgb(22, 91, 51); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${whImageUrl}' alt="Cookie" style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${whiteImageUrl}' alt="close"  style='width: 1.5vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px;color: white;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: rgb(242, 194, 50);'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: red; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: red; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: red; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex;align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Neumorphism') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;border-top:1px solid lightgray;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${grayImageUrl}' alt="Cookie"  style='width: 3vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${gracImageUrl}' alt="close"  style='width: 1vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;font-weight: 650;color: inherit;'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;border: 1px solid black; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 20px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; display: flex; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;border: 1px solid black; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex;align-items: center; border-radius: 20px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; display: flex; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;border: 1px solid black;padding-left:20px;box-shadow:5px 5px 10px rgba(0, 0, 0, 0.5); display: flex; padding-top:2px; width:90px; height:35px;align-items: center; border-radius: 20px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px;align-items: center;  display: flex;border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration :underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Elegant') {
        banner.innerHTML = `
            <div style='background-color: rgb(246, 239, 235); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${brownImageUrl}' alt="Cookie"  style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${brImageUrl}' alt="close"  style='width: 1vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: inherit;'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:20px; padding-top:2px; width:90px; display: flex; height:35px; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;padding-left:20px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 2px; display: flex; border: 1px solid black; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:20px; padding-top:2px; width:90px; display: flex;height:35px; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px; display: flex; border: 1px solid black; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 128, 100); color: white; padding-left:20px;padding-top:2px;width:100px; display: flex;height:40px; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;padding-left:20px;padding-top:2px;width:100px;height:40px; align-items: center; border-radius: 10px;  display: flex;border: 1px solid black; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration:underline; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Dark theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(16, 24, 47); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${whImageUrl}' alt="Cookie" style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${whiteImageUrl}' alt="close" style='width: 1.5vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw; color: white;">
                        This website uses cookies to make sure you get the best experience with us. 
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: white;'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white;padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; border-radius: 10px;text-align: center; display: flex;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white; padding-left:20px; padding-top:3px; width:90px; height:35px; align-items: center; border-radius: 10px;text-align: center; display: flex;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; align-items: center; display: flex; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Autumn') {
        banner.innerHTML = `
            <div style='background-color:rgb(251, 200, 154) ; width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'> 
                <img src='${brownImageUrl}' alt="Cookie" style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${brImageUrl}' alt="close"  style='width: 1vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px; color: rgb(163, 72, 0);">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw; color: rgb(163, 72, 0);">
                        This website uses cookies to make sure you get the best experience with us.
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: rgb(163, 72, 0);'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:20px; padding-top:2px; width:90px; display: flex; height:35px; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0);padding-left:20px; padding-top:2px; width:90px; display: flex;height:35px; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:20px; padding-top:2px; width:90px; display: flex; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: rgb(163, 72, 0); color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding-left:20px; padding-top:2px; width:90px; display: flex; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration:underline;color: rgb(163, 72, 0); margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Crave') {
        banner.innerHTML = `
            <div style='background-color:rgb(145, 15, 63); width:100%;border-top:1px solid lightgray; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; padding: 10px; box-sizing: border-box;'>
                <img src='${whImageUrl}' alt="Cookie" style='width: 2.5vw;margin-bottom: -45px; margin-top: 5px; margin-left: 1vw;' />
                <img id="closeBanner" src='${whiteImageUrl}' alt="close" style='width: 1.5vw; position: absolute; right: 10px; top: 10px; cursor: pointer;' />
                    <h3 style="font-weight: 650;font-size: 1.3vw; margin-left: 5vw; margin-top: -10px; margin-bottom: -5px; color: white;">We keep your privacy</h3>
                    <p style="font-size: 1.1vw; margin-left: 5vw; color: white;">
                        This website uses cookies to make sure you get the best experience with us.
                        <a href="${privacyLink}" target="_blank" style='text-decoration: underline;color: white;'>Privacy Policy</a>
                    </p>
                <div style="margin-left: 5vw; padding-bottom: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${bannerType === 'accept-only' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white; padding-left:20px;color:rgb(145, 15, 63); padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white;color:rgb(145, 15, 63); padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white;padding-left:20px; padding-top:2px; width:90px; height:35px; display: flex; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div id="acceptButton" style="cursor:pointer;background-color: white;color:rgb(145, 15, 63); padding-left:20px; padding-top:2px;display: flex; width:90px; height:35px; align-items: center; border-radius: 10px;text-align: center;">Accept</div>
                            <div id="rejectButton" style="cursor:pointer;border: 1px solid white; color: white; padding-left:20px; padding-top:2px;display: flex; width:90px; height:35px; align-items: center; border-radius: 10px; margin-left: 5px;text-align: center;">Reject</div>
                            <div onclick="openPreferencesModal('${modalBackgroundColor}', '${acceptButtonColor}', '${rejectButtonColor}')" style="cursor:pointer;padding-left:10px;padding-top:2px; text-decoration:underline;color:white; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    const userCountry = await getUserCountry();
    const currentPageUrl = window.location.href;
    const createdDate = new Date().toISOString();
    const userIpAddress = await getUserIpAddress();

    console.log('User Country:', userCountry);

    const isEditorMode = window.Shopify && Shopify.designMode;
    
    if (!isEditorMode && userCountry && selectedCountries.includes(userCountry)) {
        document.body.appendChild(banner);
    } 

    const closeBtn = document.getElementById('closeBanner');
    if(closeBtn){
        closeBtn.addEventListener('click', function() {
            banner.style.display = 'none';
        });
    }

    const acceptBtn = document.getElementById("acceptButton");
    if (acceptBtn) {
        acceptBtn.addEventListener("click", function() {
            console.log("Accept button clicked."); 
            document.cookie = "functional=true; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "analytics=true; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "marketing=true; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();

            storePreferencesInDb('accept', currentPageUrl, createdDate, userIpAddress, shopUrl, {
                functional: true,
                analytics: true,
                marketing: true,
            });

            banner.style.display = 'none';
        });
    }

    function getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    }

    if (getCookie('functional') === 'true') {
        // banner.style.display = 'none';
        console.log("Functional cookies are enabled");
        enableFunctionalFeatures();
        initShopifyCustomerPrivacy();
        initGPC();
    } else {
        banner.style.display = 'block';
    }

    if (getCookie('analytics') === 'true') {
        // banner.style.display = 'none';
        console.log("Analytics cookies are enabled");
        loadAnalytics();
    } else {
        banner.style.display = 'block';
    }

    if (getCookie('marketing') === 'true') {
        // banner.style.display = 'none';
        console.log("Marketing cookies are enabled");
        loadMarketing();
    } else {
        banner.style.display = 'block';
    }

    function enableFunctionalFeatures() {
        manageUserSession();
        initializeCart();
    }

    function manageUserSession() {
        const userSessionData = localStorage.getItem('userSession');
        if (userSessionData) {
            try {
                const userSession = JSON.parse(userSessionData);
                console.log("User is logged in:", userSession);
                displayUserProfile(userSession);
            } catch (error) {
                console.error("Error parsing user session data:", error);
                showLoginPrompt(); // Show login prompt if data is corrupted
            }
        } else {
            console.log("User is not logged in.");
            showLoginPrompt();
        }
    }
    
    function displayUserProfile(userSession) {
        console.log(`Welcome back, ${userSession.username}!`);

        const profileDiv = document.getElementById('userProfile');
        if (profileDiv) {
            profileDiv.innerHTML = `Welcome back, <strong>${userSession.username}</strong>!`;
        }
    }
    
    function showLoginPrompt() {
        console.log("Please log in to access your account.");
    }

    function initializeCart() {
        const cartDataRaw = localStorage.getItem('cart_items');
        if (cartDataRaw) {
            try {
                const cartData = JSON.parse(cartDataRaw);
                console.log("Initializing cart with data:", cartData);
                renderCartItems(cartData);
            } catch (error) {
                console.error("Error parsing cart data:", error);
                renderCartItems([]); // Display an empty cart if data is corrupted
            }
        } else {
            console.log("Shopping cart data not found. Initializing with an empty cart.");
            renderCartItems([]); // Initialize an empty cart if no data found
        }
    }
    
    function renderCartItems(cartData) {
        if (cartData.length === 0) {
            console.log("Your cart is empty.");
        } else {
            cartData.forEach(item => {
                console.log(`Cart item: ${item.name}, Quantity: ${item.quantity}`);
            });
        }
    }    

    function initShopifyCustomerPrivacy() {
        if (window.Shopify && Shopify.customerPrivacy) {
            console.log("Initializing Shopify Customer Privacy");
    
            Shopify.customerPrivacy.getTrackingConsent(function (consentStatus) {
                if (consentStatus === 'granted') {
                    console.log("Tracking consent granted by user.");
                    loadAnalytics();
                    loadMarketing();
                } else if (consentStatus === 'denied') {
                    console.log("Tracking consent denied by user.");
                } else {
                    console.log("Tracking consent not yet provided.");
                }
            });
        } else {
            console.warn("Shopify Customer Privacy API is not available.");
        }
    }    

    function initGPC() {
        console.log("Initializing Global Privacy Control (GPC)");

        if (navigator.globalPrivacyControl) {
            const gpcEnabled = navigator.globalPrivacyControl;
    
            if (gpcEnabled) {
                console.log("GPC signal detected: User does not want tracking.");
                disableTracking();
            } else {
                console.log("No GPC signal detected.");
                loadAnalytics();
                loadMarketing();
            }
        } else {
            console.log("Global Privacy Control (GPC) is not supported by this browser.");
            loadAnalytics();
            loadMarketing();
        }
    }
    
    function disableTracking() {
        console.log("Disabling all tracking scripts due to GPC.");
    
        window['ga-disable-G-V1EMJPEBE9'] = true;
    
        const gaScript = document.querySelector("script[src*='googletagmanager']");
        if (gaScript) {
            gaScript.remove();
            console.log("Google Analytics script removed.");
        }
    
        const metaPixelScript = document.querySelector("script[src*='fbevents']");
        if (metaPixelScript) {
            metaPixelScript.remove();
            console.log("Meta Pixel script removed.");
        }

        const hubspotScript = document.querySelector("script[src*='js.hubspot']");
        if (hubspotScript) {
            hubspotScript.remove();
            console.log("HubSpot tracking script removed.");
        }

        window._hsq = window._hsq || [];
        _hsq.push(['doNotTrack']); 

        const googleAdsScript = document.querySelector("script[src*='googletagmanager.com/gtag/js']");
        if (googleAdsScript) {
            googleAdsScript.remove();
            console.log("Google Ads script removed.");
        }

        window.gtag = function() {
            console.log("Google Ads tracking disabled.");
        };
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
        })(window,document,'script','dataLayer','G-V1EMJPEBE9'); 
    }    

    function loadMarketing() {
        
        if (window.fbq) {
            return; // Exit the function if fbq is already defined
        }
    
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
        
        fbq('init', '1082408990530086'); 
        fbq('track', 'PageView');

    
        {/* <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=1082408990530086&ev=PageView&noscript=1"/> */}

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
        _hsq.push(['setAccount', '47790452']); 
        _hsq.push(['trackPageView']);

        // Load Google Ads Conversion Tracking Code
        !function(g,s,n){
            g.gtag = g.gtag || function(){(g.gtag.q=g.gtag.q||[]).push(arguments)};
            g.gtag.l = 1 * new Date();
            var script = s.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-16746492101';
            script.async = true;
            s.getElementsByTagName('head')[0].appendChild(script);
        }(window, document);

        gtag('js', new Date());
        gtag('config', 'AW-16746492101');
    }    

    const rejectBtn = document.getElementById("rejectButton");
    if (rejectBtn) {
        rejectBtn.addEventListener("click", function() {
            console.log("Reject button clicked.");
            document.cookie = "functional=false; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "analytics=false; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = "marketing=false; path=/; expires=" + new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();

            storePreferencesInDb('reject', currentPageUrl, createdDate, userIpAddress, shopUrl, {
                functional: false,
                analytics: false,
                marketing: false,
            });

            banner.style.display = 'none';
        });
    } 
}

fetchShopPreferences();

async function openPreferencesModal(modalBackgroundColor, acceptButtonColor, rejectButtonColor) {
    const shopUrl = getShopUrl();
if (!shopUrl) {
    console.error('Shop URL not found');
    return;
}

const currentPageUrl = window.location.href;
const createdDate = new Date().toISOString();
const userIpAddress = await getUserIpAddress();

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

banner.style.opacity = '0.5';

const modalContent = document.createElement('div');
modalContent.style.backgroundColor = modalBackgroundColor;
modalContent.style.padding = '20px';
modalContent.style.borderRadius = '10px';
modalContent.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
modalContent.style.maxWidth = '800px';  // Maximum width for larger screens
modalContent.style.width = '90%';  // Set to 90% of the screen width for smaller screens

const modalImage = document.createElement('img');
modalImage.src = cookieIcon; 
modalImage.alt = 'cookie Icon';
modalImage.style.width = modalImagewidth; 
modalImage.style.marginLeft = '380px'; 
modalImage.style.marginBottom = '30px';

const titleContainer = document.createElement('div');
titleContainer.style.display = 'flex';
titleContainer.style.alignItems = 'center';

const modalTitle = document.createElement('h3');
modalTitle.style.fontWeight = '650';
modalTitle.style.marginBottom = '10px';
modalTitle.style.marginTop = '50px';
modalTitle.style.marginLeft = '-180px';
modalTitle.style.color = modalTitleFontColor;
modalTitle.textContent = 'Select type of Cookies you accept using.';

titleContainer.appendChild(modalImage);
titleContainer.appendChild(modalTitle);

modalContent.appendChild(titleContainer);

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
    document.cookie = `functional=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()}`;
    document.cookie = `analytics=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()}`; 
    document.cookie = `marketing=true; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()}`; 
    
    storePreferencesInDb('accept', currentPageUrl, createdDate, userIpAddress, shopUrl, {
        functional: true,
        analytics: true,
        marketing: true,
    });
    console.log('All cookies accepted.');
    banner.style.display='none';
    closePreferencesModal();
});

modalContent.appendChild(acceptButton);

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
        for (const [title, checked] of Object.entries(preferences)) {
            const cookieValue = checked ? 'true' : '';
            document.cookie = `${title}= ${cookieValue}; path=/; expires=${new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString()};`;
        }

        storePreferencesInDb('preferences', currentPageUrl, createdDate, userIpAddress, shopUrl, preferences);
        banner.style.display = 'none';
        closePreferencesModal();
    } else {
        console.log('All non-essential cookies rejected.');
        storePreferencesInDb('reject', currentPageUrl, createdDate, userIpAddress, shopUrl, {
            functional: false,
            analytics: false,
            marketing: false,
        });
        closePreferencesModal();
    }
});    
modalContent.appendChild(rejectButton);

const sections = [
    { title: 'Strictly Required', description: 'Those cookies are required to run our website properly and cannot be switched off.' },
    { title: 'Analytics', description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information.', checkbox: true },
    { title: 'Marketing', description: 'These cookies are set by our marketing partners to show you relevant ads.', checkbox: true },
    { title: 'Functional', description: 'Functional cookies enable our website to offer additional functions and personal settings.', checkbox: true },
];

let preferences = {};

function updateRejectButtonText() {
    const checkboxes = modalContent.querySelectorAll('input[type="checkbox"]');
    const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    rejectButton.textContent = anyChecked ? 'Save Consent' : 'Reject';
    rejectButton.style.width = '120px';
}

sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section';

    const sectionTitle = document.createElement('strong');
    sectionTitle.textContent = section.title;
    sectionDiv.appendChild(sectionTitle);

    if (section.checkbox) {
        const checkboxContainer = document.createElement('label');
        checkboxContainer.style.position = 'relative';
        checkboxContainer.style.display = 'inline-block';
        checkboxContainer.style.width = '20px';
        checkboxContainer.style.height = '20px';
        checkboxContainer.style.marginLeft = '10px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.opacity = '0'; 
        checkbox.style.position = 'absolute'; 
        checkbox.style.cursor = 'pointer';
        checkbox.style.width = '100%'; 
        checkbox.style.height = '100%'; 

        const customCheckbox = document.createElement('span');
        customCheckbox.style.position = 'absolute';
        customCheckbox.style.top = '0';
        customCheckbox.style.left = '0';
        customCheckbox.style.width = '100%';
        customCheckbox.style.height = '100%';
        customCheckbox.style.border = '2px solid #ccc'; 
        customCheckbox.style.borderRadius = '5px'; 
        customCheckbox.style.backgroundColor = 'white'; 
        customCheckbox.style.transition = 'background-color 0.3s, border-color 0.3s'; 
        customCheckbox.style.marginTop = '5px';

        const checkmark = document.createElement('span');
        checkmark.textContent = '✓'; 
        checkmark.style.color = 'black';
        checkmark.style.position = 'absolute';
        checkmark.style.top = '2px';
        checkmark.style.left = '2px'; 
        checkmark.style.fontSize = '16px'; 
        checkmark.style.display = 'none'; 

        checkbox.addEventListener('change', () => {
            customCheckbox.style.backgroundColor = checkbox.checked ? 'black' : 'white';
            customCheckbox.style.borderColor = checkbox.checked ? 'black' : '#ccc';
            checkmark.style.display = checkbox.checked ? 'block' : 'none';
            checkmark.style.color = checkbox.checked ? 'white' : 'black';
            
            preferences[section.title.toLowerCase()] = checkbox.checked;
            updateRejectButtonText();
        });

        checkboxContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault(); 
            checkbox.checked = !checkbox.checked; 
            checkbox.dispatchEvent(new Event('change'));
        });

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(customCheckbox);
        checkboxContainer.appendChild(checkmark); 
        sectionDiv.appendChild(checkboxContainer);
    }

    const sectionDesc = document.createElement('p');
    sectionDesc.textContent = section.description;
    sectionDiv.appendChild(sectionDesc);

    modalContent.appendChild(sectionDiv);
});

// const closeButton = document.createElement('img');
// closeButton.src = closeButtonIcon; 
// closeButton.alt = 'Close';
// closeButton.style.position = 'absolute';
// closeButton.style.top = '10px';
// closeButton.style.right = '10px';
// closeButton.style.cursor = 'pointer';
// closeButton.style.width = closeButtonWidth;
// closeButton.style.marginRight ='25vw' ;
// closeButton.style.marginTop ='2vw' ;
// closeButton.addEventListener('click', closePreferencesModal);
// modalContent.appendChild(closeButton);

modalContainer.appendChild(modalContent);

document.body.appendChild(modalContainer);

// Responsive design with media query
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@media (max-width: 768px) {
    #preferencesModal {
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }
    #preferencesModal .modal-content {
        width: 95%;
        max-width: 600px;
        padding: 15px;
    }
    .modal-title {
        font-size: 20px;
    }
    .section {
        padding: 5px;
    }
    .section strong {
        font-size: 16px;
    }
    .section p {
        font-size: 14px;
    }
    .action-buttons {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }
    .action-buttons button {
        width: 45%;
        font-size: 14px;
    }
}
`;

document.head.appendChild(styleSheet);

}

function closePreferencesModal() {
    banner.style.opacity = 1;
    const modalContainer = document.getElementById('preferencesModal');
    if (modalContainer) {
        modalContainer.remove();
    }
    document.removeEventListener('keydown', closePreferencesModal);
}

fetchStoreData();
