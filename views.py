from django.shortcuts import render, redirect
from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
import shopify
import requests
import json
import os
from .models import Shop
from .shopify_utils import register_webhook
from django.views.decorators.csrf import csrf_exempt

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