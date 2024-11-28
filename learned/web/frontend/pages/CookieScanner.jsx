import React, { useState, useEffect } from "react";

const CookieTable = () => {
  const [cookies, setCookies] = useState([]);

  // Fetch and parse cookies
  useEffect(() => {
    const fetchCookies = () => {
      const rawCookies = document.cookie; // Get cookies in "key=value; key2=value2" format
      const cookieArray = rawCookies.split("; ").map((cookie) => {
        const [key, value] = cookie.split("="); // Split into key and value
        return {
          name: key,
          value: decodeURIComponent(value || ""), // Decode any encoded characters
          domain: document.domain, // Current domain
          path: "/", // Default path
          expires: "Session", // JavaScript cannot access cookie expiration
          secure: window.location.protocol === "https:", // Set based on protocol
          httpOnly: "No", // Cannot determine `HttpOnly` in JavaScript
          sameSite: "N/A", // Cannot determine `SameSite` in JavaScript
        };
      });
      setCookies(cookieArray);
    };

    fetchCookies();
  }, []);

  return (
    <div>
      <h2>Cookies</h2>
      <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Domain</th>
            <th>Path</th>
            <th>Expires</th>
            <th>Secure</th>
            <th>HttpOnly</th>
            <th>SameSite</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie, index) => (
            <tr key={index}>
              <td>{cookie.name}</td>
              <td>{cookie.value}</td>
              <td>{cookie.domain}</td>
              <td>{cookie.path}</td>
              <td>{cookie.expires}</td>
              <td>{cookie.secure ? "Yes" : "No"}</td>
              <td>{cookie.httpOnly}</td>
              <td>{cookie.sameSite}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CookieTable;
