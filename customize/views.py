from django.conf import settings
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
import shopify
import requests
import json
import os
from django.views import View
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from .models import Shop, Product, Collection,ProductLimit,CollectionLimit,CustomerLimit,OrderLimit,Collection_product,Customer,Order
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from django.core.files.base import ContentFile
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import datetime
from .utils import save_product_data, get_access_token, save_access_token  # Import the function here 
import base64
from graphql import GraphQLError
from .shopify_utils import register_webhook
from django.views.decorators.http import require_GET


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


def fetch_all_products_view(request):
    shops = Shop.objects.all()
    all_products = []
    seen_product_ids = set()  # Track already processed product IDs

    for shop in shops:
        print(f"Fetching products for shop: {shop.shop_url}")  # Debugging line
        access_token = shop.access_token
        products = fetch_products(shop, access_token)
        
        if not products:
            continue  # Skip to the next shop if no products were fetched
        
        # Extract product details
        for product in products:
            node = product['node']
            product_id = node['id']

            # Check if this product has already been processed
            if product_id in seen_product_ids:
                continue  # Skip if already added

            seen_product_ids.add(product_id)  # Mark this product as processed

            title = node['title']
            description = node['descriptionHtml']
            variants = node.get('variants', {}).get('edges', [])
            
            # Collect variant data
            variant_data = [
                {
                    'id': variant['node']['id'],
                    'title': variant['node']['title'],
                    'price': variant['node']['price'],
                    'inventoryQuantity': variant['node']['inventoryQuantity']
                }
                for variant in variants
            ]

            # Append to all_products for rendering
            all_products.append({
                'id': product_id,
                'title': title,
                'description': description,
                'variants': variant_data
            })

    print(f"Aggregated Products: {all_products}")  # Debugging line

    return render(request, 'products.html', {'products': all_products})


def fetch_products(shop, access_token):
    # Ensure the shop_url starts with https:// and remove any extra prefixes
    shop_url_with_scheme = f"https://{shop.shop_url.replace('https://', '')}"

    query = """
    query getProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        edges {
          node {
            id
            title
            descriptionHtml
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  price
                  inventoryQuantity
                }
              }
            }
            images(first: 250) {
              edges {
                node {
                  id
                  originalSrc
                  altText
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """

    headers = {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
    }

    cursor = None
    has_next_page = True
    all_products = []

    while has_next_page:
        variables = {'cursor': cursor} if cursor else {}
        response = requests.post(f"{shop_url_with_scheme}/admin/api/2023-07/graphql.json", headers=headers, data=json.dumps({'query': query, 'variables': variables}))
        
        # Log access token and shop URL for debugging
        print(f"Shop URL: {shop_url_with_scheme}, Access Token: {access_token[:8]}...")  # Only print the first few characters of the token for security

        # Check for HTTP errors
        if response.status_code == 401:
            print(f"Unauthorized access for shop: {shop.shop_url}. Please check the access token.")
            return []  # Return an empty list for this shop

        response.raise_for_status()  # Raise an exception for any other error

        data = response.json()

        products = data.get('data', {}).get('products', {})
        edges = products.get('edges', [])
        all_products.extend(edges)

        # Handle pagination
        page_info = products.get('pageInfo', {})
        has_next_page = page_info.get('hasNextPage', False)
        cursor = page_info.get('endCursor')

    return all_products


def fetch_shopify_data():
    shops = Shop.objects.all()
    all_product_titles = set()  # Use a set to avoid duplicate product titles

    for shop in shops:
        shop_url = shop.shop_url.strip()
        access_token = shop.access_token

        # Ensure shop URL includes schema
        if not shop_url.startswith("http://") and not shop_url.startswith("https://"):
            shop_url_with_scheme = f"https://{shop_url}"
        else:
            shop_url_with_scheme = shop_url

        query = """
        query getProducts($cursor: String) {
        products(first: 250, after: $cursor) {
            edges {
            node {
                id
                title
                variants(first: 1) {
                edges {
                    node {
                    sku
                    price
                    inventoryQuantity
                    weight  # Add weight here
                    weightUnit  # Add weight unit here
                    }
                }
                }
                images(first: 1) {
                edges {
                    node {
                    originalSrc
                    }
                }
                }
            }
            }
            pageInfo {
            hasNextPage
            endCursor
            }
        }
        }
        """

        headers = {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
        }

        cursor = None
        has_next_page = True
        all_product_titles = []  # Store product titles to return

        while has_next_page:
            variables = {'cursor': cursor} if cursor else {}
            response = requests.post(
                f"{shop_url_with_scheme}/admin/api/2024-07/graphql.json",
                headers=headers,
                data=json.dumps({'query': query, 'variables': variables})
            )
            response.raise_for_status()  # Raise for any HTTP error
            data = response.json()

            products = data.get('data', {}).get('products', {})
            edges = products.get('edges', [])

            for product_edge in edges:
                product = product_edge.get('node', {})
                product_id = product.get('id')
                title = product.get('title')

                # Extract first variant's data
                variants = product.get('variants', {}).get('edges', [])
                if variants:
                    variant = variants[0]['node']
                    sku = variant.get('sku', '')
                    inventory = variant.get('inventoryQuantity', 0)
                    price = variant.get('price', '0.00')
                    weight = variant.get('weight', 0)  # Extract weight
                    weight_unit = variant.get('weightUnit', 'kg')  # Extract weight unit
                else:
                    sku = ''
                    inventory = 0
                    price = '0.00'
                    weight = 0
                    weight_unit = 'kg'

                # Extract the first image's URL
                images = product.get('images', {}).get('edges', [])
                image_url = images[0]['node']['originalSrc'] if images else None

                # Save product data with shop_url
                save_product_data(shop_url, product_id, title, sku, inventory, price, weight, weight_unit, image_url, all_product_titles)

            # Handle pagination
            page_info = products.get('pageInfo', {})
            has_next_page = page_info.get('hasNextPage', False)
            cursor = page_info.get('endCursor')

    # Print all unique product titles once
    for title in sorted(all_product_titles):  # Sorted to maintain consistent order
        print(f"Product : {title}")


