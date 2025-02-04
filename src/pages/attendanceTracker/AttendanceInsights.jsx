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
  const [shareholderAttendance, setShareholderAttendance] = useState([]);
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
        const data = await response.jsetSMAttendanceson();
        setShareholders(data.data);
        setBMAttendance(data.data?.meetings);
        setCMAttendance(data.data?.committeeMeetings);
        setSMAttendance(
          data.data?.shareholderMeetings?.shareholderMeetingsDirectors
        );
        setShareholderAttendance(
          data.data?.shareholderMeetings?.shareholderMeetingsShareholders
        );
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
          {bmAttendance?.length >= 1 ? (
            (() => {
              const allMeetingKeys = [
                ...new Set(
                  bmAttendance.flatMap((meeting) =>
                    Object.keys(meeting).filter((key) => key.startsWith("BM"))
                  )
                ),
              ].sort((a, b) =>
                a.localeCompare(b, undefined, { numeric: true })
              );

              return (
                <table className="border-collapse border border-gray-400 w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 px-4 py-2">
                        Director
                      </th>
                      {allMeetingKeys.map((bmKey) => (
                        <th
                          key={bmKey}
                          className="border border-gray-400 px-4 py-2"
                        >
                          {bmKey.replace("BM", "Board Meeting ")}
                        </th>
                      ))}
                      <th className="border border-gray-400 px-4 py-2">
                        Total Meetings Attended
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bmAttendance.map((meeting) => (
                      <tr key={meeting.director}>
                        <td className="border border-gray-300 px-4 py-2">
                          {meeting.director}
                        </td>
                        {allMeetingKeys.map((bmKey) => (
                          <td
                            key={bmKey}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {/* {meeting[bmKey] === "TRUE" ? "Present" : "Absent"} */}
                            {meeting[bmKey] === "TRUE"
                              ? "Present"
                              : meeting[bmKey] === "FALSE"
                              ? "Absent"
                              : meeting[bmKey] === "-"
                              ? "N/A" // Or whatever value you want for "-"
                              : "N/A"}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 font-bold">
                          {meeting.present_total ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>

        <Tab eventKey="CommitteeMeeting" title="Committee Meeting">
          {cmAttendance?.length >= 1 ? (
            (() => {
              const allCommitteeKeys = [
                ...new Set(
                  cmAttendance.flatMap((meeting) =>
                    Object.keys(meeting).filter((key) => key.startsWith("CM"))
                  )
                ),
              ].sort((a, b) =>
                a.localeCompare(b, undefined, { numeric: true })
              );

              return (
                <table className="border-collapse border border-gray-400 w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 px-4 py-2">
                        Director
                      </th>
                      {allCommitteeKeys.map((cmKey) => (
                        <th
                          key={cmKey}
                          className="border border-gray-400 px-4 py-2"
                        >
                          {cmKey.replace("CM", "Committee Meeting ")}
                        </th>
                      ))}
                      <th className="border border-gray-400 px-4 py-2">
                        Total Meetings Attended
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cmAttendance.map((meeting) => (
                      <tr key={meeting.director}>
                        <td className="border border-gray-300 px-4 py-2">
                          {meeting.director}
                        </td>
                        {allCommitteeKeys.map((cmKey) => (
                          <td
                            key={cmKey}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {/* {meeting[cmKey] === "TRUE" ? "Present" : "Absent"} */}
                            {meeting[cmKey] === "TRUE"
                              ? "Present"
                              : meeting[cmKey] === "FALSE"
                              ? "Absent"
                              : meeting[cmKey] === "-"
                              ? "N/A" // Or whatever value you want for "-"
                              : "N/A"}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 font-bold">
                          {meeting.present_total ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>
        <Tab eventKey="ShareholderMeeting" title="Shareholder Meeting">
          <h2>Director Attendance</h2>

          {smAttendance?.length >= 1 ? (
            (() => {
              const allShareholderKeys = [
                ...new Set(
                  smAttendance.flatMap((meeting) =>
                    Object.keys(meeting).filter((key) => key.startsWith("SH"))
                  )
                ),
              ].sort((a, b) =>
                a.localeCompare(b, undefined, { numeric: true })
              );

              return (
                <table className="border-collapse border border-gray-400 w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 px-4 py-2">
                        Director
                      </th>
                      {allShareholderKeys.map((shKey) => (
                        <th
                          key={shKey}
                          className="border border-gray-400 px-4 py-2"
                        >
                          {shKey.replace("SH", "Shareholder Meeting ")}
                        </th>
                      ))}

                      <th className="border border-gray-400 px-4 py-2">
                        Total Meetings Attended
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {smAttendance.map((meeting) => (
                      <tr key={meeting.director}>
                        <td className="border border-gray-300 px-4 py-2">
                          {meeting.director}
                        </td>
                        {allShareholderKeys.map((shKey) => (
                          <td
                            key={shKey}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {meeting[shKey] === "TRUE"
                              ? "Present"
                              : meeting[shKey] === "FALSE"
                              ? "Absent"
                              : meeting[shKey] === "-"
                              ? "N/A" // Or whatever value you want for "-"
                              : "N/A"}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 font-bold">
                          {meeting.present_total ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div className="text-center mt-5">
              <h5>No director attendance available</h5>
            </div>
          )}
          <h2 className="mt-3">Shareholder Attendance</h2>
          {shareholderAttendance?.length >= 1 ? (
            (() => {
              const allShareholderKeys = [
                ...new Set(
                  shareholderAttendance.flatMap((meeting) =>
                    Object.keys(meeting).filter((key) => key.startsWith("SH"))
                  )
                ),
              ].sort((a, b) =>
                a.localeCompare(b, undefined, { numeric: true })
              );

              return (
                <table className="border-collapse border border-gray-400 w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 px-4 py-2">
                        Director
                      </th>
                      {allShareholderKeys.map((shKey) => (
                        <th
                          key={shKey}
                          className="border border-gray-400 px-4 py-2"
                        >
                          {shKey.replace("SH", "Shareholder Meeting ")}
                        </th>
                      ))}
                      <th className="border border-gray-400 px-4 py-2">
                        Total Meetings Attended
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareholderAttendance.map((meeting) => (
                      <tr key={meeting.director}>
                        <td className="border border-gray-300 px-4 py-2">
                          {meeting.director}
                        </td>
                        {allShareholderKeys.map((shKey) => (
                          <td
                            key={shKey}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {meeting[shKey] === "TRUE"
                              ? "Present"
                              : meeting[shKey] === "FALSE"
                              ? "Absent"
                              : meeting[shKey] === "-"
                              ? "N/A" // Or whatever value you want for "-"
                              : "N/A"}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 font-bold">
                          {meeting.present_total ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div className="text-center mt-5">
              <h5>No Shareholder attendance available</h5>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
