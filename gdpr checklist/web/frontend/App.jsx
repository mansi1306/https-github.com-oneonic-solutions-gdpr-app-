import { BrowserRouter, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { QueryProvider, PolarisProvider } from "./components";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

function AppContent() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  const getShopUrl = () => {
    let shopUrl = sessionStorage.getItem("shopUrl");
    if (!shopUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      shopUrl = urlParams.get("shop");
    }
    if (shopUrl) {
      sessionStorage.setItem("shopUrl", shopUrl);
      console.log(shopUrl);
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

        const accessTokenResponse = await fetch(
          `http://127.0.0.1:8000/shopify_app/get_access_token/`, // Ensure this URL is correct
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ shop_url: shopUrl }),
          }
        );        

        // Handle access token fetch errors
        if ([400, 404, 405 , 401].includes(accessTokenResponse.status)) {
          console.error(`Error ${accessTokenResponse.status}. Redirecting to auth...`);
          window.location.href = `http://127.0.0.1:8000/shopify_app/auth/?shop=${shopUrl}`;
          return;
        }

        if (!accessTokenResponse.ok) {
          throw new Error("Failed to fetch access token");
        }

        // Fetch Plan
        const planResponse = await fetch(
          `http://127.0.0.1:8000/shopify_app/get_plan?shop_url=${shopUrl}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Handle plan fetch
        if (planResponse.ok) {
          const data = await planResponse.json();
          setSelectedPlan(data.plan || null);
        } else {
          console.error("Failed to fetch plan:", planResponse.status);
          setSelectedPlan(null);
          // If no plan is found, redirect to /MonthPlan
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
  }, [shopUrl, navigate]);

  const { t } = useTranslation();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <NavMenu>
      {selectedPlan === "Basic" && (
        <>
          <a href="/" rel="home">Home</a>
          <a href="/Integrations">Integrations</a>
          <a href="/MonthPlan">Plan</a>
        </>
      )}
      {selectedPlan === "Standard" && (
        <>
          <a href="/" rel="home">Home</a>
          <a href="/Integrations">Integrations</a>
          <a href="/checklist">GDPR Checklist</a>
          <a href="/MonthPlan">Plan</a>
        </>
      )}
      {selectedPlan === "Advanced" && (
        <>
          <a href="/" rel="home">Home</a>
          <a href="/Integrations">Integrations</a>
          <a href="/checklist">GDPR Checklist</a>
          <a href="/CookieScanner">Cookie Scanner</a>
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