def save_product_data(shop_url, product_gid, title, sku, inventory, price, weight, weight_unit, image_url, product_titles):
    try:
        # Extract the numeric product ID from the `gid`
        product_id = product_gid.split('/')[-1]  # Extracts `1234567890`

        # Now save the numeric product ID and shop_url in the database
        product, created = Product.objects.update_or_create(
            shop_url=shop_url,  # Store shop_url as string
            product_id=product_id,  # Store the numeric ID here
            defaults={
                'title': title,
                'sku': sku,
                'inventory': inventory,
                'price': price,
                'weight': weight,  # Save weight
                'weight_unit': weight_unit,  # Save weight unit
                'image': image_url
            }
        )
        product_titles.append(title)
        if created:
            print(f"Created new product: {title} for shop: {shop_url}")
        else:
            print(f"Updated product: {title} for shop: {shop_url}")
    except Exception as e:
        print(f"Error saving product {product_id} for shop {shop_url}: {e}")


def fetch_collections_and_products(shop_url):
    # Remove 'https://' prefix before processing for database storage
    normalized_shop_url = shop_url.replace('https://', '').replace('http://', '').strip()

    all_collections = []

    try:
        # Fetch the shop record to get the access token
        print(f"Searching for shop with URL: {normalized_shop_url}")
        shop = Shop.objects.get(shop_url__iexact=normalized_shop_url)
        access_token = shop.access_token

        # Define the GraphQL endpoint
        graphql_endpoint = f'https://{normalized_shop_url}/admin/api/2024-07/graphql.json'

        # Fetch collections via GraphQL
        query = """
        query getCollections($cursor: String) {
          collections(first: 250, after: $cursor) {
            edges {
              node {
                id
                title
                descriptionHtml
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        """
        headers = {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
        }

        cursor = None
        has_next_page = True

        while has_next_page:
            variables = {'cursor': cursor} if cursor else {}
            response = requests.post(
                graphql_endpoint,
                headers=headers,
                data=json.dumps({'query': query, 'variables': variables})
            )
            response.raise_for_status()
            data = response.json()

            collections = data.get('data', {}).get('collections', {})
            edges = collections.get('edges', [])

            for edge in edges:
                collection = edge['node']
                collection_id_numeric = extract_numeric_id(collection['id'])
                collection_obj, _ = Collection.objects.update_or_create(
                    collection_id=collection_id_numeric,
                    defaults={
                        'shop': normalized_shop_url,  # Store without 'https://'
                        'title': collection['title'],
                        'description': collection.get('descriptionHtml', ''),
                    }
                )
                all_collections.append(collection_obj)

                # Fetch products for each collection
                fetch_collection_products(normalized_shop_url, access_token, collection_obj)

            # Handle pagination
            page_info = collections.get('pageInfo', {})
            has_next_page = page_info.get('hasNextPage', False)
            cursor = page_info.get('endCursor')

    except Shop.DoesNotExist:
        print(f"No shop found with URL: {shop_url}")
    except requests.RequestException as e:
        print(f"Error fetching collections: {e}")
        raise

    return all_collections


def extract_numeric_id(shopify_id):
    """Extract numeric ID from Shopify global ID."""
    return shopify_id.split('/')[-1] if shopify_id else None


def fetch_collection_products(shop_url, access_token, collection_obj):
    # Ensure shop_url has the proper format for API requests
    graphql_endpoint = f'https://{shop_url}/admin/api/2024-07/graphql.json'

    try:
        query = """
        query getCollectionProducts($collectionId: ID!, $cursor: String) {
          collection(id: $collectionId) {
            products(first: 250, after: $cursor) {
              edges {
                node {
                  id
                  title
                  descriptionHtml
                  variants(first: 1) {
                    edges {
                      node {
                        price
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
        """

        headers = {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
        }

        cursor = None
        has_next_page = True

        while has_next_page:
            collection_id = f'gid://shopify/Collection/{collection_obj.collection_id}'  # Reconstruct the Shopify ID format
            variables = {'collectionId': collection_id, 'cursor': cursor} if cursor else {'collectionId': collection_id}
            response = requests.post(
                graphql_endpoint,
                headers=headers,
                data=json.dumps({'query': query, 'variables': variables})
            )
            response.raise_for_status()
            data = response.json()

            products = data.get('data', {}).get('collection', {}).get('products', {})
            edges = products.get('edges', [])

            # Save products to the database
            for product_edge in edges:
                product = product_edge['node']
                variants = product.get('variants', {}).get('edges', [])
                price = variants[0]['node']['price'] if variants else '0.00'
                product_id_numeric = extract_numeric_id(product['id'])

                Collection_product.objects.update_or_create(
                    product_id=product_id_numeric,
                    defaults={
                        'collection_id': collection_obj.collection_id,
                        'title': product['title'],
                        'description': product.get('descriptionHtml', ''),
                        'price': price,
                        'shop_url': shop_url  # Store without 'https://'
                    }
                )
                print(f"Saved product {product['title']} under collection {collection_obj.collection_id}")

            # Handle pagination
            page_info = products.get('pageInfo', {})
            has_next_page = page_info.get('hasNextPage', False)
            cursor = page_info.get('endCursor')

    except requests.RequestException as e:
        print(f"Error fetching products for collection {collection_obj.title}: {e}")


