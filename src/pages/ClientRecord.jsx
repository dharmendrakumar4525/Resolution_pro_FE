import React, { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "key_test_gooSn78QUs1eOe7yNFVxF0g12ddkljyS";
const SECRET_KEY = "secret_test_JgBQ3FAgq1Py2d7kZ5DGDnNDWRwqsulB";

const ClientRecord = () => {
  const [token, setToken] = useState(null);
  const [cin, setCin] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get the auth token
  const getAuthToken = async () => {
    try {
      const response = await axios.post(
        "https://api.sandbox.co.in/authenticate",
        null,
        {
          headers: {
            Accept: "application/json",
            "X-Api-Key": API_KEY,
            "X-Api-Secret": SECRET_KEY,
            "X-Api-Version": "1.0",
          },
        }
      );
      const token = response.data.access_token;
      setToken(token);
    } catch (err) {
      console.error("Error fetching token:", err);
      setError("Failed to fetch authentication token");
    }
  };

  // Function to get MCA company master data
  const getMCACompanyMasterData = async (cin) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.sandbox.co.in/mca/company/master-data/search",
        {
          "@entity": "in.co.sandbox.kyc.mca.master_data.request",
          id: cin,
          consent: "y",
          reason: "for KYC",
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // Use the token obtained from authentication
            "X-Api-Key": API_KEY,
            "X-Api-Version": "1.0",
            "Content-Type": "application/json",
          },
        }
      );

      const data = {
        directors: response.data.data["directors/signatory_details"],
        email: response.data.data.company_master_data.email_id,
      };
      setCompanyData(data);
    } catch (err) {
      console.error("Error fetching MCA company master data:", err);
      setError("Failed to fetch MCA company data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch token when component mounts
  useEffect(() => {
    getAuthToken();
  }, []);

  // Handle CIN input change and trigger MCA data fetch
  const handleCinChange = (event) => {
    const inputCin = event.target.value;
    setCin(inputCin);

    if (inputCin.length > 0) {
      getMCACompanyMasterData(inputCin);
    }
  };

  return (
    <div>
      <h2>Enter CIN </h2>
      <input
        type="text"
        placeholder="Enter CIN"
        value={cin}
        onChange={handleCinChange}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {companyData && (
        <div>
          <h3>Company Data:</h3>
          <p>Email: {companyData.email}</p>
          <h4>Directors:</h4>
          <ul>
            {companyData.directors.map((director, index) => (
              <li key={index}>{director.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClientRecord;
