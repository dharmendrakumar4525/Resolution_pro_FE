import React from "react";
import { Button } from "react-bootstrap";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const CustomerMaintenanceDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const row = location.state.row;
  console.log(row,"mukul")
  const navigate = useNavigate();
  return (
    <div className="details-container">
      <h2>Details for {row?.name}</h2>
      <div className="details-grid">
        <div>
          <strong>State:</strong>
        </div>
        <div>{row?.state}</div>

        <div>
          <strong>Country:</strong>
        </div>
        <div>{row?.country}</div>

        <div>
          <strong>CIN:</strong>
        </div>
        <div>{row?.cin}</div>

        <div>
          <strong>GSTIN:</strong>
        </div>
        <div>{row?.gstin}</div>

        <div>
          <strong>PAN:</strong>
        </div>
        <div>{row?.pan}</div>

        {/* <div>
          <strong>O:</strong>
        </div>
        <div>{row?.o ? "Yes" : "No"}</div>

        <div>
          <strong>C:</strong>
        </div>
        <div>{row?.c ? "Yes" : "No"}</div>

        <div>
          <strong>V:</strong>
        </div>
        <div>{row?.v ? "Yes" : "No"}</div>

        <div>
          <strong>RO:</strong>
        </div>
        <div>{row?.ro ? "Yes" : "No"}</div> */}

        <div>
          <strong>Revision:</strong>
        </div>
        <div>{row?.revision}</div>

        <div>
          <strong>Alloted Manager:</strong>
        </div>
        <div>{row?.alloted_manager[0]?.name || "-"}</div>
      </div>
      <div className="mt-4"></div>
      <h3>Directors</h3>
      <div className="card-section">
          
          {row?.directorDataDetails && row?.directorDataDetails.length > 0 ? (
            row?.directorDataDetails.map((director, index) => (
              <div key={index} className="director-card">
                <div><strong>Director Name:</strong>  {director.name || "-"}</div>

                <div ><strong >Email:</strong>  {director.email || "-"}</div>
              </div>
            ))
          ) : (
            <p>No director details available.</p>
          )}
        </div>
        <div className="mt-5"></div>
        <h3>Locations</h3>
      <div className="card-section">
          {row?.locations && row?.locations.length > 0 ? (
            row?.locations.map((loc, index) => (
              <div className="director-card" key={index} >
                <div><strong>Location Name:</strong></div>
                <div>{loc.locationName || "-"}</div>

                <div><strong>Address Line 1:</strong></div>
                <div>{loc.addressLine1 || "-"}</div>

                <div><strong>Address Line 2:</strong></div>
                <div>{loc.addressLine2 || "-"}</div>
                <div><strong>State:</strong></div>
                <div>{loc.state || "-"}</div>

                <div><strong>Country:</strong></div>
                <div>{loc.country || "-"}</div>

           

                <div><strong>Postal Code:</strong></div>
                <div>{loc.postalCode || "-"}</div>

                <div><strong>Registered Office:</strong></div>
                <div>{loc.registeredOffice ? "Yes" : "No"}</div>

               
              </div>
            ))
          ) : (
            <p>No location details available.</p>
          )}
        </div>
       
      
    </div>
  );
};

export default CustomerMaintenanceDetail;
