import requests
from django.conf import settings
from django.http import JsonResponse

def list_webhooks(shop, access_token):
    headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': access_token
    }
    webhook_url = f"https://{shop}/admin/api/2024-07/webhooks.json"
    response = requests.get(webhook_url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch existing webhooks: {response.text}")
        return {'webhooks': []}

def register_webhook(shop, access_token):
    headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': access_token
    }

    # Fetch existing webhooks
    existing_webhooks = list_webhooks(shop, access_token)
    existing_topics = {wh['topic'] for wh in existing_webhooks['webhooks']}

    valid_webhooks = [
        {
            'topic': 'app/uninstalled',
            'address': f"{settings.BASE_URL}/webhooks/uninstall",
            'format': 'json'
        },
        {
            'topic': 'customers/data_request',
            'address': f"{settings.BASE_URL}/webhooks/customer_data_request",
            'format': 'json'
        },
        {
            'topic': 'customers/data_erasure',
            'address': f"{settings.BASE_URL}/webhooks/customer_data_erasure",
            'format': 'json'
        },
        {
            'topic': 'shops/data_erasure',
            'address': f"{settings.BASE_URL}/webhooks/shop_data_erasure",
            'format': 'json'
        }
    ]

    for webhook in valid_webhooks:
        if webhook['topic'] not in existing_topics:
            data = {'webhook': webhook}
            webhook_url = f"https://{shop}/admin/api/2024-07/webhooks.json"
            response = requests.post(webhook_url, json=data, headers=headers)
            if response.status_code == 201:
                print(f"Webhook registered successfully for {shop}: {webhook['topic']}")
            else:
                print(f"Failed to register webhook for {shop} ({webhook['topic']}). Response: {response.text}")
        else:
            print(f"Webhook for {webhook['topic']} already exists.")
