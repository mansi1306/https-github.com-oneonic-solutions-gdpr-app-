import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { QueryProvider, PolarisProvider } from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  // Define your navigation links
  const navigationLinks = [
    {
      label: t("Integrations"),
      destination: "/Integrations",
    },
    // Add more links as needed
  ];


  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <NavMenu
            // Use the appropriate prop according to the documentation
            navigationLinks={navigationLinks} // Assuming 'navigationLinks' is the correct prop
          >
            <a href="/" rel="home">Home</a>
          </NavMenu>
          <Routes pages={pages} />
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
