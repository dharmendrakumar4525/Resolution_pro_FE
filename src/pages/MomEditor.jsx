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

const MomEditor = () => {
  const [rows, setRows] = useState([]);
  const [variable, setVariable] = useState({});
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

  const [buttonLoading, setButtonLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
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
          setMeetInfo(specificMeetInfo); // Set the filtered object
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

  // Load file content and process placeholders
  const handleFileLoad = async (url) => {
    try {
      console.log(url, "url-124");
      const updatedHtmlString = url.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      // setInitializedContent(updatedHtmlString);
      setEditorContent(updatedHtmlString);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };
  // useEffect(() => {
  //   const handleMultipleFilesAddOn = async (urls) => {
  //     try {
  //       // Add title at the top
  //       const title = urls?.[0]?.title || "Untitled";
  //       let combinedContent = `<>${title}</>\n`;

  //       // Fetch and process files concurrently
  //       console.log(urls, "mk");
  //       const fetchPromises = urls.map(async (url) => {
  //         const processedContent = [];

  //         if (url?.templateFile) {
  //           console.log("Processing templateFile:", url.templateFile);
  //           const response = await fetch(url.templateFile);
  //           if (!response.ok) {
  //             throw new Error(`Failed to fetch file from: ${url.templateFile}`);
  //           }
  //           const arrayBuffer = await response.arrayBuffer();
  //           const result = await mammoth.convertToHtml({ arrayBuffer });
  //           processedContent.push(`${result.value}`);
  //         } else {
  //           console.warn(
  //             "Skipped processing due to missing templateFile:",
  //             url
  //           );
  //         }

  //         if (url?.resolutionFile) {
  //           console.log("Processing resolutionFile:", url.resolutionFile);
  //           const response = await fetch(url.resolutionFile);
  //           if (!response.ok) {
  //             throw new Error(
  //               `Failed to fetch file from: ${url.resolutionFile}`
  //             );
  //           }
  //           const arrayBuffer = await response.arrayBuffer();
  //           const result = await mammoth.convertToHtml({ arrayBuffer });
  //           processedContent.push(`</br>${result.value}`);
  //         } else {
  //           console.warn(
  //             "Skipped processing due to missing resolutionFile:",
  //             url
  //           );
  //         }

  //         return processedContent.join("\n");
  //       });

  //       const results = await Promise.all(fetchPromises);
  //       combinedContent += results.join("\n");
  //       setEditorContent(initializedContent + combinedContent);
  //     } catch (error) {
  //       console.error("Error fetching or converting one or more files:", error);
  //     }
  //   };

  //   handleMultipleFilesAddOn(selectedData);
  //   processPlaceholders(selectedData);
  // }, [selectedData]);

  useEffect(() => {
    setTimeout(() => {
      if (fileUrl) handleFileLoad(fileUrl);
    }, 1000);
  }, [fileUrl]);

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
    formData.append("mom_file", docxBlob);
    try {
      let url;
      let redirectedUrl;
      if (page === "committee") {
        url = `${apiURL}/committee-meeting/${id}`;
        redirectedUrl = `/committee-documents/${id}?tab=mom`;
      } else if (page === "shareholder") {
        url = `${apiURL}/shareholder-meeting/${id}`;
        redirectedUrl = `/shareholder-documents/${id}?tab=mom`;
      } else {
        url = `${apiURL}/meeting/${id}`;
        redirectedUrl = `/documents/${id}?tab=mom`;
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
      <h1>Mom Document</h1>
      <div className="parentContainer">
        <div className="leftContainer">
          <JoditEditor
            ref={editor}
            //config={config}
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
                "Save Mom"
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

export default MomEditor;
