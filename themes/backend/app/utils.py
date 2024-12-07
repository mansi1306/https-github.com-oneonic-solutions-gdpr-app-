import hmac
import hashlib
from django.conf import settings

def verify_shopify_webhook(request):
    shopify_hmac = request.headers.get('X-Shopify-Hmac-SHA256')
    calculated_hmac = hmac.new(
        settings.SHOPIFY_API_SECRET.encode('utf-8'),
        request.body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(shopify_hmac, calculated_hmac)