def fetch_shopify_customers():
    shops = Shop.objects.all()

    for shop in shops:
        shop_url = shop.shop_url.strip()
        access_token = shop.access_token

        # Ensure shop URL has the correct scheme
        if not shop_url.startswith("http://") and not shop_url.startswith("https://"):
            shop_url_with_scheme = f"https://{shop_url}"
        else:
            shop_url_with_scheme = shop_url

        # GraphQL query for fetching customer data
        query = """
        query getCustomers($cursor: String) {
            customers(first: 250, after: $cursor) {
                edges {
                    node {
                        id
                        email
                        tags
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        """

        headers = {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
        }

        cursor = None
        has_next_page = True
        fetched_customers = False

        # Loop through paginated customer data
        while has_next_page:
            variables = {'cursor': cursor} if cursor else {}
            response = requests.post(
                f"{shop_url_with_scheme}/admin/api/2024-07/graphql.json",
                headers=headers,
                data=json.dumps({'query': query, 'variables': variables})
            )

            print(f"Response Status Code: {response.status_code}")
            print(f"Response Content: {response.text}")

            if response.status_code != 200:
                print(f"Error: HTTP Status Code {response.status_code}")
                continue

            data = response.json()

            if 'errors' in data:
                errors = data['errors']
                for error in errors:
                    if error.get('extensions', {}).get('code') == 'ACCESS_DENIED':
                        print(f"Access denied: {error.get('message')}")
                        print(f"Skipping shop {shop_url} due to access denial.")
                        shop.is_authenticated = False
                        shop.save()
                        break
                continue

            customers_data = data['data'].get('customers', {})
            edges = customers_data.get('edges', [])

            if edges:
                fetched_customers = True

            for customer_edge in edges:
                customer = customer_edge.get('node', {})
                customer_id = customer.get('id')
                email = customer.get('email')
                tags = customer.get('tags', [])

                # Save customer data to the database
                save_customer_data(shop_url, customer_id, email, tags)

            page_info = customers_data.get('pageInfo', {})
            has_next_page = page_info.get('hasNextPage', False)
            cursor = page_info.get('endCursor')

        if fetched_customers:
            print(f"Successfully fetched and stored customer data for shop {shop_url}")
        else:
            print(f"No customer data found for shop {shop_url}")


def save_customer_data(shop_url, customer_id, email, tags):
    try:
        # Check if the customer already exists or update their data
        customer, created = Customer.objects.update_or_create(
            shopify_id=customer_id,
            defaults={
                'email': email,
                'tags': ','.join(tags) if tags else '',
                'shop_url': shop_url
            }
        )
        
        if created:
            print(f"Created new customer: {email} for shop: {shop_url}")
        else:
            print(f"Updated customer: {email} for shop: {shop_url}")
    except Exception as e:
        print(f"Error saving customer {customer_id} for shop {shop_url}: {e}")


def get_access_token(shop_url, code):
    token_url = f"https://{shop_url}/admin/oauth/access_token"
    payload = {
        'client_id': settings.SHOPIFY_API_KEY,
        'client_secret': settings.SHOPIFY_API_SECRET,
        'code': code
    }
    response = requests.post(token_url, json=payload)
    response_data = response.json()
    return response_data.get('access_token')


def save_access_token(shop_url, access_token):
    Shop.objects.update_or_create(shop_url=shop_url, defaults={'access_token': access_token})


def get_products(request):
    # Get the shop URL from the request parameters or headers
    shop_url = request.GET.get('shop_url')  # Example: query parameter or modify as needed
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)

    try:    
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)

    shop_url = f"https://{shop.shop_url}"
    access_token = shop.access_token

    # Define the GraphQL query
    query = """
    query getProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        edges {
          node {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  price
                  inventoryQuantity
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """

    headers = {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
    }

    cursor = None
    has_next_page = True
    all_products = []

    while has_next_page:
        variables = {'cursor': cursor} if cursor else {}
        response = requests.post(
            f"{shop_url}/admin/api/2024-07/graphql.json",
            headers=headers,
            data=json.dumps({'query': query, 'variables': variables})
        )

        if response.status_code != 200:
            return JsonResponse({'error': 'Failed to fetch data from Shopify'}, status=500)

        data = response.json()

        products = data.get('data', {}).get('products', {})
        edges = products.get('edges', [])

        for edge in edges:
            node = edge['node']
            gid = node['id']
            
            # Extract numeric ID from GID
            product_id = gid.split('/')[-1] if gid else None
            
            title = node['title']
            variants = node.get('variants', {}).get('edges', [])
            images = node.get('images', {}).get('edges', [])

            # Extract variant data
            variant_data = variants[0]['node'] if variants else {}
            price = variant_data.get('price', '0.00')
            inventory = variant_data.get('inventoryQuantity', 0)

            # Extract image data
            image_url = images[0]['node']['originalSrc'] if images else None

            all_products.append({
                'id': product_id,  # Numeric ID here
                'title': title,
                'inventory': inventory,
                'price': price,
                'image': image_url,
            })

        # Handle pagination
        page_info = products.get('pageInfo', {})
        has_next_page = page_info.get('hasNextPage', False)
        cursor = page_info.get('endCursor')

    return JsonResponse(all_products, safe=False)


