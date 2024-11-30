import React, { useEffect, useState } from "react";
import { useNavigate, BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryProvider, PolarisProvider } from "./components";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

function AppContent() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const app = useAppBridge();
  const { t } = useTranslation();

  // Retrieve shop URL from session storage or URL params
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

  // Redirect to OAuth if needed
  const redirectToOAuth = (shopUrl) => {
    if (app) {
      try {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.REMOTE, `https://6f55-103-105-234-95.ngrok-free.app/shopify_app/auth/?shop=${shopUrl}`);
      } catch (error) {
        console.error("Error during redirect:", error);
        // Fallback to browser window location if app bridge is not working
        window.location.href = `https://6f55-103-105-234-95.ngrok-free.app/shopify_app/auth/?shop=${shopUrl}`;
      }
    } else {
      console.error("App Bridge is not initialized. Falling back to window.location.href.");
      // Fallback to direct URL if App Bridge isn't initialized
      window.location.href = `https://6f55-103-105-234-95.ngrok-free.app/shopify_app/auth/?shop=${shopUrl}`;
    }
  };

  // Fetch CSRF token for authentication
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

  // Fetch access token and plan
  const fetchAccessTokenAndPlan = async () => {
    if (!shopUrl) {
      console.error("Shop URL not found");
      return;
    }

    try {
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

      // Redirect to OAuth if access token not found
      if (!accessTokenResponse.ok) {
        const errorText = await accessTokenResponse.text();
        console.error(`Error ${accessTokenResponse.status}: ${errorText}`);
        if (accessTokenResponse.status === 404) {
          redirectToOAuth(shopUrl);
          return;
        }
      }

      // Fetch plan information
      const planResponse = await fetch(
        `http://127.0.0.1:8000/shopify_app/get_plan?shop_url=${shopUrl}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (planResponse.ok) {
        const data = await planResponse.json();
        setSelectedPlan(data.plan || null);
      } else {
        console.error("Failed to fetch plan:", planResponse.status);
        setSelectedPlan(null);

        // Redirect to plan page if no plan is found
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

  useEffect(() => {
    if (app) {
      fetchAccessTokenAndPlan();
    }
  }, [app]);

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
