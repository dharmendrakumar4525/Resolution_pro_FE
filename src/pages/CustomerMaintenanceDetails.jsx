import React from "react";
import { Button } from "react-bootstrap";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const CustomerMaintenanceDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const row = location.state.row;
  const navigate = useNavigate();
  return (
    <div className="details-container">
      <h2>Details for {row.name}</h2>
      <div className="details-grid">
        <div>
          <strong>State:</strong>
        </div>
        <div>{row.state}</div>

        <div>
          <strong>Country:</strong>
        </div>
        <div>{row.country}</div>

        <div>
          <strong>CIN:</strong>
        </div>
        <div>{row.cin}</div>

        <div>
          <strong>GSTIN:</strong>
        </div>
        <div>{row.gstin}</div>

        <div>
          <strong>PAN:</strong>
        </div>
        <div>{row.pan}</div>

        <div>
          <strong>O:</strong>
        </div>
        <div>{row.o ? "Yes" : "No"}</div>

        <div>
          <strong>C:</strong>
        </div>
        <div>{row.c ? "Yes" : "No"}</div>

        <div>
          <strong>V:</strong>
        </div>
        <div>{row.v ? "Yes" : "No"}</div>

        <div>
          <strong>RO:</strong>
        </div>
        <div>{row.ro ? "Yes" : "No"}</div>

        <div>
          <strong>Revision:</strong>
        </div>
        <div>{row.revision}</div>

        <div>
          <strong>Alloted Manager:</strong>
        </div>
        <div>{row.alloted_manager?.name || "-"}</div>
      </div>
    </div>
  );
};

export default CustomerMaintenanceDetail;
