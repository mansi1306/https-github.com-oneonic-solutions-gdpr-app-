import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { QueryProvider, PolarisProvider } from "./components";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { useAppBridge } from "@shopify/app-bridge-react";
import { BrowserRouter } from 'react-router-dom';


function AppContent() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const app = useAppBridge();

  const getShopUrl = () => {
    let shopUrl = sessionStorage.getItem("shopUrl");
    if (!shopUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      shopUrl = urlParams.get("shop");
    }
    if (shopUrl) {
      sessionStorage.setItem("shopUrl", shopUrl);
    }
    return shopUrl;
  };

  const shopUrl = getShopUrl();

  useEffect(() => {
    const fetchAccessTokenAndPlan = async () => {
      if (!shopUrl) {
        console.error("Shop URL not found");
        return;
      }
    
      try {
        // Fetch CSRF token
        const fetchCsrfToken = async () => {
          try {
            const response = await fetch('http://127.0.0.1:8000/shopify_app/get_csrf_token/', {
              credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch CSRF token');
            const data = await response.json();
            return data.csrfToken;
          } catch (error) {
            console.error('Error fetching CSRF token:', error);
          }
        };
    
        const csrfToken = await fetchCsrfToken();
        if (!csrfToken) {
          console.error('CSRF token could not be fetched.');
          return;
        }
    
        // Fetch access token
        const accessTokenResponse = await fetch(
          `http://127.0.0.1:8000/shopify_app/get_access_token/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ shop_url: shopUrl }),
          }
        );        
    
        if (!accessTokenResponse.ok) {
          const errorText = await accessTokenResponse.text();
          console.error(`Error ${accessTokenResponse.status}: ${errorText}`);
          
          if (accessTokenResponse.status === 404) {
            const authUrl = `http://127.0.0.1:8000/shopify_app/auth/?shop=${shopUrl}`;
            
            // Redirect to the Shopify authentication page in the same window or tab
            window.top.location.href = authUrl; // or use window.location.replace(authUrl)
            navigate("/MonthPlan");
            return;
          }
        }        
        
    
        // Fetch plan data
        const planResponse = await fetch(
          `http://127.0.0.1:8000/shopify_app/get_plan?shop_url=${shopUrl}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
    
        if (planResponse.ok) {
          const data = await planResponse.json();
          setSelectedPlan(data.plan || null);
        } else {
          console.error("Failed to fetch plan:", planResponse.status);
          setSelectedPlan(null);
    
          if (planResponse.status === 404) {
            navigate("/MonthPlan");
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setSelectedPlan(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccessTokenAndPlan();
  }, [app, navigate, shopUrl]);

  const { t } = useTranslation();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <NavMenu>
      {selectedPlan === "Basic" && (
        <>
          <a href="/" rel="home">Home</a>
          <a href="/BannerRegion">Banner settings</a>
          <a href="/Integrations">Integrations</a>
          <a href="/Consent-logs">Consent logs</a>
          <a href="/checklist">GDPR Checklist</a>
          <a href="/CookieScanner">Cookie Scanner</a>
          <a href="/MonthPlan">Plan</a>
        </>
      )}
      {selectedPlan === "Standard" && (
        <>
          <a href="/" rel="home">Home</a>
          <a href="/BannerRegion">Banner settings</a>
          <a href="/Integrations">Integrations</a>
          <a href="/Consent-logs">Consent logs</a>
          <a href="/checklist">GDPR Checklist</a>
          <a href="/CookieScanner">Cookie Scanner</a>
          <a href="/MonthPlan">Plan</a>
        </>
      )}
      {selectedPlan === "Advanced" && (
        <>
          <a href="/" rel="home">Home</a>
          <a href="/BannerRegion">Banner settings</a>
          <a href="/Integrations">Integrations</a>
          <a href="/Consent-logs">Consent logs</a>
          <a href="/checklist">GDPR Checklist</a>
          <a href="/CookieScanner">Cookie Scanner</a>
          <a href="/MonthPlan">Plan</a>
        </>
      )}
    </NavMenu>
  );
}

export default function App() {
  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <AppContent />
          <Routes pages={import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", { eager: true })} />
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
