import { BrowserRouter as Router, Route, Navigate,Routes} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import React, { useEffect, useState } from "react"; 

import { QueryProvider, PolarisProvider } from "./components";

export default function App() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const getShopUrl = () => {
    // First, check if shop URL is stored in session storage
    let shopUrl = sessionStorage.getItem('shopUrl');

    // If not in session storage, try to extract it from the URL parameters
    if (!shopUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      shopUrl = urlParams.get('shop');
    }

    // If we have a valid shop URL, store it in session storage for future use
    if (shopUrl) {
      sessionStorage.setItem('shopUrl', shopUrl);
    }

    return shopUrl;
  };

  const shopUrl = getShopUrl();

  if (!shopUrl) {
    console.error('Shop URL not found');
    return; // Exit if no shop URL is available
  } else {
    console.log(shopUrl);
  }

  // Fetch the selected plan from the backend when the app loads
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`https://127.0.0.1:8000/shopify_app/get_plan?shop_url=gdprstore11.myshopify.com`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });
      

        if (response.ok) {
          const data = await response.json();
          if (data.plan) {
            setSelectedPlan(data.plan);
          } else {
            window.location.href = "/MonthPlan";  // Navigate to plan selection if no plan is selected
          }
        } else {
          console.error("Error fetching plan:", response.status);
          window.location.href = "/MonthPlan";  // Navigate to plan selection if there's an error
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        window.location.href = "/MonthPlan";  // Navigate to plan selection in case of error
      }
    };

    fetchPlan();
  }, [shopUrl]);

  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <Router>
        <QueryProvider>
          <Routes>
            {/* If no plan is selected, redirect to /select-plan */}
            {!selectedPlan ? (
              <Route path="*" element={<Navigate to="/MonthPlan" />} />
            ) : (
              <>
                {/* Routes for different pages based on selected plan */}
                <Route path="/" element={<Home />} />
                <Route path="/Integrations" element={<Navigate to="/Integrations" />} />

                {selectedPlan === "$2" || selectedPlan === "$3" ? (
                  <Route path="/checklist" element={<Navigate to="/Checklist" />} />
                ) : null}

                {selectedPlan === "$3" ? (
                  <Route path="/cookie-scanner" element={<Navigate to="/CookieScanner" />}/>
                ) : null}

                {/* Redirect any unknown route to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}

            {/* Plan Selection Page Route */}
            <Route path="*" element={<Navigate to="/Monthplan" />} />
          </Routes>
        </QueryProvider>
      </Router>
    </PolarisProvider>
  );
}