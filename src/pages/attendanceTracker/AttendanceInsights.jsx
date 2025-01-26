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
  Tabs,
  Tab,
} from "react-bootstrap";
import { apiURL } from "../../API/api";

import { faEye } from "@fortawesome/free-solid-svg-icons";
export default function AttendanceInsights() {
  const [shareholders, setShareholders] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [bmAttendance, setBMAttendance] = useState([]);
  const [cmAttendance, setCMAttendance] = useState([]);
  const [smAttendance, setSMAttendance] = useState([]);
  const { id } = useParams();
  const location = useLocation();
  const row = location.state.row;
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/customer-maintenance/attendance/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setShareholders(data.data);
        setBMAttendance(data.data?.meetings);
        setCMAttendance(data.data?.committeeMeetings);
        setSMAttendance(data.data?.shareholderMeetings);
        // console.log("absentees", data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id, token]);
  const toggleRow = (meetingId) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(meetingId)
        ? prevExpandedRows.filter((id) => id !== meetingId)
        : [...prevExpandedRows, meetingId]
    );
  };
  return (
    <div className="details-container">
      <h2 className="mb-4">Attendance Details for {row?.company_name}</h2>

      <Tabs
        defaultActiveKey="BoardMeeting"
        id="example-tabs"
        className="mb-3 mt-4"
      >
        <Tab
          eventKey="BoardMeeting"
          title="Board Meeting"
          className="bg-black-400 w-full"
        >
          {bmAttendance?.length > 1 ? (
            <table className="width-70 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Meeting Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Directors Present
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bmAttendance?.map((meeting) => (
                  <React.Fragment key={meeting.id}>
                    {/* Main Row */}
                    <tr className="mb-2">
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting.participants.length} Directors
                      </td>
                      <td
                        className="border border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRow(meeting.id)}
                      >
                        <Button>
                          {expandedRows.includes(meeting.id) ? "Hide" : "Show"}
                        </Button>
                      </td>
                    </tr>

                    {/* Collapsible Row */}
                    {expandedRows.includes(meeting.id) && (
                      <>
                        {meeting.participants?.map((participant) => (
                          <tr
                            key={participant.id}
                            className="px-4 py-3 bg-shade"
                          >
                            <td className="px-4">
                              {participant.director.name}
                            </td>
                            <td className="px-4">
                              {participant.isPresent || participant.isPresent_vc
                                ? "Present"
                                : "Absent"}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>

        <Tab eventKey="CommitteeMeeting" title="Committee Meeting">
          {cmAttendance?.length >= 1 ? (
            <table className="width-70 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Meeting Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Directors Present
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cmAttendance?.map((meeting) => (
                  <React.Fragment key={meeting?.id}>
                    {/* Main Row */}
                    <tr className="mb-2">
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.participants?.length} Directors
                      </td>
                      <td
                        className="border border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRow(meeting?.id)}
                      >
                        <Button>
                          {expandedRows.includes(meeting?.id) ? "Hide" : "Show"}
                        </Button>
                      </td>
                    </tr>

                    {/* Collapsible Row */}
                    {expandedRows.includes(meeting?.id) && (
                      <>
                        {meeting?.participants?.map((participant) => (
                          <tr
                            key={participant._id}
                            className="px-4 py-3 bg-shade"
                          >
                            <td className="px-4">
                              {participant?.director?.name}
                            </td>
                            <td className="px-4">
                              {participant?.isPresent ||
                              participant?.isPresent_vc
                                ? "Present"
                                : "Absent"}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>
        <Tab eventKey="ShareholderMeeting" title="Shareholder Meeting">
          {smAttendance?.length >= 1 ? (
            <table className="width-70 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Meeting Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Directors Present
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {smAttendance?.map((meeting) => (
                  <React.Fragment key={meeting.id}>
                    {/* Main Row */}
                    <tr className="mb-2">
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.participants.length} Directors
                      </td>
                      <td
                        className="border border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRow(meeting?.id)}
                      >
                        <Button>
                          {expandedRows.includes(meeting.id) ? "Hide" : "Show"}
                        </Button>
                      </td>
                    </tr>

                    {/* Collapsible Row */}
                    {expandedRows.includes(meeting.id) && (
                      <>
                        {meeting.participants?.map((participant) => (
                          <tr
                            key={participant?._id}
                            className="px-4 py-3 bg-shade"
                          >
                            <td className="px-4">
                              {participant?.director?.name}
                            </td>
                            <td className="px-4">
                              {participant?.isPresent ||
                              participant?.isPresent_vc
                                ? "Present"
                                : "Absent"}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