def decode_gid(gid):
    """Decode the Shopify Global ID (GID) to get the numeric ID."""
    try:
        # Split the GID to extract the numeric ID
        parts = gid.split('/')
        return parts[-1] if len(parts) > 1 else gid
    except Exception as e:
        print(f"Error decoding GID: {e}")
        return gid


def get_collections(request):
    # Get the shop URL from the request parameters
    shop_url = request.GET.get('shop_url')
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)

    try:
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)

    shop_url = f"https://{shop.shop_url}"
    access_token = shop.access_token

    # Define the GraphQL query
    query = """
    query getCollections($cursor: String) {
      collections(first: 250, after: $cursor) {
        edges {
          node {
            id
            title
            description
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """

    headers = {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
    }

    cursor = None
    has_next_page = True
    all_collections = []

    while has_next_page:
        variables = {'cursor': cursor} if cursor else {}
        response = requests.post(
            f"{shop_url}/admin/api/2024-07/graphql.json",
            headers=headers,
            data=json.dumps({'query': query, 'variables': variables})
        )

        if response.status_code != 200:
            return JsonResponse({'error': f'Failed to fetch data from Shopify, status code: {response.status_code}'}, status=500)

        data = response.json()

        collections = data.get('data', {}).get('collections', {})
        edges = collections.get('edges', [])

        for edge in edges:
            node = edge['node']
            collection_id = decode_gid(node.get('id', ''))
            all_collections.append({
                'id': collection_id,
                'title': node.get('title'),
                'description': node.get('description'),
            })

        # Handle pagination
        page_info = collections.get('pageInfo', {})
        has_next_page = page_info.get('hasNextPage', False)
        cursor = page_info.get('endCursor')

    return JsonResponse(all_collections, safe=False)


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
def get_csrf_token(request):
    if request:
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})  # Returning JsonResponse
    else:
        raise GraphQLError("Unable to generate CSRF token.")


