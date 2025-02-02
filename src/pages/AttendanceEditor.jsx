import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  VerticalAlign,
  AlignmentType,
  HeightRule,
} from "docx";

import { Button, Form, Container, Spinner } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import mammoth from "mammoth";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styling/templateEditor.css";
import JoditEditor from "jodit-react";
import htmlDocx from "html-docx-js/dist/html-docx";
import Select from "react-select";

const AttendanceEditor = () => {
  const [rows, setRows] = useState([]);
  const [variable, setVariable] = useState({});
  const [participants, setParticipants] = useState([]);

  const [resolutionList, setResolutionList] = useState([]);
  const [clientInfo, setClientInfo] = useState([]);
  const [meetInfo, setMeetInfo] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [placeVar, setPlaceVar] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const [editorContent, setEditorContent] = useState(""); // CKEditor content
  const [initializedContent, setInitializedContent] = useState(""); // CKEditor content
  const [inputFields, setInputFields] = useState({}); // Placeholder values
  const [confirmedFields, setConfirmedFields] = useState({}); // Confirmed placeholders
  const location = useLocation();
  const { id } = useParams();
  const token = localStorage.getItem("refreshToken");
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const page = location.state?.page || "";
  const editor = useRef(null);

  const [refresh, setRefresh] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/agenda`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        console.log(data.results, "mkjl");
        setResolutionList(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/system-variable`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        setRows(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchVariables = async () => {
      try {
        let url;
        if (page == "committee") {
          url = `${apiURL}/committee-meeting/${id}`;
        } else if (page == "shareholder") {
          url = `${apiURL}/shareholder-meeting/${id}`;
        } else {
          url = `${apiURL}/meeting/${id}`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        setVariable(data.variables);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchVariables();
    fetchData();
  }, [token]);
  const countPreviousMeetings = (meetData, selectedId) => {
    // Find the current meeting by id
    const currentMeeting = meetData.find(
      (meeting) => meeting.id === selectedId
    );

    if (!currentMeeting) {
      console.error("Meeting with the provided id not found.");
      return;
    }

    // Extract client_name.id and createdAt from the current meeting
    const { client_name, createdAt: currentCreatedAt } = currentMeeting;

    if (!client_name || !client_name.id) {
      console.error(
        "client_name or client_name.id is missing in the current meeting."
      );
      return;
    }

    // Filter and count meetings matching the criteria
    const previousMeetings = meetData.filter(
      (meeting) =>
        meeting.client_name.id === client_name.id && // Same client
        new Date(meeting.createdAt) < new Date(currentCreatedAt) // Created before the current meeting
    );

    const count = previousMeetings.length + 1;

    // Set the count in the current meeting object (if needed)
    currentMeeting.previousMeetingCount = count;

    return count;
  };

  // Helper function to process placeholders
  const processPlaceholders = (content) => {
    const regex = /(?:\$\{([a-zA-Z0-9_]+)\})|(?:\#\{([a-zA-Z0-9_]+)\})/g;
    let match;
    let updatedContent = content;
    const fields = {};

    while ((match = regex.exec(content)) !== null) {
      const placeholder = match[1] || match[2];

      // Check if it's a system variable
      const systemVariable = variable[placeholder];
      // const systemVariable = rows.find((row) => row.name === placeholder);
      if (systemVariable) {
        console.log(systemVariable, "system-var");
        // let res = systemVariable.mca_name;
        let value;
        value = systemVariable;
        updatedContent = updatedContent.replace(
          new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
          value
        );

        // Mark as confirmed
        setConfirmedFields((prevState) => ({
          ...prevState,
          [placeholder]: true,
        }));

        // const value = systemVariable.mca_name; // System variable value
      } else {
        // Initialize inputFields for non-system placeholders
        fields[placeholder] = inputFields[placeholder] || ""; // Preserve or initialize
      }
    }

    setInputFields(fields);
    return updatedContent;
  };

  // Update editorContent whenever rows or input content changes
  useEffect(() => {
    if (rows.length > 0 && editorContent) {
      const updatedContent = processPlaceholders(editorContent);
      setEditorContent(updatedContent);
    }
  }, [rows, editorContent]);

  const handleEditorChange = (content) => {
    const updatedContent = processPlaceholders(content);
    setEditorContent(updatedContent);
  };
  const fetchMeetData = async (id) => {
    try {
      let url;
      if (page == "committee") {
        url = `${apiURL}/committee-meeting`;
      } else if (page == "shareholder") {
        url = `${apiURL}/shareholder-meeting`;
      } else {
        url = `${apiURL}/meeting`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setMeetData(data.results);
      const specificMeetInfo = data.results.find((item) => item.id === id);

      if (specificMeetInfo) {
        console.log(specificMeetInfo, "Filtered meetInfo");
        setMeetInfo(specificMeetInfo);
        setClientInfo(specificMeetInfo.client_name);

        setParticipants(specificMeetInfo.participants);
        // setRefresh(!refresh)
        handleFileLoad(fileUrl, specificMeetInfo);
        console.log(specificMeetInfo, "specific-data");
      } else {
        console.warn("No match found for the specified id.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // Load file content and process placeholders
  const handleFileLoad = async (url, specificMeetInfo) => {
    try {
      const updatedHtmlString = url.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      console.log(meetInfo, clientInfo, "venue dhund");
      let venue;
      if (
        specificMeetInfo?.variables?.venue ==
        specificMeetInfo?.client_name?.registered_address
      ) {
        venue = `THE REGISTERED OFFICE OF THE COMPANY AT ${specificMeetInfo?.client_name?.registered_address}`;
      } else {
        venue = `${specificMeetInfo?.variables?.venue}`;
      }
      const tableHTML = `<br/>
      <table class="table table-bordered table-hover Master-table" style="width: 100%; border-collapse: collapse;">
        <thead class="Master-Thead">
          <tr>
            <th>Director</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${specificMeetInfo?.participants
            ?.map(
              (participant, index) => `
            <tr key="${index}">
              <td>${participant?.director?.name || "Unknown"}</td>
              <td>${participant?.isPresent ? "" : "Absent"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
<br/>
<br/>
<h5>Authenticated by</h5><p></p>


<h6>Name: \${name}</h6>
<h6>Chairperson</h6>
<h6> DIN: \${din_pan}</h6>
`;

      setEditorContent(updatedHtmlString + venue + tableHTML);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };

  useEffect(() => {
    fetchMeetData(id);
    console.log(meetInfo, clientInfo, "venue");
  }, [id, fileUrl, refresh]);

  const autofillPlaceholders = () => {
    // Replace placeholders for non-system variables
    const updatedContent = editorContent.replace(
      /(?:\$\{([a-zA-Z0-9_]+)\})|(?:\#\{([a-zA-Z0-9_]+)\})/g,
      (match, p1, p2) => {
        const placeholder = p1 || p2;
        // console.log(confirmedFields,"cnfrm",placeholder,"placehol",value)
        // Skip already confirmed/system variables
        if (confirmedFields[placeholder]) return match;

        const value = inputFields[placeholder] || placeholder; // Use user-provided value or keep placeholder
        setConfirmedFields((prevState) => ({
          ...prevState,
          [placeholder]: true,
        }));
        setPlaceVar((prevData) => ({
          ...prevData, // Spread the existing state
          [placeholder]: value, // Add the new key-value pair
        }));
        return value;
      }
    );

    setEditorContent(updatedContent);
  };

  const handleConfirm = (placeholder) => {
    const value = inputFields[placeholder] || placeholder;
    const updatedContent = editorContent.replace(
      new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
      value
    );
    setEditorContent(updatedContent);
    setConfirmedFields((prevState) => ({
      ...prevState,
      [placeholder]: true,
    }));
  };

  const handleInputChange = (placeholder, value) => {
    // Prevent editing of system variables
    if (confirmedFields[placeholder]) return;

    setInputFields((prevState) => ({
      ...prevState,
      [placeholder]: value,
    }));
  };

  const resolOptions = resolutionList.map((resol) => ({
    value: resol.templateName,
    label: resol.templateName,
  }));
  const saveDocument = async () => {
    setButtonLoading(true);

    const docxBlob = htmlDocx.asBlob(editorContent);

    const formData = new FormData();
    formData.append("htmlcontent", editorContent);
    formData.append("attendance_file", docxBlob);
    try {
      let url;
      let redirectedUrl;
      if (page === "committee") {
        url = `${apiURL}/committee-meeting/${id}`;
        redirectedUrl = `/committee-documents/${id}?tab=attendance`;
      } else if (page === "shareholder") {
        url = `${apiURL}/shareholder-meeting/${id}`;
        redirectedUrl = `/shareholder-documents/${id}?tab=attendance`;
      } else {
        url = `${apiURL}/meeting/${id}`;
        redirectedUrl = `/documents/${id}?tab=attendance`;
      }
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate(redirectedUrl);
      } else {
        toast.error("Failed to save the document.");
      }
    } catch (error) {
      toast.error("Error occurred while saving the document.");
    } finally {
      setButtonLoading(false);
    }
  };
  const hasUnconfirmedPlaceholders = Object.keys(inputFields).some(
    (placeholder) => !confirmedFields[placeholder]
  );
  const config = {
    style: {
      padding: "20px",
    },
    toolbarSticky: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "paragraph",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "table",
      "link",
      "fullsize",
    ],
    removeButtons: [
      "source",
      "image",
      "video",
      "print",
      "spellcheck",
      "speechRecognize",
      "about",
      "undo",
      "redo",
      "showAll",
      "file",

      "ai-assistant",
      "ai-commands",
      "preview",
      "dots",
    ],
    extraButtons: [],
    uploader: { insertImageAsBase64URI: false },
    showXPathInStatusbar: false,
  };

  return (
    <Container className="mt-5">
      <h1>Attendance Document</h1>
      <div className="parentContainer">
        <div className="leftContainer">
          <JoditEditor
            ref={editor}
            config={config}
            value={editorContent}
            onChange={(newContent) => {
              setEditorContent(newContent);
            }}
          />
        </div>
        <div className="rightContainer">
          <div>
            <h3>Detected Placeholders:</h3>
            {Object.keys(inputFields).length > 0 ? (
              Object.keys(inputFields).map((placeholder) => {
                const pascalCasePlaceholder = placeholder
                  .replace(/_/g, " ")
                  .replace(
                    /\w\S*/g,
                    (txt) =>
                      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );

                return (
                  <div key={placeholder}>
                    <td>
                      <label>{pascalCasePlaceholder} :</label>
                    </td>
                    <> </>
                    <input
                      className="mt-1 mb-2"
                      type="text"
                      value={inputFields[placeholder]}
                      onChange={(e) =>
                        handleInputChange(placeholder, e.target.value)
                      }
                      disabled={confirmedFields[placeholder]}
                    />
                  </div>
                );
              })
            ) : (
              <p>All placeholders are filled</p>
            )}
          </div>
          <div className="mt-4">
            <Button onClick={autofillPlaceholders}>
              Autofill Placeholders
            </Button>
          </div>

          <div className="mt-4">
            <Button
              onClick={saveDocument}
              disabled={hasUnconfirmedPlaceholders}
            >
              {buttonLoading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Save Attendance"
              )}
            </Button>
            {hasUnconfirmedPlaceholders && (
              <p style={{ color: "red" }}>
                Some placeholders are unconfirmed. Please confirm all before
                saving.
              </p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default AttendanceEditor;
