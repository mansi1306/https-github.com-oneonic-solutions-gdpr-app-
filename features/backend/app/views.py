from django.shortcuts import render, redirect
from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect, Http404
import shopify
import requests
import json
import os
from .shopify_utils import register_webhook
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import traceback
from .models import Shop, Store, Plan, ShopPreferences, PrivacyPolicySetting, CookiePreference
import logging
from django.utils import timezone
from django.views.decorators.http import require_GET
from django.middleware.csrf import get_token
from graphql import GraphQLError
from .models import PrivacyPolicySetting
from django.db.utils import IntegrityError
import pycountry


def shopify_auth(request):
    # Redirect to Shopify for OAuth authorization
    shopify.Session.setup(api_key=settings.SHOPIFY_API_KEY, secret=settings.SHOPIFY_API_SECRET)
    
    # This URL is where Shopify will redirect after authentication
    redirect_uri = settings.SHOPIFY_REDIRECT_URI
    scopes = [
        'write_products', 'read_products', 'write_orders', 'read_orders',
        'read_customers', 'write_customers',  # These are needed for customer-related webhooks
        'read_shopify_payments_disputes',  
        'write_content', 'write_script_tags', 'read_script_tags',
        'read_shopify_payments_disputes',
        'read_checkouts'
    ]


    # Shopify requires a 'shop' parameter to redirect to the authentication URL
    auth_url = f"https://shopify.com/admin/oauth/authorize?client_id={settings.SHOPIFY_API_KEY}&scope={','.join(scopes)}&redirect_uri={redirect_uri}&state=123456789" # 'state' can be any random string
    
    return HttpResponseRedirect(auth_url)


