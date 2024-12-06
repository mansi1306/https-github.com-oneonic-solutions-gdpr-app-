import hmac
import hashlib

def verify_shopify_webhook(request):
    # Fetch the HMAC sent by Shopify in the headers
    shopify_hmac = request.headers.get('X-Shopify-Hmac-Sha256')
    
    if not shopify_hmac:
        raise ValueError("Shopify HMAC not found")

    # Calculate the HMAC from the request body
    calculated_hmac = hmac.new(
        key=bytes(SECRET, 'utf-8'),  # Your shared secret with Shopify
        msg=request.body,            # Request body that Shopify sent
        digestmod=hashlib.sha256
    ).hexdigest()

    # Handle the case where either HMAC is None
    if shopify_hmac is None or calculated_hmac is None:
        raise ValueError("Invalid HMAC value")

    # Compare the HMACs safely
    return hmac.compare_digest(shopify_hmac, calculated_hmac)
