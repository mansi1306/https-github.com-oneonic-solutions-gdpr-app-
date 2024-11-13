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
from .models import Shop, Store, Plan, ShopPreferences, PrivacyPolicySetting
import logging
from django.utils import timezone
from django.views.decorators.http import require_GET
from django.middleware.csrf import get_token
from graphql import GraphQLError
from .models import PrivacyPolicySetting


def shopify_auth(request):
    # Redirect to Shopify for OAuth authorization
    shopify.Session.setup(api_key=settings.SHOPIFY_API_KEY, secret=settings.SHOPIFY_API_SECRET)
    
    # This URL is where Shopify will redirect after authentication
    redirect_uri = settings.SHOPIFY_REDIRECT_URI
    scopes = ['write_products', 'read_products', 'write_orders', 'read_orders','read_customers','write_customers']
    
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

        return HttpResponseRedirect(f"https://{shop}/admin/oauth/redirect_from_cli?client_id=4d48baea68b47ab91304b6080392c538")

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
def shop_update_webhook(request):
    try:
        payload = json.loads(request.body.decode('utf-8'))
        shop = payload.get('shop')
        
        if shop:
            # Implement logic to handle shop updates
            print(f"Shop updated: {shop}")
            return JsonResponse({'status': 'success', 'message': 'Shop updated processed'}, status=200)
        else:
            return JsonResponse({'error': 'Shop information not found in request'}, status=400)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


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
        f"{complete_shop_url}/admin/api/2024-07/graphql.json",
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
        # Parse JSON data if sent as JSON
        try:
            data = json.loads(request.body)
            shop_url = data.get('shop_url')
            plan_price = data.get('plan_price')
            access_token = request.GET.get('access_token')
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON data"})

        # Validate shop_url, access_token, and plan_price
        if not shop_url  or not plan_price:
            return JsonResponse({"success": False, "error": "Missing required fields"})

        if plan_price not in ['1.00', '2.00', '3.00']:
            return JsonResponse({"success": False, "error": "Invalid plan selected"})

        # Define charge data for Shopify
        charge_data = {
            "recurring_application_charge": {
                "name": "GDPR app",
                "price": float(plan_price),  # Convert string price to float
                "return_url": "https://45f1-103-105-234-95.ngrok-free.app/shopify_app/accept_charge",  # Adjust URL accordingly
                "trial_days": 7,  # Optional: Make trial days dynamic if needed
                "test": True  # Change to False in production
            }
        }

        # Send request to Shopify API to create the charge
        response = requests.post(
            f"https://{shop_url}/admin/api/2024-07/recurring_application_charges.json",
            json=charge_data,
            headers={"X-Shopify-Access-Token": access_token}
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
            f"https://{shop_url}/admin/api/2024-07/recurring_application_charges/{charge_id}/activate.json",
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

