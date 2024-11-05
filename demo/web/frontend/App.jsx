import { BrowserRouter, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react"; 
import { QueryProvider, PolarisProvider } from "./components";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

function AppContent() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectToPlan, setRedirectToPlan] = useState(false);

  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  const getShopUrl = () => {
    let shopUrl = sessionStorage.getItem('shopUrl');
    if (!shopUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      shopUrl = urlParams.get('shop');
    }
    if (shopUrl) {
      sessionStorage.setItem('shopUrl', shopUrl);
      console.log(shopUrl);
    }
    return shopUrl;
  };

  const shopUrl = getShopUrl();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      if (!shopUrl) {
        console.error('Shop URL not found');
        setRedirectToPlan(true);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/shopify_app/get_plan?shop_url=${shopUrl}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSelectedPlan(data.plan || null);
        } else {
          console.error('Failed to fetch plan:', response.status);
          setSelectedPlan(null);
        }
        if (response.status === 404) {
          setRedirectToPlan(true);
          return;
        }
      } catch (error) {
        setSelectedPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [shopUrl]);

  useEffect(() => {
    if (redirectToPlan) {
      navigate("/MonthPlan"); // navigate once the redirectToPlan flag is set
    }
  }, [redirectToPlan, navigate]);

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
