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

const NoticeEditor = () => {
  const [rows, setRows] = useState([]);
  const [variable, setVariable] = useState({});
  const [resolutionList, setResolutionList] = useState([]);
  const [clientInfo, setClientInfo] = useState([]);
  const [meetInfo, setMeetInfo] = useState([]);
  const [dynamicResolution, setDynamicResolution] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [placeVar, setPlaceVar] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const [editorContent, setEditorContent] = useState(""); // CKEditor content
  const [initializedContent, setInitializedContent] = useState(""); // CKEditor content
  const [inputFields, setInputFields] = useState({}); // Placeholder values
  const [confirmedFields, setConfirmedFields] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  const [titleToggle, setTitleToggle] = useState(false);

  const location = useLocation();
  const { id } = useParams();
  const token = localStorage.getItem("refreshToken");
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const page = location.state?.page || "";
  const editor = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMeetData = async (id) => {
      try {
        let url;
        if (page === "committee") {
          url = `${apiURL}/committee-meeting`;
        } else if (page === "shareholder") {
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
          setDynamicResolution(specificMeetInfo.resolutions);
        } else {
          console.warn("No match found for the specified id.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMeetData(id);
  }, [id, token]);
  useEffect(() => {
    const fetchData = async (clientID) => {
      try {
        const response = await fetch(
          `${apiURL}/customer-maintenance/${clientID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        setClientInfo(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(meetInfo.client_name?.id);
  }, [meetInfo.client_name?.id, token]);
  console.log(meetInfo, "meetInfo");
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
        if (page === "committee") {
          url = `${apiURL}/committee-meeting/${id}`;
        } else if (page === "shareholder") {
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

        setVariable(data?.variables);
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
      if (placeholder == "today_date") {
        function getCurrentDate() {
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          const yyyy = today.getFullYear();

          return `${dd}/${mm}/${yyyy}`;
        }

        updatedContent = updatedContent.replace(
          new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
          getCurrentDate()
        );

        // Mark as confirmed
        setConfirmedFields((prevState) => ({
          ...prevState,
          [placeholder]: true,
        }));
      }
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

  // Load file content and process placeholders
  const handleFileLoad = async (url) => {
    try {
      const updatedHtmlString = url.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      setInitializedContent(updatedHtmlString);
      setTitleToggle(!titleToggle);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };
  useEffect(() => {
    handleFileLoad(fileUrl);
  }, [fileUrl]);
  useEffect(() => {
    const handleMultipleFilesAddOn = async (dynamicResolution) => {
      try {
        let count = 5;
        const fetchPromises = await dynamicResolution.map(async (url) => {
          if (url?.templateName) {
            const content = `<p>${count}. ${url.templateName}</p>`;
            count++;
            return content;
          } else {
            console.warn(
              "Skipped processing due to missing templateFile:",
              url
            );
          }

          return "";
        });
        const results = await Promise.all(fetchPromises);
        const combinedContent = results.join("");
        let footerContent = `<br/><p>Kindly make it convenient to attend the meeting.Please do confirm us by phone/fax/email, in case of your inability to attend.</p>
<br/><p>For #{company_name}</p><p></p>

<p>Name: \${name}</p>
<p> Director</p>
<p> DIN: \${din_pan}</p>
`;

        console.log(initializedContent, "hjkl");
        setEditorContent(initializedContent + combinedContent + footerContent);
      } catch (error) {
        console.error("Error combining content:", error);
      }
    };
    // processPlaceholders(dynamicResolution);

    handleMultipleFilesAddOn(dynamicResolution);

    console.log("useEffect=ret");
  }, [initializedContent, dynamicResolution]);

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
  const previousPath = location.state?.from; // Get the previous path
  console.log(previousPath, "previous");
  const saveDocument = async () => {
    setButtonLoading(true);
    console.log(editorContent);
    const docxBlob = htmlDocx.asBlob(editorContent);

    const formData = new FormData();
    formData.append("notes_file", docxBlob);
    formData.append("htmlcontent", editorContent);

    try {
      let url;
      let redirectedUrl;
      if (page === "committee") {
        url = `${apiURL}/committee-meeting/${id}`;
        redirectedUrl = `/committee-documents/${id}?tab=notice`;
      } else if (page === "shareholder") {
        url = `${apiURL}/shareholder-meeting/${id}`;
        redirectedUrl = `/shareholder-documents/${id}?tab=notice`;
      } else {
        url = `${apiURL}/meeting/${id}`;
        redirectedUrl = `/documents/${id}?tab=notice`;
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

  return (
    <Container className="mt-5">
      <h1>Notice Document</h1>
      {/* <Button onClick={handleFileAddOn}>Add On</Button>
      <Button onClick={handleFileRemoveOn}>Remove On</Button> */}
      <div className="parentContainer">
        <div className="leftContainer">
          <JoditEditor
            ref={editor}
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
                  <tbody key={placeholder}>
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
                  </tbody>
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
                "Save Notice"
              )}
            </Button>
            {hasUnconfirmedPlaceholders && (
              <p style={{ color: "red" }}>
                Some placeholders are unconfirmed. Please confirm all before
                saving.
              </p>
            )}
          </div>
          <Button
            className="mt-4"
            variant="danger"
            onClick={() => navigate(-1)}
          >
            Exit without Saving
          </Button>
        </div>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default NoticeEditor;
