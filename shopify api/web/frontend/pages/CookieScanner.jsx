import React, { useEffect, useState } from "react";
import { Page, Card, DataTable } from "@shopify/polaris";

function CookieScanner() {
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFirstPartyCookies = () => {
    const cookieString = document.cookie;
    console.log("First-party cookies:", cookieString);
    if (!cookieString) return [];
    return cookieString.split("; ").map((cookie) => {
      const [name, value] = cookie.split("=");
      return { name, value: decodeURIComponent(value || "") };
    });
  };

  const fetchHttpOnlyCookies = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/shopify_app/get_cookies/", {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("HTTP-only cookies response:", data); // Log response for debugging
        return Object.entries(data.cookies || {}).map(([name, value]) => ({ name, value }));
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching HTTP-only cookies:", error);
      return [];
    }
  };
  
  
  const fetchAllCookies = async () => {
    setLoading(true);
    try {
      const firstParty = fetchFirstPartyCookies();
      const httpOnly = await fetchHttpOnlyCookies();
      setCookies([...firstParty, ...httpOnly]);
    } catch (error) {
      console.error("Error fetching cookies:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAllCookies();
  }, []);

  const renderCookiesTable = (cookieList) => {
    return cookieList.map((cookie) => [cookie.name, cookie.value]);
  };

  return (
    <Page title="Cookie Scanner">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card title="Cookies">
          <DataTable
            columnContentTypes={["text", "text"]}
            headings={["Cookie Name", "Cookie Value"]}
            rows={renderCookiesTable(cookies)}
          />
        </Card>
      )}
    </Page>
  );
}

export default CookieScanner;
