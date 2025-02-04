import React, { useEffect, useState } from "react";

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
import { apiURL } from "../../API/api";

const CustomerMaintenanceDetail = () => {
  const [shareholders, setShareholders] = useState([]);
  const { id } = useParams();
  const location = useLocation();
  const row = location.state.row;
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/shareholder-data?company_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setShareholders(data.results);
        console.log("object", data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id, token]);
  console.log(row, "roew");
  return (
    <div className="details-container">
      <h2>Details for {row?.company_name}</h2>
      <div className="details-grid mt-4">
        <div>
          <strong>Client Manager</strong>
        </div>
        <div>{row?.alloted_manager[0]?.name || "-"}</div>

        <div>
          <strong>Company Email</strong>
        </div>
        <div>{row?.email_id || "-"}</div>
        <div>
          <strong>Consultant</strong>
        </div>
        <div>{row?.alloted_consultant[0]?.name || "-"}</div>
        <div>
          <strong>Company Secretary Name</strong>
        </div>
        <div>{row?.secretary_detail?.name || "-"}</div>
        <div>
          <strong>Company Secretary Email</strong>
        </div>
        <div>{row?.secretary_detail?.email || "-"}</div>
        <div>
          <strong>Auditor Name</strong>
        </div>
        <div>{row?.auditor_detail?.name || "-"}</div>
        <div>
          <strong>Auditor Email</strong>
        </div>
        <div>{row?.auditor_detail?.email || "-"}</div>
        <div>
          <strong>Registered Address</strong>
        </div>
        <div>{row?.registered_address}</div>
        <div>
          <strong>Authorised Capital (Equity)</strong>
        </div>
        <div>{row?.authorised_capital_equity}</div>
        <div>
          <strong>Authorised Capital (Preference)</strong>
        </div>
        <div>{row?.authorised_capital_preference_capital}</div>
        <div>
          <strong>Paid up Capital (Equity)</strong>
        </div>
        <div>{row?.paid_up_capital_equity}</div>
        <div>
          <strong>Paid up Capital(Preference)</strong>
        </div>
        <div>{row?.paid_up_capital_preference_capital}</div>
        <div>
          <strong>Class</strong>
        </div>
        <div>{row?.class_of_company}</div>
        <div>
          <strong>Subcategory</strong>
        </div>
        <div>{row?.company_subcategory}</div>
        <div>
          <strong>Registeration Number</strong>
        </div>
        <div>{row?.registration_number}</div>
        <div>
          <strong>ROC Code</strong>
        </div>
        <div>{row?.roc_code}</div>

        <div>
          <strong>CIN</strong>
        </div>
        <div>{row?.cin}</div>
        <div>
          <strong>Date of Balance Sheet</strong>
        </div>
        <div>
          {new Date(row?.date_of_balance_sheet).toLocaleDateString("en-GB")}
        </div>
        <div>
          <strong>Date Of Incorporation</strong>
        </div>

        <div>
          {new Date(row?.date_of_incorporation).toLocaleDateString("en-GB")}
        </div>
        <div>
          <strong>Date Of Last Agm</strong>
        </div>
        <div>{new Date(row?.date_of_last_agm).toLocaleDateString("en-GB")}</div>

        <div>
          <strong>PAN</strong>
        </div>
        <div>{row?.pan}</div>
        <div>
          <strong>Book Account Address</strong>
        </div>
        <div>{row?.books_of_account}</div>
        <div>
          <strong>
            Net worth as per last audited financials (Section 2(57) of the Act)
          </strong>
        </div>
        <div>{row?.books_of_account}</div>
      </div>
      <div className="mt-4"></div>
      <h3>Directors</h3>
      <div className="card-section">
        {row?.directorDataDetails && row?.directorDataDetails.length > 0 ? (
          row?.directorDataDetails.map((director, index) => (
            <div key={index} className="director-card">
              <tr>
                <strong>Name:</strong> {director?.name || "-"}
              </tr>
              <div>
                <strong>Designation:</strong> {director?.designation || "-"}
              </div>
              <div>
                <strong>Email:</strong> {director?.email || "-"}
              </div>
              <div>
                <strong>DIN/PAN:</strong> {director?.["din/pan"] || "-"}
              </div>
            </div>
          ))
        ) : (
          <p>No director details available.</p>
        )}
      </div>
      <div className="mt-4"></div>
      <h3>Shareholders</h3>
      <div className="card-section">
        {shareholders.length > 0 ? (
          shareholders?.map((shareholder, index) => (
            <div key={index} className="director-card">
              <div>
                <strong>Name:</strong> {shareholder?.name || "-"}
              </div>
              <div>
                <strong>Designation:</strong> {shareholder?.designation || "-"}
              </div>

              <div>
                <strong>Email:</strong> {shareholder?.email || "-"}
              </div>
              <div>
                <strong>DIN/PAN:</strong> {shareholder?.["din/pan"] || "-"}
              </div>
            </div>
          ))
        ) : (
          <p>No shareholder details available.</p>
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
              <table>
                <tbody>
                  <tr>
                    <td>
                      <strong>Name:</strong>
                    </td>{" "}
                    <td>{partcipant.name || "-"}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>Email:</strong>
                    </td>{" "}
                    <td>{partcipant.email || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No partcipant details available.</p>
        )}
      </div>
      <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
        Go Back
      </Button>
    </div>
  );
};

export default CustomerMaintenanceDetail;
