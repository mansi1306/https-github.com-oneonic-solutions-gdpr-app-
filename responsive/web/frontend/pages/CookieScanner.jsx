import React, { useState } from "react";

const CookieScanner = () => {
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const scanCookies = () => {
    setLoading(true);
    setMessage("");

    // Log the cookies for debugging
    console.log("Cookies in document.cookie:", document.cookie);

    const cookieString = document.cookie;
    const scannedCookies = cookieString
      ? cookieString.split("; ").filter(Boolean)
      : [];

    if (scannedCookies.length === 0) {
      setMessage("No cookies found. Make sure cookies are set for this domain.");
    }
    setCookies(scannedCookies);
    setLoading(false);
  };

  const setTestCookie = () => {
    // Set a cookie with attributes
    document.cookie = "testCookie=exampleValue; path=/; SameSite=Lax;";
    setMessage("Test cookie set. Click 'Scan Cookies' to check.");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Cookie Scanner</h1>
      <button
        onClick={scanCookies}
        disabled={loading}
        style={{
          padding: "10px 20px",
          margin: "10px 5px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Scanning..." : "Scan Cookies"}
      </button>
      <button
        onClick={setTestCookie}
        style={{
          padding: "10px 20px",
          margin: "10px 5px",
          backgroundColor: "#28A745",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Set Test Cookie
      </button>
      {message && <p style={{ color: "#FF0000", marginTop: "10px" }}>{message}</p>}
      <h3>Cookies:</h3>
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {cookies.map((cookie, index) => (
          <li
            key={index}
            style={{
              padding: "5px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            {cookie}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: "20px", color: "#555" }}>
        <strong>Tip:</strong> If no cookies appear:
        <ol>
          <li>Verify cookies in Developer Tools (<code>Application &gt; Storage &gt; Cookies</code>).</li>
          <li>Ensure cookies are set for this domain.</li>
          <li>Remember that <code>HttpOnly</code> cookies are not accessible via JavaScript.</li>
        </ol>
      </p>
    </div>
  );
};

export default CookieScanner;
