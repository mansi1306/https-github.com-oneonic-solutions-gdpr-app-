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

    // Check the selected theme and construct the banner accordingly
    if (selectedTheme === 'Basic') {
        banner.innerHTML = `
            <div style='background-color:rgb(248, 248, 248) ; width:100%;'>
                <img src='../assets/cg.png' alt="close" width='20px' style='margin-left: 660px; padding-top: 15px;' />
                <img src='../assets/green.png' alt="Cookie" width='45px' style='margin-top: -30px; margin-bottom: -10px; margin-left: 5px;' />
                <p style='font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -40px;'>
                    <h3 style='font-weight: 750;'>We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us. 
                    <span style='text-decoration: underline;'>Privacy Policy</span>
                </p>
                <div style='margin-top: 10px; margin-left: 50px; margin-bottom: 20px;'>
                    <div style='display: flex; gap: 5px;'>
                        ${bannerType === 'accept-only' ? `
                            <div style='background-color: rgb(26, 172, 122); padding: 8px 20px; align-items: center; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style='padding: 8px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style='background-color: rgb(26, 172, 122); padding: 8px 20px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div style='padding: 8px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style='background-color: rgb(26, 172, 122); padding: 8px 20px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div style='padding: 8px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                            <div style='padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Light theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;'>
                <img src='../assets/blcak.png' alt="close" width='25px' style='margin-left: 660px; padding-top: 15px;' />
                <img src='../assets/cc.png' alt="Cookie" width='38px' style='margin-top: -30px; margin-bottom: -5px; margin-left: 9px;' />
                <p style='font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -40px;'>
                    <h3 style='font-weight: 750;'>We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us. 
                    <span style='text-decoration: underline;'>Privacy Policy</span>
                </p>
                <div style='margin-top: 10px; margin-left: 50px; margin-bottom: 20px;'>
                    <div style='display: flex; gap: 5px;'>
                        ${bannerType === 'accept-only' ? `
                            <div style='border: 1px solid black; background-color: black; color: white; padding: 8px 20px; align-items: center; border-radius: 10px;'>Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style='padding: 8px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style='border: 1px solid black; background-color: black; color: white; padding: 8px 20px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div style='padding: 8px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style='border: 1px solid black; background-color: black; color: white; padding: 8px 20px; align-items: center; border-radius: 10px;'>Accept</div>
                            <div style='padding: 8px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;'>Reject</div>
                            <div style='padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;'>Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Sense') {
        banner.innerHTML = `
            <div style='background-color: rgb(255, 220, 194); width:100%;'>
                <img src='../assets/blcak.png' alt="close" width='25px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/cc.png' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -5px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -40px;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us.
                    <span style="text-decoration: underline;">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(185, 219, 47); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid black; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(185, 219, 47); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid black; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(185, 219, 47); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid black; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
         `;
    } else if (selectedTheme === 'Golden') {
        banner.innerHTML = `
            <div style='background-color: rgb(29, 29, 29); width:100%;'>
                <img src='../assets/ye.webp' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/cc.webp' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -10px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -30px; color: white;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us.
                    <span style="text-decoration: underline;">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(242, 194, 50); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(242, 194, 50); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(242, 194, 50); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Christmas') {
        banner.innerHTML = `
            <div style='background-color: rgb(22, 91, 51); width:100%;'>
                <img src='../assets/11.png' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/456.png' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -10px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -30px; color: white;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us.
                    <span style="text-decoration: underline; color: rgb(242, 194, 50);">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: red; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: red; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: red; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Neumorphism') {
        banner.innerHTML = `
            <div style='background-color: rgb(248, 248, 248); width:100%;'>
                <img src='../assets/grac.png' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/gray.png' alt="Cookie" width='42px' style="margin-top: -30px; margin-bottom: -5px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -40px;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us. <span style="text-decoration: underline; font-weight: 650;">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="border: 1px solid black; padding: 8px 20px 10px 20px; align-items: center; border-radius: 20px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="border: 1px solid black; padding: 8px 20px 10px 20px; align-items: center; border-radius: 20px;">Accept</div>
                            <div style="padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="border: 1px solid black; padding: 8px 20px 10px 20px; align-items: center; border-radius: 20px;">Accept</div>
                            <div style="padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Elegant') {
        banner.innerHTML = `
            <div style='background-color: rgb(246, 239, 235); width:100%;'>
                <img src='../assets/br.svg' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/brown.avif' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -5px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -40px;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us. <span style="text-decoration: underline;">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(163, 128, 100); color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(163, 128, 100); color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(163, 128, 100); color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; border: 1px solid black; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Dark theme') {
        banner.innerHTML = `
            <div style='background-color: rgb(16, 24, 47); width:100%;'>
                <img src='../assets/11.png' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/456.png' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -10px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -30px; color: white;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us. <span style="text-decoration: underline; color: white;">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Autumn') {
        banner.innerHTML = `
            <div style='background-color:rgb(238, 179, 99) ; width:100%;'> 
                <img src='../assets/br.svg' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/brown.avif' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -10px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -30px; color: rgb(163, 72, 0);">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us.
                    <span style="text-decoration: underline; color: rgb(163, 72, 0);">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: rgb(163, 72, 0); color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: rgb(163, 72, 0); color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: rgb(163, 72, 0); color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid rgb(163, 72, 0); color: rgb(163, 72, 0); padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (selectedTheme === 'Crave') {
        banner.innerHTML = `
            <div style='background-color:rgb(145, 15, 63); width:100%;'>
                <img src='../assets/11.png' alt="close" width='20px' style="margin-left: 660px; padding-top: 15px;" />
                <img src='../assets/456.png' alt="Cookie" width='38px' style="margin-top: -30px; margin-bottom: -10px; margin-left: 9px;" />
                <p style="font-size: 15px; margin-left: 55px; line-height: 30px; margin-top: -30px; color: white;">
                    <h3 style="font-weight: 750;">We keep your privacy</h3>
                    This website uses cookies to make sure you get the best experience with us.
                    <span style="text-decoration: underline; color: white;">Privacy Policy</span>
                </p>
                <div style="margin-top: 10px; margin-left: 50px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px;">
                        ${bannerType === 'accept-only' ? `
                            <div style="background-color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                        ` : ''}
                        ${bannerType === 'decline-only' ? `
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'accept-decline' ? `
                            <div style="background-color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                        ` : ''}
                        ${bannerType === 'preferences' ? `
                            <div style="background-color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px;">Accept</div>
                            <div style="border: 1px solid white; color: white; padding: 8px 20px 10px 20px; align-items: center; border-radius: 10px; margin-left: 5px;">Reject</div>
                            <div style="padding: 8px 20px; border: 1px solid black; margin-left: 5px; border-radius: 10px;">Preferences</div>
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

// Call the function to fetch store data and display the banner
fetchStoreData();