def shopify_auth_callback(request):
    shop = request.GET.get('shop')
    code = request.GET.get('code')

    if not shop or not code:
        return JsonResponse({'error': 'Missing shop domain or authorization code'}, status=400)

    token_url = f"https://{shop}/admin/oauth/access_token"
    payload = {
        'client_id': settings.SHOPIFY_API_KEY,
        'client_secret': settings.SHOPIFY_API_SECRET,
        'code': code
    }

    try:
        response = requests.post(token_url, json=payload)
        response.raise_for_status()
        token_data = response.json()
        access_token = token_data.get('access_token')

        shop_instance, created = Shop.objects.get_or_create(shop_url=shop)
        shop_instance.access_token = access_token
        shop_instance.is_authenticated = True  # Mark as authenticated
        shop_instance.save()

        register_webhook(shop, access_token)

        create_gdpr_privacy_policy_page(shop, access_token)
        create_pipeda_privacy_policy_page(shop, access_token)
        create_ccpa_privacy_policy_page(shop, access_token)
        create_lgpd_privacy_policy_page(shop, access_token)
        create_appi_privacy_policy_page(shop, access_token)

        return HttpResponseRedirect(f"https://{shop}/admin/apps/4d48baea68b47ab91304b6080392c538")

    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def uninstall_webhook(request):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            shop = payload.get('domain')

            if shop:
                # Update the shop record to mark it as unauthenticated
                shop_instance, created = Shop.objects.get_or_create(shop_url=shop)
                shop_instance.is_authenticated = False
                shop_instance.access_token = ''  # Clear the access token if you want
                shop_instance.save()
                
                return JsonResponse({'status': 'success', 'message': f'Shop {shop} uninstalled and marked as unauthenticated'}, status=200)
            else:
                return JsonResponse({'error': 'Shop domain not found in request'}, status=400)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def customer_data_request(request):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            shop = payload.get('shop_domain')
            customer = payload.get('customer')
            orders_requested = payload.get('orders_requested', [])

            # Retrieve and prepare customer data
            customer_data = {
                "email": customer.get('email'),
                "phone": customer.get('phone'),
                "orders": orders_requested  # Include order data if stored
            }

            return JsonResponse({"status": "success", "customer_data": customer_data}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def customer_data_erasure(request):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            customer = payload.get('customer')

            # Remove customer data from your database
            customer_id = customer.get('id')
            email = customer.get('email')
            
            # Example: Assuming a Customer model
            Customer.objects.filter(id=customer_id, email=email).delete()

            return JsonResponse({"status": "success", "message": "Customer data erased"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def shop_data_erasure(request):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            shop_domain = payload.get('shop_domain')

            # Remove shop data from your database
            Shop.objects.filter(shop_url=shop_domain).delete()

            return JsonResponse({"status": "success", "message": f"Shop {shop_domain} data erased"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@require_GET  
def get_shop_name(request):
    # Get the shop URL from the request parameters
    shop_url = request.GET.get('shop_url')  # Example: query parameter
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)

    try:    
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        # Return only the shop name without any error message if the shop is not found
        return JsonResponse({'shop_name': shop_url.split('.')[0]}, status=404)

    access_token = shop.access_token
    complete_shop_url = f"https://{shop.shop_url}"
    
    # Define the GraphQL query with available fields
    query = """
    query {
      shop {
        name
        email
        myshopifyDomain
      }
    }
    """
    
    headers = {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
    }
    
    # Make the request to the Shopify GraphQL API
    response = requests.post(
        f"{complete_shop_url}/admin/api/2025-01/graphql.json",
        headers=headers,
        data=json.dumps({'query': query})
    )
    
    # Check if the response from Shopify was successful
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch data from Shopify'}, status=500)
    
    data = response.json()
    print("GraphQL Response:", json.dumps(data, indent=2))  # Debugging line
    
    # Extract shop details
    shop_name = data.get('data', {}).get('shop', {}).get('name', '')
    if not shop_name:
        return JsonResponse({'shop_name': shop_url.split('.')[0]}, status=404)  # Return shop name even if the shop name is not found

    # Return the actual shop name from Shopify
    return JsonResponse({'shop_name': shop_name})


@csrf_exempt
def save_banner_type(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            shop_url = data.get('shop_url', '').strip().lower()  # Normalize the URL
            banner_type = data.get('banner_type')

            if not shop_url or not banner_type:
                return JsonResponse({'error': 'Shop URL and Banner Type are required'}, status=400)

            store, created = Store.objects.get_or_create(shop_url=shop_url)
            store.banner_type = banner_type
            store.save()

            return JsonResponse({'message': 'Banner type updated successfully'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def save_selected_countries(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            shop_url = data.get('shop_url')
            selected_countries = data.get('selected_countries', [])

            store, created = Store.objects.get_or_create(shop_url=shop_url)
            store.selected_countries = selected_countries
            store.save()

            return JsonResponse({'message': 'Selected countries saved successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def save_theme(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            shop_url = data.get('shop_url')
            theme_label = data.get('theme_label')

            store, created = Store.objects.get_or_create(shop_url=shop_url)
            store.selected_theme = theme_label  # Store the selected theme
            store.save()

            return JsonResponse({'message': 'Theme saved successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)


def get_store_data(request):
    # Assuming the shop URL is passed as a query parameter, e.g., ?shop_url=myshop.myshopify.com
    shop_url = request.GET.get('shop_url')

    if not shop_url:
        return JsonResponse({'error': 'shop_url parameter is missing'}, status=400)

    try:
        store = Store.objects.get(shop_url=shop_url)
        data = {
            'banner_type': store.banner_type,
            'selected_countries': store.selected_countries,
            'selected_theme': store.selected_theme
        }
        return JsonResponse(data)
    except Store.DoesNotExist:
        return JsonResponse({'error': 'Store not found'}, status=404)


logger = logging.getLogger(__name__)


@csrf_exempt
def select_plan(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print('Received data:', data)  # Debugging log
            plan_name = data.get('plan')
            shop_url = data.get('shop_url')

            if plan_name and shop_url:
                existing_plan = Plan.objects.filter(shop_url=shop_url).first()
                if existing_plan:
                    existing_plan.plan_name = plan_name  # Update the plan
                    existing_plan.updated_at = timezone.now()  # Update timestamp
                    existing_plan.save()
                else:
                    plan = Plan(plan_name=plan_name, shop_url=shop_url)
                    plan.save()

                return JsonResponse({'message': 'Plan selected successfully!'}, status=201)

            return JsonResponse({'error': 'Plan name or shop_url not provided.'}, status=400)
        except Exception as e:
            logger.error(f"Error in select_plan: {str(e)}")
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


@csrf_exempt
def get_plan(request):
    if request.method == 'GET':
        shop_url = request.GET.get('shop_url')
        if shop_url:
            try:
                plan = Plan.objects.get(shop_url=shop_url)
                return JsonResponse({'plan': plan.plan_name}, status=200)
            except Plan.DoesNotExist:
                return JsonResponse({'plan': None}, status=404)
        return JsonResponse({'error': 'shop_url not provided.'}, status=400)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


@csrf_exempt
def create_recurring_application_charge(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            shop_url = data.get('shop_url')
            plan_price = data.get('plan_price')
            access_token = request.headers.get('Authorization')

            # Extract the Bearer token
            if access_token and access_token.startswith('Bearer '):
                access_token = access_token.split(' ')[1]

            print(f"Access Token: {access_token}")
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse({"success": False, "error": "Invalid JSON or missing Authorization header"})

        # Validate inputs
        if not shop_url or not plan_price or not access_token:
            return JsonResponse({"success": False, "error": "Missing required fields"})

        if plan_price not in ['1.00', '2.00', '3.00']:
            return JsonResponse({"success": False, "error": "Invalid plan selected"})

        charge_data = {
            "recurring_application_charge": {
                "name": "GDPR app",
                "price": float(plan_price),
                "return_url": "https://b4ee-103-105-234-92.ngrok-free.app/shopify_app/accept_charge",
                "trial_days": 7,
                "test": True,
            }
        }

        headers = {"X-Shopify-Access-Token": access_token}
        response = requests.post(
            f"https://{shop_url}/admin/api/2025-01/recurring_application_charges.json",
            json=charge_data,
            headers=headers,
        )

        if response.status_code == 201:
            charge = response.json().get("recurring_application_charge")
            return JsonResponse({"success": True, "charge": charge})
        else:
            error_message = response.json().get('errors', 'Unknown error')
            return JsonResponse({"success": False, "error": error_message})

    return JsonResponse({"success": False, "error": "Invalid request method"})


@csrf_exempt
def accept_charge(request):
    if request.method == 'GET':
        charge_id = request.GET.get('charge_id')
        shop_url = request.GET.get('shop_url')

        if not charge_id or not shop_url or not access_token:
            return JsonResponse({"success": False, "error": "Missing required parameters"})

        # Send request to activate the charge
        response = requests.post(
            f"https://{shop_url}/admin/api/2025-01/recurring_application_charges/{charge_id}/activate.json",
            headers={"X-Shopify-Access-Token": access_token}
        )

        if response.status_code == 200:
            # Optionally, save the charge details in your database here
            return JsonResponse({"success": True})
        else:
            error_message = response.json().get('errors', 'Unknown error')
            return JsonResponse({"success": False, "error": error_message})

    return JsonResponse({"success": False, "error": "Invalid request method"})


@csrf_exempt
def get_access_token(request):
    if request.method == 'POST':
        # Parse the request body to get the shop_url
        try:
            data = json.loads(request.body)
            shop_url = data.get('shop_url')
        except json.JSONDecodeError:
            return HttpResponse('Invalid JSON format', status=400)

        # Check if shop_url is provided
        if not shop_url:
            return HttpResponse('Missing shop_url', status=400)

        # Retrieve the shop object using the shop_url
        try:
            shop = Shop.objects.get(shop_url=shop_url)
        except Shop.DoesNotExist:
            return HttpResponse('Shop not found', status=404)

        # Check if the shop is authenticated
        if shop.is_authenticated:
            # Return the access token in a JSON response
            return JsonResponse({'access_token': shop.access_token})
        else:
            # If the shop is not authenticated, return an error response
            return HttpResponse('Shop not authenticated', status=401)

    # If not a POST request, return method not allowed
    return HttpResponse('Method not allowed', status=405)


@csrf_exempt
def get_csrf_token(request):
    if request:
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})  # Returning JsonResponse
    else:
        raise GraphQLError("Unable to generate CSRF token.")


@csrf_exempt
def save_shop_preferences(request):
    if request.method == 'POST':
        shop_url = request.POST.get('shop_url')
        show_reopen_button = request.POST.get('show_reopen_button') == 'true'
        
        if shop_url:
            preferences, created = ShopPreferences.objects.get_or_create(shop_url=shop_url)
            preferences.show_reopen_button = show_reopen_button
            preferences.save()
            
            return JsonResponse({'status': 'success', 'show_reopen_button': preferences.show_reopen_button})
        
        return JsonResponse({'status': 'error', 'message': 'Shop URL is required'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@csrf_exempt
def save_privacy_policy_settings(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        # Parse the shop_url and other settings from the request data
        shop_url = data.get('shopUrl')
        if not shop_url:
            return JsonResponse({'status': 'error', 'message': 'Shop URL is required'}, status=400)

        show_google_privacy_policy = data.get('showGooglePrivacyPolicy', False)
        show_privacy_policy_link = data.get('showPrivacyPolicyLink', False)
        use_specific_privacy_policy = 'Use specific Privacy Policy' in data.get('selectedChoice', [])
        selected_option = data.get('selectedOption', 'Shopify Policy (/policies/privacy-policy)')

        # Update or create the settings for the specific shop
        settings, created = PrivacyPolicySetting.objects.get_or_create(shop_url=shop_url)
        settings.show_google_privacy_policy = show_google_privacy_policy
        settings.show_privacy_policy_link = show_privacy_policy_link
        settings.use_specific_privacy_policy = use_specific_privacy_policy
        settings.selected_option = selected_option
        settings.save()

        return JsonResponse({'status': 'success', 'message': 'Privacy policy settings saved successfully'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


def display_shop_preferences(request):
    # Retrieve the shop_url parameter from the request
    shop_url = request.GET.get('shop_url')
    
    if shop_url:
        try:
            preference = ShopPreferences.objects.get(shop_url=shop_url)
            
            data = {
                'shop_url': preference.shop_url,
                'show_reopen_button': preference.show_reopen_button
            }

            return JsonResponse({'status': 'success', 'preference': data})
        
        except ShopPreferences.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Shop URL not found'}, status=404)
    
    return JsonResponse({'status': 'error', 'message': 'Shop URL parameter is required'}, status=400)


def get_user_country(request):
    try:
        response = requests.get('https://ipinfo.io/json')
        print("Response Status Code:", response.status_code)
        print("Response Content:", response.text)  # Log the raw content for debugging

        if response.status_code == 200:
            if response.text:
                data = response.json()

                # Replace the country code with the full country name
                country_code = data.get('country', '').upper()
                if country_code:
                    country = pycountry.countries.get(alpha_2=country_code)
                    if country:
                        data['country'] = country.name.capitalize()  # Capitalize the first letter

                return JsonResponse(data)
            else:
                return JsonResponse({'error': 'No data returned from the API'}, status=204)
        else:
            return JsonResponse({'error': 'Failed to fetch data from ipinfo.io', 'status_code': response.status_code}, status=response.status_code)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def privacy_policy_settings(request):
    # Get the shop_url from the query parameter
    shop_url = request.GET.get('shop_url')

    # Check if shop_url is provided
    if not shop_url:
        return JsonResponse({'error': 'Missing shop_url parameter'}, status=400)

    try:
        # Attempt to retrieve the PrivacyPolicySetting for the given shop_url
        settings = PrivacyPolicySetting.objects.get(shop_url=shop_url)

        # Prepare the data to return as JSON
        data = {
            'shop_url': settings.shop_url,
            'show_google_privacy_policy': settings.show_google_privacy_policy,
            'selected_option': settings.selected_option,
        }

        # Return the data as JSON
        return JsonResponse(data)

    except PrivacyPolicySetting.DoesNotExist:
        return JsonResponse({'error': 'Shop URL not found in the database'}, status=404)


def create_gdpr_privacy_policy_page(shop_url, access_token):

    body_html_content = f"""
                        <b>GDPR Privacy Policy</b>
                        <p>Our Privacy Policy was last updated on September 23, 2024.</p>
                        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
                        when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                        <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of
                        information in accordance with this Privacy Policy. This Privacy Policy was generated by TermsFeed GDPR Privacy Policy Template.</p>
                        <b>Interpretation and Definitions</b>
                        <b>Interpretation</b>
                        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.
                        The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                        <b>Definitions</b>
                        <p>For the purposes of this Privacy Policy:</p>
                        <ul>
                        <li><b>"Account"</b> means a unique account created for You to access our Service or parts of our Service.</li>
                        <li><b>"Company"</b> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to {shop_url}<br>
                        For the purpose of the GDPR, the Company is the Data Controller.</li>
                        <li><b>"Country"</b> refers to India.</li>
                        <li><b>"Cookies"</b> are small files that are placed on Your computer, mobile device or any other device by a website,
                        containing the details of Your browsing history on that website among its many uses.</li>
                        <li><b>"Data Controller"</b>, for the purposes of the GDPR (General Data Protection Regulation), refers to the Company as the
                        legal person which alone or jointly with others determines the purposes and means of the processing of Personal Data.</li>
                        <li><b>"Device"</b> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                        <li><b>"Personal Data"</b> is any information that relates to an identified or identifiable individual.<br>
                        For the purposes of GDPR, Personal Data means any information relating to You such as a name, an identification number, 
                        location data, online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic,
                        cultural or social identity.</li>
                        <li><b>"Service"</b> refers to the Website.</li>
                        <li><b>"Service Provider"</b> means any natural or legal person who processes the data on behalf of the Company. It refers to
                        third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf
                        of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                        For the purpose of the GDPR, Service Providers are considered Data Processors.</li>
                        <li><b>"Usage Data"</b> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself
                        (for example, the duration of a page visit).</li>
                        <li><b>"Website"</b> refers to WomenStore15, accessible from {shop_url}</li>
                        <li><b>"You"</b> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual
                        is accessing or using the Service, as applicable.br>
                        Under GDPR (General Data Protection Regulation), You can be referred to as the Data Subject or as the
                        User as you are the individual using the Service.</li>
                        </ul>
                        <b>Collecting and Using Your Personal Data</b>
                        <b>Types of Data Collected</b>
                        <b>Personal Data</b>
                        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact
                        or identify You. Personally identifiable information may include, but is not limited to:</p>
                        <ul>
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Usage Data</li>
                        </ul>
                        <b>Usage Data</b>
                        <p>Usage Data is collected automatically when using the Service.</p>
                        <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type,
                        browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages,
                        unique device identifiers and other diagnostic data.</p>
                        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including,
                        but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device,
                        Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic
                        data.</p>
                        <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or
                        through a mobile device.</p>
                        <b>Tracking Technologies and Cookies</b>
                        <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. 
                        Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our
                        Service. The technologies We use may include:</p>
                        <ul>
                        <li><b>Cookies or Browser Cookies.</b> A cookie is a small file placed on Your Device. You can instruct Your browser to
                        refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to
                        use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may
                        use Cookies.</li>
                        <li><b>Web Beacons.</b>Certain sections of our Service and our emails may contain small electronic files known as web beacons 
                        (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who
                        have visited those pages or opened an email and for other related website statistics (for example, recording the popularity
                        of a certain section and verifying system and server integrity).</li>
                        </ul>
                        <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when
                        You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
                        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
                        <ul>
                        <li><b>Necessary / Essential Cookies</b><br>
                        <p>Type: Session Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use
                        some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies,
                        the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p></li>
                        <li><b>Cookies Policy / Notice Acceptance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p></li>
                        <li><b>Functionality Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login
                        details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to
                        avoid You having to re-enter your preferences every time You use the Website.</p></li>
                        <li><b>Tracking and Performance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Third-Parties</p>
                        <p>Purpose: These Cookies are used to track information about traffic to the Website and how users use the Website.
                        The information gathered via these Cookies may directly or indirectly identify you as an individual visitor.
                        This is because the information collected is typically linked to a pseudonymous identifier associated with the device
                        you use to access the Website. We may also use these Cookies to test new pages, features or new functionality of the Website
                        to see how our users react to them.</p></li>
                        </ul>
                        <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy
                        or the Cookies section of our Privacy Policy.</p>
                        <b>Use of Your Personal Data</b>
                        <p>The Company may use Personal Data for the following purposes:</p>
                        <ul>
                        <li><b>To provide and maintain our Service</b>, including to monitor the usage of our Service.</li>
                        <li><b>To manage Your Account:</b>to manage Your registration as a user of the Service. The Personal Data You provide can
                        give You access to different functionalities of the Service that are available to You as a registered user.</li>
                        <li><b>For the performance of a contract:</b>the development, compliance and undertaking of the purchase contract for the
                        products, items or services You have purchased or of any other contract with Us through the Service.</li>
                        <li><b>To contact You:</b>To contact You by email, telephone calls, SMS, or other equivalent forms of electronic
                        communication, such as a mobile application's push notifications regarding updates or informative communications related
                        to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for
                        their implementation.</li>
                        <li><b>To provide You</b>with news, special offers and general information about other goods, services and events which we
                        offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such
                        information.</li>
                        <li><b>To manage Your requests:</b>To attend and manage Your requests to Us.</li>
                        <li><b>For business transfers:</b>We may use Your information to evaluate or conduct a merger, divestiture, restructuring,
                        reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part
                        of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the
                        assets transferred.</li>
                        <li><b>For other purposes:</b> We may use Your information for other purposes, such as data analysis, identifying usage
                        trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products,
                        services, marketing and your experience.</li>
                        </ul>
                        <p>We may share Your personal information in the following situations:</p>
                        <ul>
                        <li><b>With Service Providers:</b>We may share Your personal information with Service Providers to monitor and analyze the
                        use of our Service, for payment processing, to contact You.</li>
                        <li><b>For business transfers:</b>We may share or transfer Your personal information in connection with, or during
                        negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to
                        another company.</li>
                        <li><b>With Affiliates:</b>We may share Your information with Our affiliates, in which case we will require those affiliates
                        to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or
                        other companies that We control or that are under common control with Us.</li>
                        <li><b>With business partners:</b>We may share Your information with Our business partners to offer You certain products,
                        services or promotions.</li>
                        <li><b>With other users:</b>when You share personal information or otherwise interact in the public areas with other users,
                        such information may be viewed by all users and may be publicly distributed outside.</li>
                        <li><b>With Your consent:</b>We may disclose Your personal information for any other purpose with Your consent.</li>
                        </ul>
                        <b>Retention of Your Personal Data</b>
                        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy
                        Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example,
                        if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements
                        and policies.</p>
                        <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter
                        period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service,
                        or We are legally obligated to retain this data for longer time periods.</p>
                        <b>Transfer of Your Personal Data</b>
                        <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where
                        the parties involved in the processing are located. It means that this information may be transferred to — and maintained
                        on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection
                        laws may differ than those from Your jurisdiction.</p>
                        <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
                        <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with
                        this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are
                        adequate controls in place including the security of Your data and other personal information.</p>
                        <b>Disclosure of Your Personal Data</b>
                        <b>Business Transactions</b>
                        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide
                        notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
                        <b>Law enforcement</b>
                        <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in
                        response to valid requests by public authorities (e.g. a court or a government agency).</p>
                        <b>Other legal requirements</b>
                        <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul>
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend the rights or property of the Company</li>
                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>Protect the personal safety of Users of the Service or the public</li>
                        <li>Protect against legal liability</li>
                        </ul>
                        <b>Security of Your Personal Data</b>
                        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or
                        method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal
                        Data, We cannot guarantee its absolute security.</p>
                        <b>Detailed Information on the Processing of Your Personal Data</b>
                        <p>The Service Providers We use may have access to Your Personal Data. These third-party vendors collect, store, use, process
                        and transfer information about Your activity on Our Service in accordance with their Privacy Policies.</p>
                        <b>Analytics</b>
                        <p>We may use third-party Service providers to monitor and analyze the use of our Service.</p>
                        <b>Email Marketing</b>
                        <p>We may use Your Personal Data to contact You with newsletters, marketing or promotional materials and other information
                        that may be of interest to You. You may opt-out of receiving any, or all, of these communications from Us by following the
                        unsubscribe link or instructions provided in any email We send or by contacting Us.</p>
                        <b>GDPR Privacy</b>
                        <b>Legal Basis for Processing Personal Data under GDPR</b>
                        <p>We may process Personal Data under the following conditions:</p>
                        <ul>
                        <li><b>Consent:</b>You have given Your consent for processing Personal Data for one or more specific purposes.</li>
                        <li><b>Performance of a contract:</b>Provision of Personal Data is necessary for the performance of an agreement with You
                        and/or for any pre-contractual obligations thereof.</li>
                        <li><b>Legal obligations:</b>Processing Personal Data is necessary for compliance with a legal obligation to which the
                        Company is subject.</li>
                        <li><b>Vital interests:</b>Processing Personal Data is necessary in order to protect Your vital interests or of another
                        natural person.</li>
                        <li><b>Public interests:</b>Processing Personal Data is related to a task that is carried out in the public interest or in
                        the exercise of official authority vested in the Company.</li>
                        <li><b>Legitimate interests:</b>Processing Personal Data is necessary for the purposes of the legitimate interests pursued
                        by the Company.</li>
                        </ul>
                        <p>In any case, the Company will gladly help to clarify the specific legal basis that applies to the processing, and in
                        particular whether the provision of Personal Data is a statutory or contractual requirement, or a requirement necessary
                        to enter into a contract.</p>
                        <b>Your Rights under the GDPR</b>
                        <p>The Company undertakes to respect the confidentiality of Your Personal Data and to guarantee You can exercise Your rights.</p>
                        <p>You have the right under this Privacy Policy, and by law if You are within the EU, to:</p>
                        <ul>
                        <li><b>Request access to Your Personal Data.</b>The right to access, update or delete the information We have on You.
                        Whenever made possible, you can access, update or request deletion of Your Personal Data directly within Your account
                        settings section. If you are unable to perform these actions yourself, please contact Us to assist You. This also enables
                        You to receive a copy of the Personal Data We hold about You.</li>
                        <li><b>Request correction of the Personal Data that We hold about You.</b>You have the right to have any incomplete or
                        inaccurate information We hold about You corrected.</li>
                        <li><b>To manage Your requests.</b>You have the right to ask Us to show all your requests to you.</li>
                        <li><b>Object to processing of Your Personal Data. </b>This right exists where We are relying on a legitimate interest as the
                        legal basis for Our processing and there is something about Your particular situation, which makes You want to object to
                        our processing of Your Personal Data on this ground. You also have the right to object where We are processing Your Personal
                        Data for direct marketing purposes.</li>
                        <li><b>Request erasure of Your Personal Data.</b>You have the right to ask Us to delete or remove Personal Data when there is
                        no good reason for Us to continue processing it.</li>
                        <li><b>Request the transfer of Your Personal Data.</b> We will provide to You, or to a third-party You have chosen, Your
                        Personal Data in a structured, commonly used, machine-readable format. Please note that this right only applies to
                        automated information which You initially provided consent for Us to use or where We used the information to perform a
                        contract with You.</li>
                        <li><b>Withdraw Your consent.</b>You have the right to withdraw Your consent on using your Personal Data. If You withdraw
                        Your consent, We may not be able to provide You with access to certain specific functionalities of the Service.</li>
                        </ul>
                        <b>Exercising of Your GDPR Data Protection Rights</b>
                        <p>You may exercise Your rights of access, rectification, cancellation and opposition by contacting Us. Please note that
                        we may ask You to verify Your identity before responding to such requests. If You make a request, We will try our best to
                        respond to You as soon as possible.</p>
                        <p>You have the right to complain to a Data Protection Authority about Our collection and use of Your Personal Data. For more
                        information, if You are in the European Economic Area (EEA), please contact Your local data protection authority in the EEA.</p>
                        <b>Children's Privacy</b>
                        <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information
                        from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with
                        Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13
                        without verification of parental consent, We take steps to remove that information from Our servers.</p>
                        <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a
                        parent, We may require Your parent's consent before We collect and use that information.</p>
                        <b>Links to Other Websites</b>
                        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will
                        be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
                        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party
                        sites or services.</p>
                        <b>Changes to this Privacy Policy</b>
                        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy
                        on this page.</p>
                        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update
                        the "Last updated" date at the top of this Privacy Policy.</p>
                        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
                        when they are posted on this page.</p>
                        <!-- Add more detailed content about your privacy policy here -->
                    """
    url = f"https://{shop_url}/admin/api/2025-01/pages.json"  # Use latest API version
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }
    data = {
        "page": {
            "title": "GDPR Privacy Policy",
            "body_html": body_html_content
        }
    }
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        print("Privacy policy page created successfully.")
        return response.json()  # Returns page data if needed
    else:
        print("Error creating privacy policy page:", response.json())
        return None


def create_pipeda_privacy_policy_page(shop_url, access_token):

    body_html_content = f"""
                        <b>PIPEDA Privacy Policy</b>
                        <p>Our Privacy Policy was last updated on September 23, 2024.</p>
                        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
                        when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                        <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of
                        information in accordance with this Privacy Policy. This Privacy Policy was generated by TermsFeed PIPEDA Privacy Policy Template.</p>
                        <b>Interpretation and Definitions</b>
                        <b>Interpretation</b>
                        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.
                        The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                        <b>Definitions</b>
                        <p>For the purposes of this Privacy Policy:</p>
                        <ul>
                        <li><b>"Account"</b> means a unique account created for You to access our Service or parts of our Service.</li>
                        <li><b>"Company"</b> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to {shop_url}<br>
                        For the purpose of the GDPR, the Company is the Data Controller.</li>
                        <li><b>"Country"</b> refers to India.</li>
                        <li><b>"Cookies"</b> are small files that are placed on Your computer, mobile device or any other device by a website,
                        containing the details of Your browsing history on that website among its many uses.</li>
                        <li><b>"Data Controller"</b>, for the purposes of the GDPR (General Data Protection Regulation), refers to the Company as the
                        legal person which alone or jointly with others determines the purposes and means of the processing of Personal Data.</li>
                        <li><b>"Device"</b> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                        <li><b>"Personal Data"</b> is any information that relates to an identified or identifiable individual.<br>
                        For the purposes of GDPR, Personal Data means any information relating to You such as a name, an identification number, 
                        location data, online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic,
                        cultural or social identity.</li>
                        <li><b>"Service"</b> refers to the Website.</li>
                        <li><b>"Service Provider"</b> means any natural or legal person who processes the data on behalf of the Company. It refers to
                        third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf
                        of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                        For the purpose of the GDPR, Service Providers are considered Data Processors.</li>
                        <li><b>"Usage Data"</b> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself
                        (for example, the duration of a page visit).</li>
                        <li><b>"Website"</b> refers to WomenStore15, accessible from {shop_url}</li>
                        <li><b>"You"</b> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual
                        is accessing or using the Service, as applicable.br>
                        Under GDPR (General Data Protection Regulation), You can be referred to as the Data Subject or as the
                        User as you are the individual using the Service.</li>
                        </ul>
                        <b>Collecting and Using Your Personal Data</b>
                        <b>Types of Data Collected</b>
                        <b>Personal Data</b>
                        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact
                        or identify You. Personally identifiable information may include, but is not limited to:</p>
                        <ul>
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Usage Data</li>
                        </ul>
                        <b>Usage Data</b>
                        <p>Usage Data is collected automatically when using the Service.</p>
                        <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type,
                        browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages,
                        unique device identifiers and other diagnostic data.</p>
                        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including,
                        but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device,
                        Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic
                        data.</p>
                        <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or
                        through a mobile device.</p>
                        <b>Tracking Technologies and Cookies</b>
                        <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. 
                        Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our
                        Service. The technologies We use may include:</p>
                        <ul>
                        <li><b>Cookies or Browser Cookies.</b> A cookie is a small file placed on Your Device. You can instruct Your browser to
                        refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to
                        use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may
                        use Cookies.</li>
                        <li><b>Web Beacons.</b>Certain sections of our Service and our emails may contain small electronic files known as web beacons 
                        (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who
                        have visited those pages or opened an email and for other related website statistics (for example, recording the popularity
                        of a certain section and verifying system and server integrity).</li>
                        </ul>
                        <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when
                        You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
                        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
                        <ul>
                        <li><b>Necessary / Essential Cookies</b><br>
                        <p>Type: Session Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use
                        some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies,
                        the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p></li>
                        <li><b>Cookies Policy / Notice Acceptance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p></li>
                        <li><b>Functionality Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login
                        details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to
                        avoid You having to re-enter your preferences every time You use the Website.</p></li>
                        <li><b>Tracking and Performance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Third-Parties</p>
                        <p>Purpose: These Cookies are used to track information about traffic to the Website and how users use the Website.
                        The information gathered via these Cookies may directly or indirectly identify you as an individual visitor.
                        This is because the information collected is typically linked to a pseudonymous identifier associated with the device
                        you use to access the Website. We may also use these Cookies to test new pages, features or new functionality of the Website
                        to see how our users react to them.</p></li>
                        </ul>
                        <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy
                        or the Cookies section of our Privacy Policy.</p>
                        <b>Use of Your Personal Data</b>
                        <p>The Company may use Personal Data for the following purposes:</p>
                        <ul>
                        <li><b>To provide and maintain our Service</b>, including to monitor the usage of our Service.</li>
                        <li><b>To manage Your Account:</b>to manage Your registration as a user of the Service. The Personal Data You provide can
                        give You access to different functionalities of the Service that are available to You as a registered user.</li>
                        <li><b>For the performance of a contract:</b>the development, compliance and undertaking of the purchase contract for the
                        products, items or services You have purchased or of any other contract with Us through the Service.</li>
                        <li><b>To contact You:</b>To contact You by email, telephone calls, SMS, or other equivalent forms of electronic
                        communication, such as a mobile application's push notifications regarding updates or informative communications related
                        to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for
                        their implementation.</li>
                        <li><b>To provide You</b>with news, special offers and general information about other goods, services and events which we
                        offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such
                        information.</li>
                        <li><b>To manage Your requests:</b>To attend and manage Your requests to Us.</li>
                        <li><b>For business transfers:</b>We may use Your information to evaluate or conduct a merger, divestiture, restructuring,
                        reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part
                        of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the
                        assets transferred.</li>
                        <li><b>For other purposes:</b> We may use Your information for other purposes, such as data analysis, identifying usage
                        trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products,
                        services, marketing and your experience.</li>
                        </ul>
                        <p>We may share Your personal information in the following situations:</p>
                        <ul>
                        <li><b>With Service Providers:</b>We may share Your personal information with Service Providers to monitor and analyze the
                        use of our Service, for payment processing, to contact You.</li>
                        <li><b>For business transfers:</b>We may share or transfer Your personal information in connection with, or during
                        negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to
                        another company.</li>
                        <li><b>With Affiliates:</b>We may share Your information with Our affiliates, in which case we will require those affiliates
                        to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or
                        other companies that We control or that are under common control with Us.</li>
                        <li><b>With business partners:</b>We may share Your information with Our business partners to offer You certain products,
                        services or promotions.</li>
                        <li><b>With other users:</b>when You share personal information or otherwise interact in the public areas with other users,
                        such information may be viewed by all users and may be publicly distributed outside.</li>
                        <li><b>With Your consent:</b>We may disclose Your personal information for any other purpose with Your consent.</li>
                        </ul>
                        <b>Retention of Your Personal Data</b>
                        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy
                        Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example,
                        if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements
                        and policies.</p>
                        <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter
                        period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service,
                        or We are legally obligated to retain this data for longer time periods.</p>
                        <b>Transfer of Your Personal Data</b>
                        <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where
                        the parties involved in the processing are located. It means that this information may be transferred to — and maintained
                        on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection
                        laws may differ than those from Your jurisdiction.</p>
                        <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
                        <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with
                        this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are
                        adequate controls in place including the security of Your data and other personal information.</p>
                        <b>Disclosure of Your Personal Data</b>
                        <b>Business Transactions</b>
                        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide
                        notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
                        <b>Law enforcement</b>
                        <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in
                        response to valid requests by public authorities (e.g. a court or a government agency).</p>
                        <b>Other legal requirements</b>
                        <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul>
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend the rights or property of the Company</li>
                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>Protect the personal safety of Users of the Service or the public</li>
                        <li>Protect against legal liability</li>
                        </ul>
                        <b>Security of Your Personal Data</b>
                        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or
                        method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal
                        Data, We cannot guarantee its absolute security.</p>
                        <b>Children's Privacy</b>
                        <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information
                        from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with
                        Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13
                        without verification of parental consent, We take steps to remove that information from Our servers.</p>
                        <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a
                        parent, We may require Your parent's consent before We collect and use that information.</p>
                        <b>Your California Privacy Rights (California's Shine the Light law)</b>
                        <p>Under California Civil Code Section 1798 (California's Shine the Light law), California residents with an established
                        business relationship with us can request information once a year about sharing their Personal Data with third parties
                        for the third parties' direct marketing purposes.</p>
                        <p>If you'd like to request more information under the California Shine the Light law, and if You are a California resident,
                        You can contact Us using the contact information provided below.</p>
                        <b>California Privacy Rights for Minor Users (California Business and Professions Code Section 22581)</b>
                        <p>California Business and Professions Code Section 22581 allows California residents under the age of 18 who
                        are registered users of online sites, services or applications to request and obtain removal of content or information
                        they have publicly posted.</p>
                        <p>To request removal of such data, and if You are a California resident, You can contact Us using the contact information
                        provided below, and include the email address associated with Your account.</p>
                        <p>Be aware that Your request does not guarantee complete or comprehensive removal of content or information posted online
                        and that the law may not permit or require removal in certain circumstances.</p>
                        <b>Links to Other Websites</b>
                        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will
                        be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
                        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party
                        sites or services.</p>
                        <b>Changes to this Privacy Policy</b>
                        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy
                        on this page.</p>
                        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update
                        the "Last updated" date at the top of this Privacy Policy.</p>
                        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
                        when they are posted on this page.</p>
                        <!-- Add more detailed content about your privacy policy here -->
                    """

    url = f"https://{shop_url}/admin/api/2025-01/pages.json"  # Use latest API version
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }
    data = {
        "page": {
            "title": "PIPEDA Privacy Policy",
            "body_html": body_html_content
        }
    }
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        print("Privacy policy page created successfully.")
        return response.json()  # Returns page data if needed
    else:
        print("Error creating privacy policy page:", response.json())
        return None


def create_ccpa_privacy_policy_page(shop_url, access_token):

    body_html_content = f"""
                        <b>CCPA Privacy Policy</b>
                        <p>Our Privacy Policy was last updated on September 23, 2024.</p>
                        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
                        when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                        <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of
                        information in accordance with this Privacy Policy. This Privacy Policy was generated by TermsFeed PIPEDA Privacy Policy Template.</p>
                        <b>Interpretation and Definitions</b>
                        <b>Interpretation</b>
                        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.
                        The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                        <b>Definitions</b>
                        <p>For the purposes of this Privacy Policy:</p>
                        <ul>
                        <li><b>"Account"</b> means a unique account created for You to access our Service or parts of our Service.</li>
                        <li><b>"Company"</b> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to {shop_url}<br>
                        For the purpose of the GDPR, the Company is the Data Controller.</li>
                        <li><b>"Country"</b> refers to India.</li>
                        <li><b>"Cookies"</b> are small files that are placed on Your computer, mobile device or any other device by a website,
                        containing the details of Your browsing history on that website among its many uses.</li>
                        <li><b>"Data Controller"</b>, for the purposes of the GDPR (General Data Protection Regulation), refers to the Company as the
                        legal person which alone or jointly with others determines the purposes and means of the processing of Personal Data.</li>
                        <li><b>"Device"</b> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                        <li><b>"Personal Data"</b> is any information that relates to an identified or identifiable individual.<br>
                        For the purposes of GDPR, Personal Data means any information relating to You such as a name, an identification number, 
                        location data, online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic,
                        cultural or social identity.</li>
                        <li><b>"Service"</b> refers to the Website.</li>
                        <li><b>"Service Provider"</b> means any natural or legal person who processes the data on behalf of the Company. It refers to
                        third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf
                        of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                        For the purpose of the GDPR, Service Providers are considered Data Processors.</li>
                        <li><b>"Usage Data"</b> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself
                        (for example, the duration of a page visit).</li>
                        <li><b>"Website"</b> refers to WomenStore15, accessible from {shop_url}</li>
                        <li><b>"You"</b> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual
                        is accessing or using the Service, as applicable.br>
                        Under GDPR (General Data Protection Regulation), You can be referred to as the Data Subject or as the
                        User as you are the individual using the Service.</li>
                        </ul>
                        <b>Collecting and Using Your Personal Data</b>
                        <b>Types of Data Collected</b>
                        <b>Personal Data</b>
                        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact
                        or identify You. Personally identifiable information may include, but is not limited to:</p>
                        <ul>
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Usage Data</li>
                        </ul>
                        <b>Usage Data</b>
                        <p>Usage Data is collected automatically when using the Service.</p>
                        <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type,
                        browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages,
                        unique device identifiers and other diagnostic data.</p>
                        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including,
                        but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device,
                        Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic
                        data.</p>
                        <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or
                        through a mobile device.</p>
                        <b>Tracking Technologies and Cookies</b>
                        <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. 
                        Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our
                        Service. The technologies We use may include:</p>
                        <ul>
                        <li><b>Cookies or Browser Cookies.</b> A cookie is a small file placed on Your Device. You can instruct Your browser to
                        refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to
                        use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may
                        use Cookies.</li>
                        <li><b>Web Beacons.</b>Certain sections of our Service and our emails may contain small electronic files known as web beacons 
                        (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who
                        have visited those pages or opened an email and for other related website statistics (for example, recording the popularity
                        of a certain section and verifying system and server integrity).</li>
                        </ul>
                        <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when
                        You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
                        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
                        <ul>
                        <li><b>Necessary / Essential Cookies</b><br>
                        <p>Type: Session Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use
                        some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies,
                        the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p></li>
                        <li><b>Cookies Policy / Notice Acceptance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p></li>
                        <li><b>Functionality Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login
                        details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to
                        avoid You having to re-enter your preferences every time You use the Website.</p></li>
                        <li><b>Tracking and Performance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Third-Parties</p>
                        <p>Purpose: These Cookies are used to track information about traffic to the Website and how users use the Website.
                        The information gathered via these Cookies may directly or indirectly identify you as an individual visitor.
                        This is because the information collected is typically linked to a pseudonymous identifier associated with the device
                        you use to access the Website. We may also use these Cookies to test new pages, features or new functionality of the Website
                        to see how our users react to them.</p></li>
                        </ul>
                        <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy
                        or the Cookies section of our Privacy Policy.</p>
                        <b>Use of Your Personal Data</b>
                        <p>The Company may use Personal Data for the following purposes:</p>
                        <ul>
                        <li><b>To provide and maintain our Service</b>, including to monitor the usage of our Service.</li>
                        <li><b>To manage Your Account:</b>to manage Your registration as a user of the Service. The Personal Data You provide can
                        give You access to different functionalities of the Service that are available to You as a registered user.</li>
                        <li><b>For the performance of a contract:</b>the development, compliance and undertaking of the purchase contract for the
                        products, items or services You have purchased or of any other contract with Us through the Service.</li>
                        <li><b>To contact You:</b>To contact You by email, telephone calls, SMS, or other equivalent forms of electronic
                        communication, such as a mobile application's push notifications regarding updates or informative communications related
                        to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for
                        their implementation.</li>
                        <li><b>To provide You</b>with news, special offers and general information about other goods, services and events which we
                        offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such
                        information.</li>
                        <li><b>To manage Your requests:</b>To attend and manage Your requests to Us.</li>
                        <li><b>For business transfers:</b>We may use Your information to evaluate or conduct a merger, divestiture, restructuring,
                        reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part
                        of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the
                        assets transferred.</li>
                        <li><b>For other purposes:</b> We may use Your information for other purposes, such as data analysis, identifying usage
                        trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products,
                        services, marketing and your experience.</li>
                        </ul>
                        <p>We may share Your personal information in the following situations:</p>
                        <ul>
                        <li><b>With Service Providers:</b>We may share Your personal information with Service Providers to monitor and analyze the
                        use of our Service, for payment processing, to contact You.</li>
                        <li><b>For business transfers:</b>We may share or transfer Your personal information in connection with, or during
                        negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to
                        another company.</li>
                        <li><b>With Affiliates:</b>We may share Your information with Our affiliates, in which case we will require those affiliates
                        to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or
                        other companies that We control or that are under common control with Us.</li>
                        <li><b>With business partners:</b>We may share Your information with Our business partners to offer You certain products,
                        services or promotions.</li>
                        <li><b>With other users:</b>when You share personal information or otherwise interact in the public areas with other users,
                        such information may be viewed by all users and may be publicly distributed outside.</li>
                        <li><b>With Your consent:</b>We may disclose Your personal information for any other purpose with Your consent.</li>
                        </ul>
                        <b>Retention of Your Personal Data</b>
                        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy
                        Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example,
                        if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements
                        and policies.</p>
                        <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter
                        period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service,
                        or We are legally obligated to retain this data for longer time periods.</p>
                        <b>Transfer of Your Personal Data</b>
                        <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where
                        the parties involved in the processing are located. It means that this information may be transferred to — and maintained
                        on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection
                        laws may differ than those from Your jurisdiction.</p>
                        <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
                        <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with
                        this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are
                        adequate controls in place including the security of Your data and other personal information.</p>
                        <b>Disclosure of Your Personal Data</b>
                        <b>Business Transactions</b>
                        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide
                        notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
                        <b>Law enforcement</b>
                        <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in
                        response to valid requests by public authorities (e.g. a court or a government agency).</p>
                        <b>Other legal requirements</b>
                        <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul>
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend the rights or property of the Company</li>
                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>Protect the personal safety of Users of the Service or the public</li>
                        <li>Protect against legal liability</li>
                        </ul>
                        <b>Security of Your Personal Data</b>
                        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or
                        method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal
                        Data, We cannot guarantee its absolute security.</p>
                        <b>Detailed Information on the Processing of Your Personal Data</b>
                        <p>The Service Providers We use may have access to Your Personal Data. These third-party vendors collect, store, use, process
                        and transfer information about Your activity on Our Service in accordance with their Privacy Policies.</p>
                        <b>Analytics</b>
                        <p>We may use third-party Service providers to monitor and analyze the use of our Service.</p>
                        <b>Email Marketing</b>
                        <p>We may use Your Personal Data to contact You with newsletters, marketing or promotional materials and other
                         information that may be of interest to You. You may opt-out of receiving any, or all, of these communications
                         from Us by following the unsubscribe link or instructions provided in any email We send or by contacting Us.</p>
                        <b>CCPA Privacy</b>
                        <p>This privacy notice section for California residents supplements the information contained in Our Privacy Policy
                         and it applies solely to all visitors, users, and others who reside in the State of California.</p>
                        <b>Categories of Personal Information Collected</b>
                        <p>We collect information that identifies, relates to, describes, references, is capable of being associated with,
                         or could reasonably be linked, directly or indirectly, with a particular Consumer or Device. The following is a
                         list of categories of personal information which we may collect or may have been collected from California
                         residents within the last twelve (12) months.</p>
                        <p>Please note that the categories and examples provided in the list below are those defined in the CCPA. This
                         does not mean that all examples of that category of personal information were in fact collected by Us, but
                         reflects our good faith belief to the best of our knowledge that some of that information from the applicable
                         category may be and may have been collected. For example, certain categories of personal information would only be
                         collected if You provided such personal information directly to Us.</p>
                        <ul>
                        <li><b>Category A: Identifiers.</b><br>
                        <p>Examples: A real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol
                         address, email address, account name, driver's license number, passport number, or other similar identifiers.</p>
                        <p>Collected: Yes.</p></li>
                        <li><b>Category B: Personal information categories listed in the California Customer Records statute (Cal. Civ.
                          Code § 1798.80(e)).</b><br>
                        <p>Examples: A name, signature, Social Security number, physical characteristics or description, address, telephone
                         number, passport number, driver's license or state identification card number, insurance policy number, education,
                         employment, employment history, bank account number, credit card number, debit card number, or any other financial
                         information, medical information, or health insurance information. Some personal information included in this
                         category may overlap with other categories.</p>
                        <p>Collected: Yes.</p></li>
                        <li><b>Category C: Protected classification characteristics under California or federal law.</b><br>
                        <p>Examples: Age (40 years or older), race, color, ancestry, national origin, citizenship, religion or creed,
                         marital status, medical condition, physical or mental disability, sex (including gender, gender identity,
                         gender expression, pregnancy or childbirth and related medical conditions), sexual orientation, veteran or military
                         status, genetic information (including familial genetic information).</p>
                        <p>Collected: No.</p></li>
                        <li><b>Category D: Commercial information.</b><br>
                        <p>Examples: Records and history of products or services purchased or considered.</p>
                        <p>Collected: Yes.</p></li>
                        <li><b>Category E: Biometric information.</b><br>
                        <p>Examples: Genetic, physiological, behavioral, and biological characteristics, or activity patterns used to extract
                         a template or other identifier or identifying information, such as, fingerprints, faceprints, and voiceprints, iris
                         or retina scans, keystroke, gait, or other physical patterns, and sleep, health, or exercise data.</p>
                        <p>Collected: No.</p></li>
                        <li><b>Category F: Internet or other similar network activity.</b><br>
                        <p>Examples: Interaction with our Service or advertisement.</p>
                        <p>Collected: Yes.</p></li>
                        <li><b>Category G: Geolocation data.</b><br>
                        <p>Examples: Approximate physical location.</p>
                        <p>Collected: No.</p></li>
                        <li><b>Category H: Sensory data.</b><br>
                        <p>Examples: Audio, electronic, visual, thermal, olfactory, or similar information.</p>
                        <p>Collected: No.</p></li>
                        <li><b>Category I: Professional or employment-related information.</b><br>
                        <p>Examples: Current or past job history or performance evaluations.</p>
                        <p>Collected: No.</p></li>
                        <li><b>Category J: Non-public education information (per the Family Educational Rights and Privacy Act
                         (20 U.S.C. Section 1232g, 34 C.F.R. Part 99)).</b><br>
                        <p>Examples: Education records directly related to a student maintained by an educational institution or party
                         acting on its behalf, such as grades, transcripts, class lists, student schedules, student identification codes,
                         student financial information, or student disciplinary records.</p>
                        <p>Collected: No.</p></li>
                        <li><b>Category K: Inferences drawn from other personal information.</b><br>
                        <p>Examples: Profile reflecting a person's preferences, characteristics, psychological trends, predispositions,
                         behavior, attitudes, intelligence, abilities, and aptitudes.</p>
                        <p>Collected: No.</p></li>
                        </ul>
                        <p>Under CCPA, personal information does not include:</p>
                        <ul>
                        <li>Publicly available information from government records</li>
                        <li>Deidentified or aggregated consumer information</li>
                        <li><p>Information excluded from the CCPA's scope, such as:</p>
                        <ul>
                        <li>Health or medical information covered by the Health Insurance Portability and Accountability Act of 1996
                         (HIPAA) and the California Confidentiality of Medical Information Act (CMIA) or clinical trial data</li>
                        <li>Personal Information covered by certain sector-specific privacy laws, including the Fair Credit Reporting Act
                         (FRCA), the Gramm-Leach-Bliley Act (GLBA) or California Financial Information Privacy Act (FIPA), and the Driver's
                         Privacy Protection Act of 1994</li>
                        </ul>
                        </li>
                        </ul>
                        <b>Sources of Personal Information</b>
                        <p>We obtain the categories of personal information listed above from the following categories of sources:</p>
                        <ul>
                        <li><b>Directly from You.</b> For example, from the forms You complete on our Service, preferences You express or
                         provide through our Service, or from Your purchases on our Service.</li>
                        <li><b>Indirectly from You.</b>For example, from observing Your activity on our Service.</li>
                        <li><b>Automatically from You.</b>For example, through cookies We or our Service Providers set on Your Device as You
                         navigate through our Service.</li>
                        <li><b>From Service Providers.</b>For example, third-party vendors to monitor and analyze the use of our Service,
                         third-party vendors for payment processing, or other third-party vendors that We use to provide the Service to You.</li>
                        </ul>
                        <b>Use of Personal Information for Business Purposes or Commercial Purposes</b>
                        <p>We may use or disclose personal information We collect for "business purposes" or "commercial purposes"
                         (as defined under the CCPA), which may include the following examples:</p>
                        <ul>
                        <li>To operate our Service and provide You with our Service.</li>
                        <li>To provide You with support and to respond to Your inquiries, including to investigate and address Your concerns
                         and monitor and improve our Service.</li>
                        <li>To fulfill or meet the reason You provided the information. For example, if You share Your contact information
                         to ask a question about our Service, We will use that personal information to respond to Your inquiry. If You
                         provide Your personal information to purchase a product or service, We will use that information to process Your
                         payment and facilitate delivery.</li>
                        <li>To respond to law enforcement requests and as required by applicable law, court order, or governmental regulations.</li>
                        <li>As described to You when collecting Your personal information or as otherwise set forth in the CCPA.</li>
                        <li>For internal administrative and auditing purposes.</li>
                        <li>To detect security incidents and protect against malicious, deceptive, fraudulent or illegal activity, including,
                         when necessary, to prosecute those responsible for such activities.</li>
                        </ul>
                        <p>Please note that the examples provided above are illustrative and not intended to be exhaustive. For more details
                         on how we use this information, please refer to the "Use of Your Personal Data" section.</p>
                        <p>If We decide to collect additional categories of personal information or use the personal information We
                         collected for materially different, unrelated, or incompatible purposes We will update this Privacy Policy.</p>
                        <b>Disclosure of Personal Information for Business Purposes or Commercial Purposes</b>
                        <p>We may use or disclose and may have used or disclosed in the last twelve (12) months the following categories of
                         personal information for business or commercial purposes:</p>
                        <ul>
                        <li>Category A: Identifiers</li>
                        <li>Category B: Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e))</li>
                        <li>Category D: Commercial information</li>
                        <li>Category F: Internet or other similar network activity</li>
                        <p>Please note that the categories listed above are those defined in the CCPA. This does not mean that all examples
                         of that category of personal information were in fact disclosed, but reflects our good faith belief to the best of
                         our knowledge that some of that information from the applicable category may be and may have been disclosed.</p>
                        <p>When We disclose personal information for a business purpose or a commercial purpose, We enter a contract that
                         describes the purpose and requires the recipient to both keep that personal information confidential and not use it
                         for any purpose except performing the contract.</p>
                        </ul>
                        <b>Sale of Personal Information</b>
                        <p>As defined in the CCPA, "sell" and "sale" mean selling, renting, releasing, disclosing, disseminating, making
                         available, transferring, or otherwise communicating orally, in writing, or by electronic or other means, a
                         consumer's personal information by the business to a third party for valuable consideration. This means that
                         We may have received some kind of benefit in return for sharing personal information, but not necessarily a
                         monetary benefit.</p>
                        <p>Please note that the categories listed below are those defined in the CCPA. This does not mean that all examples
                         of that category of personal information were in fact sold, but reflects our good faith belief to the best of our
                         knowledge that some of that information from the applicable category may be and may have been shared for value in
                         return.</p>
                        <p>We may sell and may have sold in the last twelve (12) months the following categories of personal information:</p>
                        <ul>
                        <li>Category A: Identifiers</li>
                        <li>Category B: Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e))</li>
                        <li>Category D: Commercial information</li>
                        <li>Category F: Internet or other similar network activity</li>
                        </ul>
                        <b>Share of Personal Information</b>
                        <p>We may share Your personal information identified in the above categories with the following categories of third parties:</p>
                        <ul>
                        <li>Service Providers</li>
                        <li>Payment processors</li>
                        <li>Our affiliates</li>
                        <li>Our business partners</li>
                        <li>Third party vendors to whom You or Your agents authorize Us to disclose Your personal information in connection
                         with products or services We provide to You</li>
                        </ul>
                        <b>Sale of Personal Information of Minors Under 16 Years of Age</b>
                        <p>We do not knowingly collect personal information from minors under the age of 16 through our Service, although
                         certain third party websites that we link to may do so. These third-party websites have their own terms of use and
                         privacy policies and we encourage parents and legal guardians to monitor their children's Internet usage and
                         instruct their children to never provide information on other websites without their permission.</p>
                        <p>We do not sell the personal information of Consumers We actually know are less than 16 years of age, unless We
                         receive affirmative authorization (the "right to opt-in") from either the Consumer who is between 13 and 16 years
                         of age, or the parent or guardian of a Consumer less than 13 years of age. Consumers who opt-in to the sale of
                         personal information may opt-out of future sales at any time. To exercise the right to opt-out, You
                         (or Your authorized representative) may submit a request to Us by contacting Us.</p>
                        <p>If You have reason to believe that a child under the age of 13 (or 16) has provided Us with personal information,
                         please contact Us with sufficient detail to enable Us to delete that information.</p>
                        <b>Your Rights under the CCPA</b>
                        <p>The CCPA provides California residents with specific rights regarding their personal information. If You are a
                         resident of California, You have the following rights:</p>
                        <ul>
                        <li><b>The right to notice.</b>You have the right to be notified which categories of Personal Data are being
                         collected and the purposes for which the Personal Data is being used.</li>
                        <li><b>The right to request.</b>Under CCPA, You have the right to request that We disclose information to You about
                         Our collection, use, sale, disclosure for business purposes and share of personal information. Once We receive and
                         confirm Your request, We will disclose to You:
                         <ul>
                         <li>The categories of personal information We collected about You</li>
                         <li>The categories of sources for the personal information We collected about You</li>
                         <li>Our business or commercial purpose for collecting or selling that personal information</li>
                         <li>The categories of third parties with whom We share that personal information</li>
                         <li>The specific pieces of personal information We collected about You</li>
                         <li>If we sold Your personal information or disclosed Your personal information for a business purpose, We will
                          disclose to You:
                          <ul>
                          <li>The categories of personal information categories sold</li>
                          <li>The categories of personal information categories disclosed</li>
                          </ul></li>
                         </ul></li>
                        <li><b>The right to say no to the sale of Personal Data (opt-out). </b>You have the right to direct Us to not sell
                         Your personal information. To submit an opt-out request please contact Us.</li>
                        <li><b>The right to delete Personal Data. </b>You have the right to request the deletion of Your Personal Data,
                         subject to certain exceptions. Once We receive and confirm Your request, We will delete (and direct Our Service
                         Providers to delete) Your personal information from our records, unless an exception applies. We may deny Your
                         deletion request if retaining the information is necessary for Us or Our Service Providers to:
                         <ul>
                         <li>Complete the transaction for which We collected the personal information, provide a good or service that You
                          requested, take actions reasonably anticipated within the context of our ongoing business relationship with You,
                          or otherwise perform our contract with You.</li>
                         <li>Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity, or prosecute
                          those responsible for such activities.</li>
                         <li>Debug products to identify and repair errors that impair existing intended functionality.</li>
                         <li>Exercise free speech, ensure the right of another consumer to exercise their free speech rights, or exercise
                          another right provided for by law.</li>
                         <li>Comply with the California Electronic Communications Privacy Act (Cal. Penal Code § 1546 et. seq.).</li>
                         <li>Engage in public or peer-reviewed scientific, historical, or statistical research in the public interest that
                          adheres to all other applicable ethics and privacy laws, when the information's deletion may likely render
                          impossible or seriously impair the research's achievement, if You previously provided informed consent.</li>
                         <li>Enable solely internal uses that are reasonably aligned with consumer expectations based on Your relationship with Us.</li>
                         <li>Comply with a legal obligation.</li>
                         <li>Make other internal and lawful uses of that information that are compatible with the context in which You provided it.</li>
                         </ul></li>
                        <li><b>The right not to be discriminated against. </b> You have the right not to be discriminated against for
                         exercising any of Your consumer's rights, including by:
                         <ul>
                         <li>Denying goods or services to You</li>
                         <li>Charging different prices or rates for goods or services, including the use of discounts or other benefits or
                          imposing penalties</li>
                         <li>Providing a different level or quality of goods or services to You</li>
                         <li>Suggesting that You will receive a different price or rate for goods or services or a different level or
                          quality of goods or services</li>
                         </ul></li>
                        </ul>
                        <b>Exercising Your CCPA Data Protection Rights</b>
                        <p>In order to exercise any of Your rights under the CCPA, and if You are a California resident, You can contact Us:</p>
                        <ul>
                        <li>By visiting this page on our website: {shop_url}</li>
                        </ul>
                        <p>Only You, or a person registered with the California Secretary of State that You authorize to act on Your behalf,
                         may make a verifiable request related to Your personal information.</p>
                        <p>Your request to Us must:</p>
                        <ul>
                        <li>Provide sufficient information that allows Us to reasonably verify You are the person about whom We collected
                         personal information or an authorized representative</li>
                        <li>Describe Your request with sufficient detail that allows Us to properly understand, evaluate, and respond to it</li>
                        </ul>
                        <p>We cannot respond to Your request or provide You with the required information if we cannot:</p>
                        <ul>
                        <li>Verify Your identity or authority to make the request</li>
                        <li>And confirm that the personal information relates to You</li>
                        </ul>
                        <p>We will disclose and deliver the required information free of charge within 45 days of receiving Your verifiable
                         request. The time period to provide the required information may be extended once by an additional 45 days when
                         reasonably necessary and with prior notice.</p>
                        <p>Any disclosures We provide will only cover the 12-month period preceding the verifiable request's receipt.</p>
                        <p>For data portability requests, We will select a format to provide Your personal information that is readily
                         usable and should allow You to transmit the information from one entity to another entity without hindrance.</p>
                        <b>Do Not Sell My Personal Information</b>
                        <p>You have the right to opt-out of the sale of Your personal information. Once We receive and confirm a verifiable
                         consumer request from You, we will stop selling Your personal information. To exercise Your right to opt-out,
                         please contact Us.</p>
                        <p>The Service Providers we partner with (for example, our analytics or advertising partners) may use technology on
                         the Service that sells personal information as defined by the CCPA law. If you wish to opt out of the use of Your
                         personal information for interest-based advertising purposes and these potential sales as defined under CCPA law,
                         you may do so by following the instructions below.</p>
                        <p>Please note that any opt out is specific to the browser You use. You may need to opt out on every browser that You use.</p>
                        <p>“To opt out of the “sale” or “sharing” of your personal information collected using cookies and other device-based
                         identifiers as described above, you must be browsing from one of the applicable US states defined under CCPA law.”</p>
                        <b>Website</b>
                        <p>You can opt out of receiving ads that are personalized as served by our Service Providers by following our
                         instructions presented on the Service:</p>
                        <ul>
                        <li>The NAI's opt-out platform:<a href="http://www.networkadvertising.org/choices/">http://www.networkadvertising.org/choices/</a></li>
                        <li>The EDAA's opt-out platform<a href=" http://www.youronlinechoices.com/"> http://www.youronlinechoices.com/</a></li>
                        <li>The DAA's opt-out platform:<a href=" http://optout.aboutads.info/?c=2&lang=EN"> http://optout.aboutads.info/?c=2&lang=EN</a></li>
                        </ul>
                        <p>The opt out will place a cookie on Your computer that is unique to the browser You use to opt out. If you change
                         browsers or delete the cookies saved by your browser, You will need to opt out again.</p>
                        <b>Mobile Devices</b>
                        <p>Your mobile device may give You the ability to opt out of the use of information about the apps You use in order
                         to serve You ads that are targeted to Your interests:</p>
                        <ul>
                        <li>"Opt out of Interest-Based Ads" or "Opt out of Ads Personalization" on Android devices</li>
                        <li>"Limit Ad Tracking" on iOS devices</li>
                        </ul>
                        <p>You can also stop the collection of location information from Your mobile device by changing the preferences on
                         Your mobile device.</p>
                        <b>Children's Privacy</b>
                        <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information
                        from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with
                        Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13
                        without verification of parental consent, We take steps to remove that information from Our servers.</p>
                        <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a
                        parent, We may require Your parent's consent before We collect and use that information.</p>
                        <b>Links to Other Websites</b>
                        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will
                        be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
                        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party
                        sites or services.</p>
                        <b>Changes to this Privacy Policy</b>
                        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy
                        on this page.</p>
                        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update
                        the "Last updated" date at the top of this Privacy Policy.</p>
                        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
                        when they are posted on this page.</p>
                        <!-- Add more detailed content about your privacy policy here -->
                    """

    url = f"https://{shop_url}/admin/api/2025-01/pages.json"  # Use latest API version
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }
    data = {
        "page": {
            "title": "CCPA Privacy Policy",
            "body_html": body_html_content
        }
    }
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        print("Privacy policy page created successfully.")
        return response.json()  # Returns page data if needed
    else:
        print("Error creating privacy policy page:", response.json())
        return None


def create_lgpd_privacy_policy_page(shop_url, access_token):

    body_html_content = f"""
                        <b>LGPD Privacy Policy</b>
                        <p>Our Privacy Policy was last updated on September 23, 2024.</p>
                        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
                        when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                        <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of
                        information in accordance with this Privacy Policy. This Privacy Policy was generated by TermsFeed Privacy Policy Generator.</p>
                        <b>Interpretation and Definitions</b>
                        <b>Interpretation</b>
                        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.
                        The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                        <b>Definitions</b>
                        <p>For the purposes of this Privacy Policy:</p>
                        <ul>
                        <li><b>"Account"</b> means a unique account created for You to access our Service or parts of our Service.</li>
                        <li><b>"Company"</b> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to {shop_url}<br>
                        For the purpose of the GDPR, the Company is the Data Controller.</li>
                        <li><b>"Country"</b> refers to India.</li>
                        <li><b>"Cookies"</b> are small files that are placed on Your computer, mobile device or any other device by a website,
                        containing the details of Your browsing history on that website among its many uses.</li>
                        <li><b>"Data Controller"</b>, for the purposes of the GDPR (General Data Protection Regulation), refers to the Company as the
                        legal person which alone or jointly with others determines the purposes and means of the processing of Personal Data.</li>
                        <li><b>"Device"</b> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                        <li><b>"Personal Data"</b> is any information that relates to an identified or identifiable individual.<br>
                        For the purposes of GDPR, Personal Data means any information relating to You such as a name, an identification number, 
                        location data, online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic,
                        cultural or social identity.</li>
                        <li><b>"Service"</b> refers to the Website.</li>
                        <li><b>"Service Provider"</b> means any natural or legal person who processes the data on behalf of the Company. It refers to
                        third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf
                        of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                        For the purpose of the GDPR, Service Providers are considered Data Processors.</li>
                        <li><b>"Usage Data"</b> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself
                        (for example, the duration of a page visit).</li>
                        <li><b>"Website"</b> refers to WomenStore15, accessible from {shop_url}</li>
                        <li><b>"You"</b> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual
                        is accessing or using the Service, as applicable.br>
                        Under GDPR (General Data Protection Regulation), You can be referred to as the Data Subject or as the
                        User as you are the individual using the Service.</li>
                        </ul>
                        <b>Collecting and Using Your Personal Data</b>
                        <b>Types of Data Collected</b>
                        <b>Personal Data</b>
                        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact
                        or identify You. Personally identifiable information may include, but is not limited to:</p>
                        <ul>
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Usage Data</li>
                        </ul>
                        <b>Usage Data</b>
                        <p>Usage Data is collected automatically when using the Service.</p>
                        <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type,
                        browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages,
                        unique device identifiers and other diagnostic data.</p>
                        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including,
                        but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device,
                        Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic
                        data.</p>
                        <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or
                        through a mobile device.</p>
                        <b>Tracking Technologies and Cookies</b>
                        <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. 
                        Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our
                        Service. The technologies We use may include:</p>
                        <ul>
                        <li><b>Cookies or Browser Cookies.</b> A cookie is a small file placed on Your Device. You can instruct Your browser to
                        refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to
                        use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may
                        use Cookies.</li>
                        <li><b>Web Beacons.</b>Certain sections of our Service and our emails may contain small electronic files known as web beacons 
                        (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who
                        have visited those pages or opened an email and for other related website statistics (for example, recording the popularity
                        of a certain section and verifying system and server integrity).</li>
                        </ul>
                        <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when
                        You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
                        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
                        <ul>
                        <li><b>Necessary / Essential Cookies</b><br>
                        <p>Type: Session Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use
                        some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies,
                        the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p></li>
                        <li><b>Cookies Policy / Notice Acceptance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p></li>
                        <li><b>Functionality Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login
                        details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to
                        avoid You having to re-enter your preferences every time You use the Website.</p></li>
                        <li><b>Tracking and Performance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Third-Parties</p>
                        <p>Purpose: These Cookies are used to track information about traffic to the Website and how users use the Website.
                        The information gathered via these Cookies may directly or indirectly identify you as an individual visitor.
                        This is because the information collected is typically linked to a pseudonymous identifier associated with the device
                        you use to access the Website. We may also use these Cookies to test new pages, features or new functionality of the Website
                        to see how our users react to them.</p></li>
                        </ul>
                        <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy
                        or the Cookies section of our Privacy Policy.</p>
                        <b>Use of Your Personal Data</b>
                        <p>The Company may use Personal Data for the following purposes:</p>
                        <ul>
                        <li><b>To provide and maintain our Service</b>, including to monitor the usage of our Service.</li>
                        <li><b>To manage Your Account:</b>to manage Your registration as a user of the Service. The Personal Data You provide can
                        give You access to different functionalities of the Service that are available to You as a registered user.</li>
                        <li><b>For the performance of a contract:</b>the development, compliance and undertaking of the purchase contract for the
                        products, items or services You have purchased or of any other contract with Us through the Service.</li>
                        <li><b>To contact You:</b>To contact You by email, telephone calls, SMS, or other equivalent forms of electronic
                        communication, such as a mobile application's push notifications regarding updates or informative communications related
                        to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for
                        their implementation.</li>
                        <li><b>To provide You</b>with news, special offers and general information about other goods, services and events which we
                        offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such
                        information.</li>
                        <li><b>To manage Your requests:</b>To attend and manage Your requests to Us.</li>
                        <li><b>For business transfers:</b>We may use Your information to evaluate or conduct a merger, divestiture, restructuring,
                        reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part
                        of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the
                        assets transferred.</li>
                        <li><b>For other purposes:</b> We may use Your information for other purposes, such as data analysis, identifying usage
                        trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products,
                        services, marketing and your experience.</li>
                        </ul>
                        <p>We may share Your personal information in the following situations:</p>
                        <ul>
                        <li><b>With Service Providers:</b>We may share Your personal information with Service Providers to monitor and analyze the
                        use of our Service, for payment processing, to contact You.</li>
                        <li><b>For business transfers:</b>We may share or transfer Your personal information in connection with, or during
                        negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to
                        another company.</li>
                        <li><b>With Affiliates:</b>We may share Your information with Our affiliates, in which case we will require those affiliates
                        to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or
                        other companies that We control or that are under common control with Us.</li>
                        <li><b>With business partners:</b>We may share Your information with Our business partners to offer You certain products,
                        services or promotions.</li>
                        <li><b>With other users:</b>when You share personal information or otherwise interact in the public areas with other users,
                        such information may be viewed by all users and may be publicly distributed outside.</li>
                        <li><b>With Your consent:</b>We may disclose Your personal information for any other purpose with Your consent.</li>
                        </ul>
                        <b>Retention of Your Personal Data</b>
                        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy
                        Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example,
                        if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements
                        and policies.</p>
                        <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter
                        period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service,
                        or We are legally obligated to retain this data for longer time periods.</p>
                        <b>Transfer of Your Personal Data</b>
                        <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where
                        the parties involved in the processing are located. It means that this information may be transferred to — and maintained
                        on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection
                        laws may differ than those from Your jurisdiction.</p>
                        <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
                        <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with
                        this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are
                        adequate controls in place including the security of Your data and other personal information.</p>
                        <b>Disclosure of Your Personal Data</b>
                        <b>Business Transactions</b>
                        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide
                        notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
                        <b>Law enforcement</b>
                        <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in
                        response to valid requests by public authorities (e.g. a court or a government agency).</p>
                        <b>Other legal requirements</b>
                        <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul>
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend the rights or property of the Company</li>
                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>Protect the personal safety of Users of the Service or the public</li>
                        <li>Protect against legal liability</li>
                        </ul>
                        <b>Security of Your Personal Data</b>
                        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or
                        method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal
                        Data, We cannot guarantee its absolute security.</p>
                        <b>Children's Privacy</b>
                        <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information
                        from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with
                        Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13
                        without verification of parental consent, We take steps to remove that information from Our servers.</p>
                        <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a
                        parent, We may require Your parent's consent before We collect and use that information.</p>
                        <b>Links to Other Websites</b>
                        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will
                        be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
                        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party
                        sites or services.</p>
                        <b>Changes to this Privacy Policy</b>
                        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy
                        on this page.</p>
                        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update
                        the "Last updated" date at the top of this Privacy Policy.</p>
                        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
                        when they are posted on this page.</p>
                        <!-- Add more detailed content about your privacy policy here -->
                    """

    url = f"https://{shop_url}/admin/api/2025-01/pages.json"  # Use latest API version
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }
    data = {
        "page": {
            "title": "LGPD Privacy Policy",
            "body_html": body_html_content
        }
    }
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        print("Privacy policy page created successfully.")
        return response.json()  # Returns page data if needed
    else:
        print("Error creating privacy policy page:", response.json())
        return None


def create_appi_privacy_policy_page(shop_url, access_token):

    body_html_content = f"""
                        <b>APPI Privacy Policy</b>
                        <p>Our Privacy Policy was last updated on September 23, 2024.</p>
                        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
                        when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                        <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of
                        information in accordance with this Privacy Policy. This Privacy Policy was generated by TermsFeed Privacy Policy Generator.</p>
                        <b>Interpretation and Definitions</b>
                        <b>Interpretation</b>
                        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.
                        The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                        <b>Definitions</b>
                        <p>For the purposes of this Privacy Policy:</p>
                        <ul>
                        <li><b>"Account"</b> means a unique account created for You to access our Service or parts of our Service.</li>
                        <li><b>"Company"</b> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to {shop_url}<br>
                        For the purpose of the GDPR, the Company is the Data Controller.</li>
                        <li><b>"Country"</b> refers to India.</li>
                        <li><b>"Cookies"</b> are small files that are placed on Your computer, mobile device or any other device by a website,
                        containing the details of Your browsing history on that website among its many uses.</li>
                        <li><b>"Data Controller"</b>, for the purposes of the GDPR (General Data Protection Regulation), refers to the Company as the
                        legal person which alone or jointly with others determines the purposes and means of the processing of Personal Data.</li>
                        <li><b>"Device"</b> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                        <li><b>"Personal Data"</b> is any information that relates to an identified or identifiable individual.<br>
                        For the purposes of GDPR, Personal Data means any information relating to You such as a name, an identification number, 
                        location data, online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic,
                        cultural or social identity.</li>
                        <li><b>"Service"</b> refers to the Website.</li>
                        <li><b>"Service Provider"</b> means any natural or legal person who processes the data on behalf of the Company. It refers to
                        third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf
                        of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                        For the purpose of the GDPR, Service Providers are considered Data Processors.</li>
                        <li><b>"Usage Data"</b> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself
                        (for example, the duration of a page visit).</li>
                        <li><b>"Website"</b> refers to WomenStore15, accessible from {shop_url}</li>
                        <li><b>"You"</b> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual
                        is accessing or using the Service, as applicable.br>
                        Under GDPR (General Data Protection Regulation), You can be referred to as the Data Subject or as the
                        User as you are the individual using the Service.</li>
                        </ul>
                        <b>Collecting and Using Your Personal Data</b>
                        <b>Types of Data Collected</b>
                        <b>Personal Data</b>
                        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact
                        or identify You. Personally identifiable information may include, but is not limited to:</p>
                        <ul>
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Usage Data</li>
                        </ul>
                        <b>Usage Data</b>
                        <p>Usage Data is collected automatically when using the Service.</p>
                        <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type,
                        browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages,
                        unique device identifiers and other diagnostic data.</p>
                        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including,
                        but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device,
                        Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic
                        data.</p>
                        <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or
                        through a mobile device.</p>
                        <b>Tracking Technologies and Cookies</b>
                        <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. 
                        Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our
                        Service. The technologies We use may include:</p>
                        <ul>
                        <li><b>Cookies or Browser Cookies.</b> A cookie is a small file placed on Your Device. You can instruct Your browser to
                        refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to
                        use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may
                        use Cookies.</li>
                        <li><b>Web Beacons.</b>Certain sections of our Service and our emails may contain small electronic files known as web beacons 
                        (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who
                        have visited those pages or opened an email and for other related website statistics (for example, recording the popularity
                        of a certain section and verifying system and server integrity).</li>
                        </ul>
                        <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when
                        You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
                        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
                        <ul>
                        <li><b>Necessary / Essential Cookies</b><br>
                        <p>Type: Session Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use
                        some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies,
                        the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p></li>
                        <li><b>Cookies Policy / Notice Acceptance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p></li>
                        <li><b>Functionality Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Us</p>
                        <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login
                        details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to
                        avoid You having to re-enter your preferences every time You use the Website.</p></li>
                        <li><b>Tracking and Performance Cookies</b><br>
                        <p>Type: Persistent Cookies</p>
                        <p>Administered by: Third-Parties</p>
                        <p>Purpose: These Cookies are used to track information about traffic to the Website and how users use the Website.
                        The information gathered via these Cookies may directly or indirectly identify you as an individual visitor.
                        This is because the information collected is typically linked to a pseudonymous identifier associated with the device
                        you use to access the Website. We may also use these Cookies to test new pages, features or new functionality of the Website
                        to see how our users react to them.</p></li>
                        </ul>
                        <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy
                        or the Cookies section of our Privacy Policy.</p>
                        <b>Use of Your Personal Data</b>
                        <p>The Company may use Personal Data for the following purposes:</p>
                        <ul>
                        <li><b>To provide and maintain our Service</b>, including to monitor the usage of our Service.</li>
                        <li><b>To manage Your Account:</b>to manage Your registration as a user of the Service. The Personal Data You provide can
                        give You access to different functionalities of the Service that are available to You as a registered user.</li>
                        <li><b>For the performance of a contract:</b>the development, compliance and undertaking of the purchase contract for the
                        products, items or services You have purchased or of any other contract with Us through the Service.</li>
                        <li><b>To contact You:</b>To contact You by email, telephone calls, SMS, or other equivalent forms of electronic
                        communication, such as a mobile application's push notifications regarding updates or informative communications related
                        to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for
                        their implementation.</li>
                        <li><b>To provide You</b>with news, special offers and general information about other goods, services and events which we
                        offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such
                        information.</li>
                        <li><b>To manage Your requests:</b>To attend and manage Your requests to Us.</li>
                        <li><b>For business transfers:</b>We may use Your information to evaluate or conduct a merger, divestiture, restructuring,
                        reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part
                        of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the
                        assets transferred.</li>
                        <li><b>For other purposes:</b> We may use Your information for other purposes, such as data analysis, identifying usage
                        trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products,
                        services, marketing and your experience.</li>
                        </ul>
                        <p>We may share Your personal information in the following situations:</p>
                        <ul>
                        <li><b>With Service Providers:</b>We may share Your personal information with Service Providers to monitor and analyze the
                        use of our Service, for payment processing, to contact You.</li>
                        <li><b>For business transfers:</b>We may share or transfer Your personal information in connection with, or during
                        negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to
                        another company.</li>
                        <li><b>With Affiliates:</b>We may share Your information with Our affiliates, in which case we will require those affiliates
                        to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or
                        other companies that We control or that are under common control with Us.</li>
                        <li><b>With business partners:</b>We may share Your information with Our business partners to offer You certain products,
                        services or promotions.</li>
                        <li><b>With other users:</b>when You share personal information or otherwise interact in the public areas with other users,
                        such information may be viewed by all users and may be publicly distributed outside.</li>
                        <li><b>With Your consent:</b>We may disclose Your personal information for any other purpose with Your consent.</li>
                        </ul>
                        <b>Retention of Your Personal Data</b>
                        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy
                        Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example,
                        if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements
                        and policies.</p>
                        <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter
                        period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service,
                        or We are legally obligated to retain this data for longer time periods.</p>
                        <b>Transfer of Your Personal Data</b>
                        <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where
                        the parties involved in the processing are located. It means that this information may be transferred to — and maintained
                        on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection
                        laws may differ than those from Your jurisdiction.</p>
                        <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
                        <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with
                        this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are
                        adequate controls in place including the security of Your data and other personal information.</p>
                        <b>Disclosure of Your Personal Data</b>
                        <b>Business Transactions</b>
                        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide
                        notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
                        <b>Law enforcement</b>
                        <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in
                        response to valid requests by public authorities (e.g. a court or a government agency).</p>
                        <b>Other legal requirements</b>
                        <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul>
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend the rights or property of the Company</li>
                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>Protect the personal safety of Users of the Service or the public</li>
                        <li>Protect against legal liability</li>
                        </ul>
                        <b>Security of Your Personal Data</b>
                        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or
                        method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal
                        Data, We cannot guarantee its absolute security.</p>
                        <b>Children's Privacy</b>
                        <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information
                        from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with
                        Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13
                        without verification of parental consent, We take steps to remove that information from Our servers.</p>
                        <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a
                        parent, We may require Your parent's consent before We collect and use that information.</p>
                        <b>Links to Other Websites</b>
                        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will
                        be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
                        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party
                        sites or services.</p>
                        <b>Changes to this Privacy Policy</b>
                        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy
                        on this page.</p>
                        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update
                        the "Last updated" date at the top of this Privacy Policy.</p>
                        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
                        when they are posted on this page.</p>
                        <!-- Add more detailed content about your privacy policy here -->
                    """

    url = f"https://{shop_url}/admin/api/2025-01/pages.json"  # Use latest API version
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }
    data = {
        "page": {
            "title": "APPI Privacy Policy",
            "body_html": body_html_content
        }
    }
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        print("Privacy policy page created successfully.")
        return response.json()  # Returns page data if needed
    else:
        print("Error creating privacy policy page:", response.json())
        return None


def get_cookies(request):
    cookies = request.COOKIES
    return JsonResponse({'cookies': cookies})


@csrf_exempt
def cookie_save_preferences(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            shop_url = data.get('shopUrl')  # Extract shopUrl from the request
            preference = data.get('preference')
            url = data.get('url')
            created_date = data.get('createdDate')
            ip_address = data.get('ipAddress')
            selected_preferences = data.get('selectedPreferences', {})

            if not shop_url or not preference:
                return JsonResponse({'status': 'error', 'message': 'Missing required fields.'}, status=400)

            # Update existing record or create a new one
            obj, created = CookiePreference.objects.update_or_create(
                shop_url=shop_url,
                defaults={
                    'preference': preference,
                    'url': url,
                    'created_date': created_date,
                    'ip_address': ip_address,
                    'selected_preferences': selected_preferences,  # Save as dictionary (not a JSON string)
                }
            )

            if created:
                return JsonResponse({'status': 'success', 'message': 'Preferences saved successfully.'}, status=201)
            return JsonResponse({'status': 'success', 'message': 'Preferences updated successfully.'}, status=200)
        except IntegrityError:
            return JsonResponse({'status': 'error', 'message': 'Duplicate entry error.'}, status=409)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)


@csrf_exempt
def get_cookie_preference_counts(request):
    # Get the 'shop_url' from the request parameters
    shop_url = request.GET.get('shop_url')

    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)

    # Filter CookiePreference by the provided 'shop_url'
    preferences = CookiePreference.objects.filter(shop_url=shop_url)

    # If no matching data found for the given 'shop_url'
    if not preferences.exists():
        return JsonResponse({'error': 'No data found for the provided shop URL'}, status=404)

    # Get counts of 'accept' and 'reject' preferences
    accept_count = preferences.filter(preference='accept').count()
    reject_count = preferences.filter(preference='reject').count()

    # Updated count logic for specific preferences inside 'selected_preferences'
    marketing_count = preferences.filter(selected_preferences__has_key="marketing", selected_preferences__marketing=True).count()
    analytics_count = preferences.filter(selected_preferences__has_key="analytics", selected_preferences__analytics=True).count()
    functional_count = preferences.filter(selected_preferences__has_key="functional", selected_preferences__functional=True).count()

    # Return all counts as JSON
    return JsonResponse({
        'accept_all': accept_count,
        'decline_all': reject_count,
        'marketing': marketing_count,
        'analytics': analytics_count,
        'functional': functional_count
    })


def cookie_preference_list(request):
    # Get the 'shop_url' parameter from the query string
    shop_url = request.GET.get('shop_url')  # Get the 'shop_url' parameter from the GET request

    # Check if 'shop_url' is provided
    if not shop_url:
        # If no 'shop_url' is provided, return an error message
        return JsonResponse({'message': 'shop_url not provided'}, status=400)

    # Filter the preferences based on the shop_url
    preferences = CookiePreference.objects.filter(shop_url=shop_url)

    # Check if any preferences are found for the given shop_url
    if not preferences:
        # If no preferences are found for the provided shop_url, return an error message
        return JsonResponse({'message': 'shop name not found'}, status=404)

    # Prepare a list to hold the desired data
    response_data = []

    # Loop through each preference and extract the required fields
    for preference in preferences:
        consent = []
        
        # Add preferences to consent based on what is true in the selected_preferences JSON
        selected_preferences = preference.selected_preferences
        if selected_preferences:
            for key, value in selected_preferences.items():
                if value:
                    consent.append(key)
        
        response_data.append({
            'Total': preference.id,  # Assuming `id` is auto-increment
            'Accepted page': preference.url,
            'Given consent': ', '.join(consent),  # Join all true preferences
            'IP address': preference.ip_address,
            'Created at': preference.created_date,
        })

    # Return the data as a JSON response
    return JsonResponse(response_data, safe=False)