@csrf_exempt
def create_product_limit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Request data: {data}")

            shop_url = data.get('shop_url')
            if not shop_url:
                return JsonResponse({'error': 'Shop URL is required'}, status=400)

            try:
                shop = Shop.objects.get(shop_url=shop_url)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            access_token = shop.access_token
            print(f"Access token: {access_token}")

            mutation = """
            mutation createProductLimit($input: ProductLimitInput!) {
              productLimitCreate(input: $input) {
                productLimit {
                  id
                  limitName
                  status
                  limitType
                  minValue
                  maxValue
                  startDate
                  endDate
                }
                userErrors {
                  field
                  message
                }
              }
            }
            """

            variables = {
                'input': {
                    'limitName': data.get('limit_name'),
                    'status': data.get('status'),
                    'limitType': data.get('limit_type', 'product limit'),
                    'selectedProducts': data.get('selected_products', []),
                    'minValue': int(data.get('min_value', 0)),  # Ensure these are integers
                    'maxValue': int(data.get('max_value', 0)),
                    'startDate': data.get('start_date'),
                    'endDate': data.get('end_date'),
                }
            }

            headers = {
                'X-Shopify-Access-Token': access_token,
                'Content-Type': 'application/json',
            }

            response = requests.post(
                f"https://{shop.shop_url}/admin/api/2024-07/graphql.json",
                headers=headers,
                data=json.dumps({'query': mutation, 'variables': variables})
            )

            print(f"Response: {response.status_code}, {response.text}")

            # Capture the response body and log it for debugging
            if response.status_code != 200:
                error_message = response.json().get('errors', 'Unknown error')
                print(f"Shopify Error Message: {error_message}")
                return JsonResponse({'error': f'Failed to communicate with Shopify: {error_message}'}, status=500)

            result = response.json()

            # Check for userErrors from Shopify's GraphQL response
            user_errors = result.get('data', {}).get('productLimitCreate', {}).get('userErrors', [])
            if user_errors:
                print(f"Shopify user errors: {user_errors}")
                return JsonResponse({'errors': user_errors}, status=400)

            # Save to local database
            product_limit = ProductLimit(
                limit_name=data.get('limit_name'),
                status=data.get('status'),
                limit_type=data.get('limit_type', 'product limit'),
                selected_products=json.dumps(data.get('selected_products', [])),
                min_value=variables['input']['minValue'],
                max_value=variables['input']['maxValue'],
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                shop_url=shop_url
            )
            product_limit.save()

            return JsonResponse({'message': 'Product limit created successfully'}, status=201)

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return JsonResponse({'error': 'An error occurred'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def create_collection_limit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Request data: {data}")

            shop_url = data.get('shop_url')
            if not shop_url:
                return JsonResponse({'error': 'Shop URL is required'}, status=400)

            try:
                shop = Shop.objects.get(shop_url=shop_url)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            access_token = shop.access_token
            print(f"Access token: {access_token}")

            mutation = """
            mutation createCollectionLimit($input: CollectionLimitInput!) {
              collectionLimitCreate(input: $input) {
                collectionLimit {
                  id
                  limitName
                  status
                  limitType
                  minValue
                  maxValue
                  startDate
                  endDate
                }
                userErrors {
                  field
                  message
                }
              }
            }
            """

            variables = {
                'input': {
                    'limitName': data.get('limit_name'),
                    'status': data.get('status'),
                    'limitType': data.get('limit_type', 'collection limit'),
                    'selectedCollections': data.get('selected_collections', []),
                    'minValue': int(data.get('min_value', 0)),  # Ensure these are integers
                    'maxValue': int(data.get('max_value', 0)),
                    'startDate': data.get('start_date'),
                    'endDate': data.get('end_date'),
                }
            }

            headers = {
                'X-Shopify-Access-Token': access_token,
                'Content-Type': 'application/json',
            }

            response = requests.post(
                f"https://{shop.shop_url}/admin/api/2024-07/graphql.json",
                headers=headers,
                data=json.dumps({'query': mutation, 'variables': variables})
            )

            print(f"Response: {response.status_code}, {response.text}")

            if response.status_code == 200:
                result = response.json()

                user_errors = result.get('data', {}).get('collectionLimitCreate', {}).get('userErrors', [])
                if user_errors:
                    return JsonResponse({'errors': user_errors}, status=400)

                # Save to local database
                collection_limit = CollectionLimit(
                    limit_name=data.get('limit_name'),
                    status=data.get('status'),
                    limit_type=data.get('limit_type', 'collection limit'),
                    selected_collections=json.dumps(data.get('selected_collections', [])),
                    min_value=variables['input']['minValue'],
                    max_value=variables['input']['maxValue'],
                    start_date=data.get('start_date'),
                    end_date=data.get('end_date'),
                    shop_url=shop_url
                )
                collection_limit.save()

                return JsonResponse({'message': 'Collection limit created successfully'}, status=201)
            else:
                error_message = response.text
                return JsonResponse({'error': f'Failed to communicate with Shopify: {error_message}'}, status=500)

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return JsonResponse({'error': 'An error occurred'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def create_customer_limit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Request data: {data}")

            shop_url = data.get('shop_url')
            if not shop_url:
                return JsonResponse({'error': 'Shop URL is required'}, status=400)

            # Fetch shop details
            try:
                shop = Shop.objects.get(shop_url=shop_url)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            access_token = shop.access_token
            print(f"Access token: {access_token}")

            # GraphQL mutation for creating a customer limit
            mutation = """
            mutation createCustomerLimit($input: CustomerLimitInput!) {
              customerLimitCreate(input: $input) {
                customerLimit {
                  id
                  limitName
                  status
                  limitType
                  selectedTags
                  minValue
                  maxValue
                  startDate
                  endDate
                }
                userErrors {
                  field
                  message
                }
              }
            }
            """

            variables = {
                'input': {
                    'limitName': data.get('limit_name'),
                    'status': data.get('status'),
                    'limitType': data.get('limit_type', 'customer limit'),
                    'selectedTags': data.get('selected_tags', []),
                    'minValue': int(data.get('min_value', 0)),  # Ensure values are integers
                    'maxValue': int(data.get('max_value', 0)),
                    'startDate': data.get('start_date'),
                    'endDate': data.get('end_date'),
                }
            }

            headers = {
                'X-Shopify-Access-Token': access_token,
                'Content-Type': 'application/json',
            }

            # Make the GraphQL request
            response = requests.post(
                f"https://{shop.shop_url}/admin/api/2024-07/graphql.json",
                headers=headers,
                data=json.dumps({'query': mutation, 'variables': variables})
            )

            print(f"Response: {response.status_code}, {response.text}")

            if response.status_code == 200:
                result = response.json()
                user_errors = result.get('data', {}).get('customerLimitCreate', {}).get('userErrors', [])
                if user_errors:
                    return JsonResponse({'errors': user_errors}, status=400)

                # Save to local database
                customer_limit = CustomerLimit(
                    limit_name=data.get('limit_name'),
                    status=data.get('status'),
                    limit_type=data.get('limit_type', 'customer limit'),
                    selected_tags=json.dumps(data.get('selected_tags', [])),
                    min_value=variables['input']['minValue'],
                    max_value=variables['input']['maxValue'],
                    start_date=data.get('start_date'),
                    end_date=data.get('end_date'),
                    shop_url=shop_url
                )
                customer_limit.save()

                return JsonResponse({'message': 'Customer limit created successfully'}, status=201)
            else:
                error_message = response.text
                return JsonResponse({'error': f'Failed to communicate with Shopify: {error_message}'}, status=500)

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return JsonResponse({'error': 'An error occurred'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def create_order_limit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Request data: {data}")

            # Extract shop URL and validate
            shop_url = data.get('shop_url')
            if not shop_url:
                return JsonResponse({'error': 'Shop URL is required'}, status=400)

            # Fetch shop details
            try:
                shop = Shop.objects.get(shop_url=shop_url)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            access_token = shop.access_token
            print(f"Access token: {access_token}")

            # Define the GraphQL mutation
            mutation = """
            mutation createOrderLimit($input: OrderLimitInput!) {
              orderLimitCreate(input: $input) {
                orderLimit {
                  id
                  limitName
                  status
                  limitType
                  selectedProducts
                  conditionType
                  minValue
                  maxValue
                  startDate
                  endDate
                }
                userErrors {
                  field
                  message
                }
              }
            }
            """

            # Prepare variables for the mutation
            condition_type = data.get('condition_type')
            min_value = data.get('min_value')
            max_value = data.get('max_value')

            # Add prefix/suffix based on condition type
            if condition_type == 'Total value in order':
                min_value = f"Rs. {min_value}"
                max_value = f"Rs. {max_value}"
            elif condition_type == 'Total weight in order':
                min_value = f"{min_value} kg"
                max_value = f"{max_value} kg"

            variables = {
                'input': {
                    'limitName': data.get('limit_name'),
                    'status': data.get('status'),
                    'limitType': data.get('limit_type', 'order_limit'),
                    'selectedProducts': data.get('selected_products', []),
                    'conditionType': condition_type,
                    'minValue': min_value,
                    'maxValue': max_value,
                    'startDate': data.get('start_date'),
                    'endDate': data.get('end_date'),
                }
            }

            # Prepare headers for the request
            headers = {
                'X-Shopify-Access-Token': access_token,
                'Content-Type': 'application/json',
            }

            # Make the GraphQL request
            response = requests.post(
                f"https://{shop.shop_url}/admin/api/2024-07/graphql.json",
                headers=headers,
                data=json.dumps({'query': mutation, 'variables': variables})
            )

            print(f"Response: {response.status_code}, {response.text}")

            # Check for errors in the response
            if response.status_code == 200:
                result = response.json()
                user_errors = result.get('data', {}).get('orderLimitCreate', {}).get('userErrors', [])
                if user_errors:
                    return JsonResponse({'errors': user_errors}, status=400)

                # Save to local database
                order_limit = OrderLimit(
                    limit_name=data.get('limit_name'),
                    status=data.get('status'),
                    limit_type=data.get('limit_type', 'order_limit'),
                    selected_products=json.dumps(data.get('selected_products', [])),
                    condition_type=condition_type,
                    min_value=min_value,
                    max_value=max_value,
                    start_date=data.get('start_date'),
                    end_date=data.get('end_date'),
                    shop_url=shop_url
                )
                order_limit.save()

                return JsonResponse({'message': 'Order limit created successfully'}, status=201)
            else:
                error_message = response.text
                return JsonResponse({'error': f'Failed to communicate with Shopify: {error_message}'}, status=500)

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return JsonResponse({'error': 'An error occurred'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def get_all_limits(request):
    if request.method == 'GET':
        try:
            # Extract shop_url from request parameters
            shop_url = request.GET.get('shop_url')
            if not shop_url:
                return JsonResponse({'error': 'Shop URL is required'}, status=400)
            
            # Validate shop_url and fetch the associated Shop
            try:
                shop = Shop.objects.get(shop_url=shop_url)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            # Define the fields to include in the response
            product_limits = list(ProductLimit.objects.filter(shop_url=shop_url).values(
                'limit_name', 'status', 'limit_type', 'min_value', 'max_value', 'start_date', 'end_date'
            ))
            order_limits = list(OrderLimit.objects.filter(shop_url=shop_url).values(
                'limit_name', 'status', 'limit_type', 'condition_type', 'min_value', 'max_value', 'start_date', 'end_date'
            ))
            collection_limits = list(CollectionLimit.objects.filter(shop_url=shop_url).values(
                'limit_name', 'status', 'limit_type', 'min_value', 'max_value', 'start_date', 'end_date'
            ))
            customer_limits = list(CustomerLimit.objects.filter(shop_url=shop_url).values(
                'limit_name', 'status', 'limit_type', 'min_value', 'max_value', 'start_date', 'end_date'
            ))

            all_limits = product_limits + order_limits + collection_limits + customer_limits
            return JsonResponse({'limits': all_limits}, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def delete_limit(request, limit_type, limit_name):
    if request.method == 'DELETE':  # Change this to handle DELETE requests
        try:
            # Parse the request body if needed, but generally, DELETE requests don't have a body
            # In this case, you don't need to parse any GraphQL variables as you're passing the limit name/type via URL
            if not limit_type or not limit_name:
                return JsonResponse({'error': 'Both limit type and limit name are required'}, status=400)

            # Determine which model class to use based on limit_type
            model_class = {
                'OrderLimit': OrderLimit,
                'ProductLimit': ProductLimit,
                'CollectionLimit': CollectionLimit,
                'CustomerLimit': CustomerLimit,
            }.get(limit_type)

            if not model_class:
                return JsonResponse({'error': 'Invalid limit type'}, status=400)

            # Find and delete the limit by limit_name
            limit = model_class.objects.get(limit_name=limit_name)
            limit.delete()

            return JsonResponse({
                'data': {
                    'deleteLimit': {
                        'success': True,
                        'message': f'{limit_type} with name {limit_name} deleted successfully.'
                    }
                }
            })

        except model_class.DoesNotExist:
            return JsonResponse({
                'data': {
                    'deleteLimit': {
                        'success': False,
                        'message': 'Limit not found'
                    }
                }
            }, status=404)

        except Exception as e:
            return JsonResponse({
                'data': {
                    'deleteLimit': {
                        'success': False,
                        'message': str(e)
                    }
                }
            }, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


def get_extension_limits(request):
    # Extract shop_url from request parameters
    shop_url = request.GET.get('shop_url')
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)
    
    # Validate shop_url and fetch the associated Shop
    try:
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)
    
    # Define the fields you want to include
    product_limit_fields = ['id', 'limit_name', 'status', 'limit_type', 'selected_products', 'min_value', 'max_value', 'start_date', 'end_date']
    collection_limit_fields = ['id', 'limit_name', 'status', 'limit_type', 'selected_collections', 'min_value', 'max_value','start_date', 'end_date']
    customer_limit_fields = ['id', 'limit_name', 'status', 'limit_type', 'selected_tags', 'min_value', 'max_value', 'start_date', 'end_date']
    order_limit_fields = ['id', 'limit_name', 'status', 'limit_type','selected_products', 'condition_type', 'min_value', 'max_value', 'start_date', 'end_date']
    collection_product_limit_fields = ['id', 'product_id', 'collection_id', 'title', 'description', 'price']

    # Retrieve only the specified fields for each model, filtered by shop_url
    limits = {
        'product_limits': list(ProductLimit.objects.filter(shop_url=shop_url).values(*product_limit_fields)),
        'collection_limits': list(CollectionLimit.objects.filter(shop_url=shop_url).values(*collection_limit_fields)),
        'customer_limits': list(CustomerLimit.objects.filter(shop_url=shop_url).values(*customer_limit_fields)),
        'order_limits': list(OrderLimit.objects.filter(shop_url=shop_url).values(*order_limit_fields)),
        'collection_products': list(Collection_product.objects.filter(shop_url=shop_url).values(*collection_product_limit_fields)), # Change here
        'customers': list(Customer.objects.filter(shop_url=shop_url).values('shopify_id', 'email', 'tags'))  # Corrected Customer model query
    }
    return JsonResponse(limits, safe=False)


@csrf_exempt
def update_limit_status(request, limit_type, limit_name):
    if request.method == 'PUT':
        try:
            import json
            data = json.loads(request.body)
            new_status = data.get('status')

            if new_status is None:
                return JsonResponse({'error': 'Status not provided'}, status=400)

            if not isinstance(new_status, bool):
                return JsonResponse({'error': 'Invalid status value'}, status=400)

            if limit_type == 'ProductLimit':
                limit = ProductLimit.objects.get(limit_name=limit_name)
            elif limit_type == 'CollectionLimit':
                limit = CollectionLimit.objects.get(limit_name=limit_name)
            elif limit_type == 'OrderLimit':
                limit = OrderLimit.objects.get(limit_name=limit_name)
            elif limit_type == 'CustomerLimit':
                limit = CustomerLimit.objects.get(limit_name=limit_name)
            else:
                return JsonResponse({'error': 'Invalid limit type'}, status=400)

            limit.status = new_status
            limit.save()

            return JsonResponse({'success': 'Status updated successfully'}, status=200)

        except ProductLimit.DoesNotExist:
            return JsonResponse({'error': 'ProductLimit not found'}, status=404)
        except CollectionLimit.DoesNotExist:
            return JsonResponse({'error': 'CollectionLimit not found'}, status=404)
        except OrderLimit.DoesNotExist:
            return JsonResponse({'error': 'OrderLimit not found'}, status=404)
        except CustomerLimit.DoesNotExist:
            return JsonResponse({'error': 'CustomerLimit not found'}, status=404)
        except Exception as e:
            print(f"Error updating limit status: {e}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
@ensure_csrf_cookie
def update_product_limit(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            limit_name = data.get('limit_name')
            status = data.get('status')
            selected_products = json.dumps(data.get('selected_products', []))
            min_value = data.get('min_value')
            max_value = data.get('max_value')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            # Retrieve existing ProductLimit instance by limit_name
            product_limit = get_object_or_404(ProductLimit, limit_name=limit_name)

            # Update all fields except limit_name
            product_limit.status = status
            product_limit.selected_products = selected_products
            product_limit.min_value = min_value
            product_limit.max_value = max_value
            product_limit.start_date = start_date
            product_limit.end_date = end_date

            # Save the updated instance
            product_limit.save()

            return JsonResponse({'message': 'Product limit updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_product_limit(request, limit_name):
    # Retrieve the ProductLimit object by limit_name or return 404 if not found
    product_limit = get_object_or_404(ProductLimit, limit_name=limit_name)

    # Manually construct the response data as a dictionary
    data = {
        'limit_name': product_limit.limit_name,
        'status': product_limit.status,
        'limit_type': product_limit.limit_type,
        'selected_products': product_limit.get_selected_products(),  # Convert JSON string to Python list
        'min_value': product_limit.min_value,
        'max_value': product_limit.max_value,
        'start_date': product_limit.start_date.strftime('%Y-%m-%d') if product_limit.start_date else None,
        'end_date': product_limit.end_date.strftime('%Y-%m-%d') if product_limit.end_date else None,
    }

    # Return the data as a JSON response
    return JsonResponse(data, safe=False)


@csrf_exempt
@ensure_csrf_cookie
def update_collection_limit(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            limit_name = data.get('limit_name')
            status = data.get('status')
            selected_collections = json.dumps(data.get('selected_collections', []))
            min_value = data.get('min_value')
            max_value = data.get('max_value')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            # Retrieve existing CollectionLimit instance by limit_name
            collection_limit = get_object_or_404(CollectionLimit, limit_name=limit_name)

            # Update all fields except limit_name
            collection_limit.status = status
            collection_limit.selected_collections = selected_collections
            collection_limit.min_value = min_value
            collection_limit.max_value = max_value
            collection_limit.start_date = start_date
            collection_limit.end_date = end_date

            # Save the updated instance
            collection_limit.save()

            return JsonResponse({'message': 'Collection limit updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_collection_limit(request, limit_name):
    # Retrieve the CollectionLimit object by limit_name or return 404 if not found
    collection_limit = get_object_or_404(CollectionLimit, limit_name=limit_name)

    # Manually construct the response data as a dictionary
    data = {
        'limit_name': collection_limit.limit_name,
        'status': collection_limit.status,
        'limit_type': collection_limit.limit_type,
        'selected_collections': json.loads(collection_limit.selected_collections),  # Convert JSON string to Python list
        'min_value': collection_limit.min_value,
        'max_value': collection_limit.max_value,
        'start_date': collection_limit.start_date.strftime('%Y-%m-%d') if collection_limit.start_date else None,
        'end_date': collection_limit.end_date.strftime('%Y-%m-%d') if collection_limit.end_date else None,
    }

    # Return the data as a JSON response
    return JsonResponse(data, safe=False)


@csrf_exempt
def update_customer_limit(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            limit_name = data.get('limit_name')
            status = data.get('status')
            selected_tags = json.dumps(data.get('selected_tags', []))  # Store tags as JSON string
            min_value = data.get('min_value')
            max_value = data.get('max_value')
            start_date_str = data.get('start_date')
            end_date_str = data.get('end_date')

            # Convert dates to datetime objects if they are not None
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else None
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None

            # Retrieve existing CustomerLimit instance by limit_name
            customer_limit = get_object_or_404(CustomerLimit, limit_name=limit_name)

            # Update all fields except limit_name
            customer_limit.status = status
            customer_limit.selected_tags = selected_tags
            customer_limit.min_value = min_value
            customer_limit.max_value = max_value
            customer_limit.start_date = start_date
            customer_limit.end_date = end_date

            # Save the updated instance
            customer_limit.save()

            return JsonResponse({'message': 'Customer limit updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_customer_limit(request, limit_name):
    customer_limit = get_object_or_404(CustomerLimit, limit_name=limit_name)
    
    # Print the raw selected_tags value for debugging
    print(f"Raw selected_tags from DB: {customer_limit.selected_tags}")

    try:
        # Attempt to load the JSON string into a Python list
        selected_tags = json.loads(customer_limit.selected_tags)
        print(f"Decoded selected_tags: {selected_tags}")
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error decoding selected_tags: {e}")
        selected_tags = []

    data = {
        'limit_name': customer_limit.limit_name,
        'status': customer_limit.status,
        'limit_type': customer_limit.limit_type,
        'selected_tags': selected_tags,  # This should be a list of tags
        'min_value': customer_limit.min_value,
        'max_value': customer_limit.max_value,
        'start_date': customer_limit.start_date.strftime('%Y-%m-%d') if customer_limit.start_date else None,
        'end_date': customer_limit.end_date.strftime('%Y-%m-%d') if customer_limit.end_date else None,
    }

    return JsonResponse(data, safe=False)


@csrf_exempt
@ensure_csrf_cookie
def update_order_limit(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            limit_name = data.get('limit_name')
            status = data.get('status')
            selected_products = json.dumps(data.get('selected_products', []))
            condition_type = data.get('condition_type')
            min_value = data.get('min_value')
            max_value = data.get('max_value')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            # Retrieve existing OrderLimit instance by limit_name
            order_limit = get_object_or_404(OrderLimit, limit_name=limit_name)

            # Add prefix/suffix based on the condition_type
            if condition_type == 'Total value in order':
                min_value = f"Rs. {min_value}"
                max_value = f"Rs. {max_value}"
            elif condition_type == 'Total weight in order':
                min_value = f"{min_value} kg"
                max_value = f"{max_value} kg"

            # Update all fields except limit_name
            order_limit.status = status
            order_limit.selected_products = selected_products
            order_limit.condition_type = condition_type
            order_limit.min_value = min_value
            order_limit.max_value = max_value
            order_limit.start_date = start_date
            order_limit.end_date = end_date

            # Save the updated instance
            order_limit.save()

            return JsonResponse({'message': 'Order limit updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_order_limit(request, limit_name):
    # Retrieve the OrderLimit object by limit_name or return 404 if not found
    order_limit = get_object_or_404(OrderLimit, limit_name=limit_name)

    # Manually construct the response data as a dictionary
    data = {
        'limit_name': order_limit.limit_name,
        'status': order_limit.status,
        'selected_products': order_limit.get_selected_products(),  # Convert JSON string to Python list
        'condition_type': order_limit.condition_type,
        'min_value': order_limit.min_value,
        'max_value': order_limit.max_value,
        'start_date': order_limit.start_date.strftime('%Y-%m-%d') if order_limit.start_date else None,
        'end_date': order_limit.end_date.strftime('%Y-%m-%d') if order_limit.end_date else None,
    }

    # Return the data as a JSON response
    return JsonResponse(data, safe=False)


def get_product_price(request, product_id):
    # Extract shop_url from request parameters
    shop_url = request.GET.get('shop_url')
    
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)
    
    # Validate shop_url and fetch the associated Shop
    try:
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)
    
    # Fetch the product by product_id and shop_url
    try:
        product = Product.objects.get(product_id=product_id, shop_url=shop_url)
        return JsonResponse({'product_id': product.product_id, 'price': str(product.price)})
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found or does not belong to this shop'}, status=404)


def get_product_weight(request, product_id):
    # Extract shop_url from request parameters
    shop_url = request.GET.get('shop_url')
    
    if not shop_url:
        return JsonResponse({'error': 'Shop URL is required'}, status=400)
    
    # Validate shop_url and fetch the associated Shop
    try:
        shop = Shop.objects.get(shop_url=shop_url)
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)

   # Fetch the product by product_id and shop_url
    try:
        product = Product.objects.get(product_id=product_id, shop_url=shop_url)
        return JsonResponse({
            'product_id': product.product_id,
            'weight': product.weight,
            'weight_unit': product.weight_unit  # Include weight unit in the response
        })
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found or does not belong to this shop'}, status=404)


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


def get_access_token_view(request):
    shop_url = request.GET.get('shop_url')  # Frontend should send this
    try:
        shop = Shop.objects.get(shop_url=shop_url)
        return JsonResponse({'accessToken': shop.access_token})
    except Shop.DoesNotExist:
        return JsonResponse({'error': 'Shop not found'}, status=404)


def recent_orders(request):
    if request.user.is_authenticated:
        try:
            customer = request.user.customer
            orders = Order.objects.filter(customer=customer).order_by('-order_date')[:10]  # Fetch recent 10 orders
            order_data = [
                {
                    'product_id': order.product_id,
                    'quantity': order.quantity,
                    'order_date': order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
                }
                for order in orders
            ]
            return JsonResponse({'orders': order_data})
        except Customer.DoesNotExist:
            return JsonResponse({'orders': []})
    return JsonResponse({'error': 'User not authenticated'}, status=401)
