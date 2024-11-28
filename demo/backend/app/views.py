from django.shortcuts import render, redirect
from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect, Http404
import shopify
import requests
import json
import os
from .models import Shop
from .shopify_utils import register_webhook
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Store
import traceback
from .models import Plan
import logging
from django.utils import timezone

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

        return HttpResponse(f"Authentication successful for {shop}")

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


# Webhook to handle shop updates
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


def get_shop_name(request):
    # Get the shop URL from the request parameters
    shop_url = request.GET.get('shop_url')  # Example: query parameter or modify as needed
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)

    try:    
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)

    access_token = shop.access_token
    shop_url = f"https://{shop.shop_url}"
    
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
    
    response = requests.post(
        f"{shop_url}/admin/api/2024-07/graphql.json",
        headers=headers,
        data=json.dumps({'query': query})
    )
    
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch data from Shopify'}, status=500)
    
    data = response.json()
    print("GraphQL Response:", json.dumps(data, indent=2))  # Debugging line
    
    # Extract shop details
    shop_name = data.get('data', {}).get('shop', {}).get('name', '')
    if not shop_name:
        return JsonResponse({'error': 'Shop name not found'}, status=404)

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
        shop_url = request.POST.get('shop_url')  # Get the shop URL from the request
        access_token = request.POST.get('access_token')  # Get the access token
        plan_price = request.POST.get('plan_price')  # Get the selected plan price

        # Validate the plan price
        if plan_price not in ['1.00', '2.00', '3.00']:
            return JsonResponse({"success": False, "error": "Invalid plan selected"})

        # Define your charge details
        charge_data = {
            "recurring_application_charge": {
                "name": "Your App Name",
                "price": float(plan_price),  # Use the selected plan price
                "return_url": "https://your-app-url.com/accept_charge",
                "trial_days": 7,  # 7-day free trial
                "test": True  # Set to False in production
            }
        }

        # Make a request to the Shopify API to create the charge
        response = requests.post(
            f"https://{shop_url}/admin/api/2024-01/recurring_application_charges.json",
            json=charge_data,
            headers={"X-Shopify-Access-Token": access_token}
        )

        if response.status_code == 201:
            charge = response.json()["recurring_application_charge"]
            return JsonResponse({"success": True, "charge": charge})
        else:
            return JsonResponse({"success": False, "error": response.json()})

    return JsonResponse({"success": False, "error": "Invalid request method"})


@csrf_exempt
def accept_charge(request):
    if request.method == 'GET':
        charge_id = request.GET.get('charge_id')
        shop_url = request.GET.get('shop_url')  # Get shop URL as part of the request
        access_token = request.GET.get('access_token')  # Get access token

        # Activate the charge
        response = requests.post(
            f"https://{shop_url}/admin/api/2024-01/recurring_application_charges/{charge_id}/activate.json",
            headers={"X-Shopify-Access-Token": access_token}
        )

        if response.status_code == 200:
            # Charge is activated; you can save the details in your database here
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "error": response.json()})
    return JsonResponse({"success": False, "error": "Invalid request method"})