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
      <h2>Details for {row?.name}</h2>
      <div className="details-grid">
        <div>
          <strong>Client Manager:</strong>
        </div>
        <div>{row?.alloted_manager[0]?.name || "-"}</div>
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
      <h3>Locations</h3>
      <div className="card-section">
        <Table borderless responsive>
          <tbody className="card-section">
            {row?.locations && row?.locations.length > 0 ? (
              row?.locations.map((loc, index) => (
                <div className="director-card" key={index}>
                  <tr>
                    <td style={{ width: "200px", fontWeight: "bold" }}>
                      <strong>Location Name:</strong>
                    </td>
                    <td>{loc.locationName || "-"}</td>
                  </tr>
                  <tr>
                    {" "}
                    <td>
                      <strong>Address Line 1:</strong>
                    </td>
                    <td>{loc.addressLine1 || "-"}</td>
                  </tr>
                  <tr>
                    {" "}
                    <td>
                      <strong>Address Line 2:</strong>
                    </td>
                    <td>{loc.addressLine2 || "-"}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>State:</strong>
                    </td>
                    <td>{loc.state || "-"}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Country:</strong>
                    </td>
                    <td>{loc.country || "-"}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Postal Code:</strong>
                    </td>
                    <td>{loc.postalCode || "-"}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Registered Office:</strong>
                    </td>
                    <td>{loc.registeredOffice ? "Yes" : "No"}</td>
                  </tr>
                </div>
              ))
            ) : (
              <p>No location details available.</p>
            )}
          </tbody>
        </Table>
      </div>
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
