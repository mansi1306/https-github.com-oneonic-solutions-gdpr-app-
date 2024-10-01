import { useState } from 'react';
import { authenticateShopify } from './utils/shopifyApi';

const ShopifyAuth = () => {
  const [shopUrl, setShopUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticateShopify(shopUrl);
      window.location.href = response.authUrl;
    } catch (error) {
      console.error('Error authenticating Shopify store:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={shopUrl}
        onChange={(e) => setShopUrl(e.target.value)}
        placeholder="Enter Shopify store URL"
      />
      <button type="submit">Authenticate</button>
    </form>
  );
};

export default ShopifyAuth;
