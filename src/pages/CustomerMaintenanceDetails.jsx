import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";

const CustomerMaintenanceDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const row = location.state.row;
  console.log(row, "mukul");
  const navigate = useNavigate();
  return (
    <div className="details-container">
      <h2>Details for {row?.company_name}</h2>
      <div className="details-grid mt-4">
        <div>
          <strong>Client Manager:</strong>
        </div>
        <div>{row?.alloted_manager[0]?.name || "-"}</div>
        <div>
          <strong>Consultant:</strong>
        </div>
        <div>{row?.alloted_consultant[0]?.name || "-"}</div>
        <div>
          <strong>Secretary Name:</strong>
        </div>
        <div>{row?.secretary_detail?.name || "-"}</div>
        <div>
          <strong>Secretary Email:</strong>
        </div>
        <div>{row?.secretary_detail?.email || "-"}</div>
        <div>
          <strong>Auditor Name:</strong>
        </div>
        <div>{row?.auditor_detail?.name || "-"}</div>
        <div>
          <strong>Auditor Email:</strong>
        </div>
        <div>{row?.auditor_detail?.email || "-"}</div>
        <div>
          <strong>Registered Address:</strong>
        </div>
        <div>{row?.registered_address}</div>
        <div>
          <strong>Authorised Capital Equity</strong>
        </div>
        <div>{row?.authorised_capital_equity}</div>
        <div>
          <strong>Authorised Capital Preference Capitals:</strong>
        </div>
        <div>{row?.authorised_capital_preference_capital}</div>
        <div>
          <strong>Class:</strong>
        </div>
        <div>{row?.class_of_company}</div>
        <div>
          <strong>Subcategory:</strong>
        </div>
        <div>{row?.company_subcategory}</div>
        <div>
          <strong>Registeration Number:</strong>
        </div>
        <div>{row?.registration_number}</div>
        <div>
          <strong>ROC Code:</strong>
        </div>
        <div>{row?.roc_code}</div>

        <div>
          <strong>CIN:</strong>
        </div>
        <div>{row?.cin}</div>
        <div>
          <strong>Date of Balance Sheet :</strong>
        </div>
        <div>
          {new Date(row?.date_of_balance_sheet).toLocaleDateString("en-GB")}
        </div>
        <div>
          <strong>Date Of Incorporation:</strong>
        </div>

        <div>
          {new Date(row?.date_of_incorporation).toLocaleDateString("en-GB")}
        </div>
        <div>
          <strong>Date Of Last Agm:</strong>
        </div>
        <div>{new Date(row?.date_of_last_agm).toLocaleDateString("en-GB")}</div>

        <div>
          <strong>PAN:</strong>
        </div>
        <div>{row?.pan}</div>
      </div>
      <div className="mt-4"></div>
      <h3>Directors</h3>
      <div className="card-section">
        {row?.directorDataDetails && row?.directorDataDetails.length > 0 ? (
          row?.directorDataDetails.map((director, index) => (
            <div key={index} className="director-card">
              <div>
                <strong>Director Name:</strong> {director.name || "-"}
              </div>

              <div>
                <strong>Email:</strong> {director.email || "-"}
              </div>
            </div>
          ))
        ) : (
          <p>No director details available.</p>
        )}
      </div>
      <div className="mt-5"></div>
      <div className="mt-4"></div>
      <h3>Additional Participants</h3>
      <div className="card-section">
        {row?.otherparticipantsDetails &&
        row?.otherparticipantsDetails.length > 0 ? (
          row?.otherparticipantsDetails.map((partcipant, index) => (
            <div key={index} className="director-card">
              <div>
                <strong>Participant Name:</strong> {partcipant.name || "-"}
              </div>

              <div>
                <strong>Email:</strong> {partcipant.email || "-"}
              </div>
            </div>
          ))
        ) : (
          <p>No partcipant details available.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerMaintenanceDetail;
