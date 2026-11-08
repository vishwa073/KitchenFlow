
import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useApi } from "../lib/api";

export default function AuthMeTest() {
  const { isSignedIn, isLoaded } = useAuth();
  const { apiFetch } = useApi();

  const [result, setResult] = useState("Ready to test.");

  async function checkMe() {
    console.log("Check API button clicked");

    setResult("Request started...");

    try {
      const response = await apiFetch("/api/auth/me");
      console.log("API response status:", response.status);

      const data = await response.json();
      console.log("API response data:", data);

      setResult(
        `HTTP ${response.status}\n${JSON.stringify(data, null, 2)}`,
      );
    } catch (error) {
      console.error("API request failed:", error);

      setResult(
        error instanceof Error ? error.message : "Request failed",
      );
    }
  }

  if (!isLoaded) {
    return <p>Loading Clerk...</p>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h2>Authentication API Test</h2>

      <p>
        Clerk status: {isSignedIn ? "Signed in" : "Not signed in"}
      </p>

      <button
        onClick={checkMe}
        disabled={!isSignedIn||!isLoaded}
      >
        Check API /me
      </button>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: "16px" }}>
        {result}
      </pre>
    </div>
  );
}
