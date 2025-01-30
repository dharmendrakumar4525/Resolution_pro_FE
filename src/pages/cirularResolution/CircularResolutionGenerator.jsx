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
import { apiURL } from "../../API/api";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styling/templateEditor.css";
import JoditEditor from "jodit-react";
import htmlDocx from "html-docx-js/dist/html-docx";

import Select from "react-select";

export default function CircularResolution() {
  const [rows, setRows] = useState([]);
  const [resolutionList, setResolutionList] = useState([]);
  const [xresolution, setXResolutions] = useState({});
  const [variable, setVariable] = useState([]);
  const [previousSelectedOptions, setPrevoiusSelectedOptions] = useState([]);
  const [clientInfo, setClientInfo] = useState([]);
  const [meetInfo, setMeetInfo] = useState({});
  const [previousMeet, setPreviousMeet] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [placeVar, setPlaceVar] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [editorContent, setEditorContent] = useState(""); // CKEditor content
  const [initializedContent, setInitializedContent] = useState(""); // CKEditor content
  const [inputFields, setInputFields] = useState({}); // Placeholder values
  const [confirmedFields, setConfirmedFields] = useState({});
  const [agendaId, setAgendaId] = useState();
  const location = useLocation();
  const { id } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [circleResolution, setCircleResolution] = useState([]);
  const [prevCSR, setPrevCSR] = useState([]);

  const token = localStorage.getItem("refreshToken");
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const page = location?.state?.page || "";
  const circularData = location?.state?.circular || "";
  const editor = useRef(null);

  console.log(page, "123345");
  console.log(circularData, "Kontent");
  console.log(location, "locate");
  const navigate = useNavigate();
  useEffect(() => {
    setClientInfo(circularData?.client_name);
  }, [circularData]);

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
    const fetchVariables = async () => {
      try {
        let url = `${apiURL}/circular-resolution/${id}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data, "saved-cs");
        setXResolutions(data?.agenda);
        setVariable(data?.variables);
        setAgendaId(data?.agenda?.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchDefinedVariables = async () => {
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

    fetchDefinedVariables();
    fetchVariables();

    fetchData();
  }, [token]);

  // Helper function to process placeholders
  const processPlaceholders = (content) => {
    console.log("content-out", content, meetInfo);
    if (content) {
      const regex = /(?:\$\{([a-zA-Z0-9_]+)\})|(?:\#\{([a-zA-Z0-9_]+)\})/g;
      let match;
      let updatedContent = content;
      const fields = {};
      let xValues;
      while ((match = regex.exec(content)) !== null) {
        console.log("content-out-match", match);

        const placeholder = match[2];
        const placeholder2 = match[1] || match[2];

        if (variable !== {}) {
          const filledVariable = variable[placeholder2];

          xValues = filledVariable;
        }
        // Check if it's a system variable
        const systemVariable = rows?.find((row) => row?.name === placeholder);
        if (systemVariable) {
          console.log(systemVariable, "system-var");
          let res = systemVariable.mca_name;

          let formulaRes = systemVariable.formula;
          let value;
          function getOrdinalSuffix(number) {
            const suffixes = ["TH", "ST", "ND", "RD"];
            const value = number % 100;
            return (
              number +
              (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
            );
          }
          if (res == "current_year") {
            function getCurrentFinancialYear() {
              const today = new Date();
              const year = today.getFullYear();

              if (today.getMonth() + 1 >= 4) {
                return `${year}-${year + 1}`;
              } else {
                return `${year - 1}-${year}`;
              }
            }

            let result = getCurrentFinancialYear();
            value = result;
            updatedContent = updatedContent.replace(
              new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
              value
            );

            // Mark as confirmed
            setConfirmedFields((prevState) => ({
              ...prevState,
              [placeholder]: true,
            }));
            setPlaceVar((prevData) => ({
              ...prevData, // Spread the existing state
              [systemVariable.name]: value, // Add the new key-value pair
            }));
          } else if (res == "date") {
            function getFormattedDate(dateString) {
              const dateObj = new Date(dateString);

              const day = dateObj.toLocaleDateString("en-US", {
                weekday: "long",
              });
              const month = dateObj.toLocaleDateString("en-US", {
                month: "long",
              });
              const date = dateObj.getDate();
              const year = dateObj.getFullYear();

              return `${day}, ${month} ${getOrdinalSuffix(date)} ${year}`;
            }

            let result = getFormattedDate(meetInfo[res]);
            value = result;
            updatedContent = updatedContent.replace(
              new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
              value
            );
            setConfirmedFields((prevState) => ({
              ...prevState,
              [placeholder]: true,
            }));
            setPlaceVar((prevData) => ({
              ...prevData, // Spread the existing state
              [systemVariable.name]: value, // Add the new key-value pair
            }));
          } else if (res in clientInfo) {
            console.log(clientInfo, "clientid");
            value = clientInfo[res];
            updatedContent = updatedContent.replace(
              new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
              value
            );

            // Mark as confirmed
            setConfirmedFields((prevState) => ({
              ...prevState,
              [placeholder]: true,
            }));
            setPlaceVar((prevData) => ({
              ...prevData, // Spread the existing state
              [systemVariable.name]: value, // Add the new key-value pair
            }));
          } else if (res in meetInfo) {
            value = meetInfo[res];
            updatedContent = updatedContent.replace(
              new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
              value
            );

            // Mark as confirmed
            setConfirmedFields((prevState) => ({
              ...prevState,
              [placeholder]: true,
            }));
            setPlaceVar((prevData) => ({
              ...prevData, // Spread the existing state
              [systemVariable.name]: value, // Add the new key-value pair
            }));
          } else {
            fields[placeholder] = inputFields[placeholder] || ""; // Preserve or initialize
          }
          // const value = systemVariable.mca_name; // System variable value
        } else {
          if (variable !== {}) {
            fields[placeholder2] = xValues || "";
          } else {
            console.log("Y");
            fields[placeholder2] = inputFields[placeholder2] || ""; // Preserve or initialize
          }
          // Initialize inputFields for non-system placeholders
        }
      }

      setInputFields(fields);

      return updatedContent;
    }
  };

  // Update editorContent whenever rows or input content changes
  useEffect(() => {
    if (rows.length > 0 && editorContent) {
      const updatedContent = processPlaceholders(editorContent);
      setEditorContent(updatedContent);
    }
  }, [rows]);

  const handleEditorChange = (content) => {
    const updatedContent = processPlaceholders(content);
    setEditorContent(updatedContent);
  };

  // Load file content and process placeholders
  const handleFileLoad = async (url) => {
    try {
      setInitializedContent(url);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };
  useEffect(() => {
    handleFileLoad(fileUrl);
  }, []);
  const handleMultipleFilesAddOn = async (url) => {
    try {
      let combinedContent = "";
      if (url) {
        if (url?.title) {
          const title = url?.title || "Untitled";
          combinedContent += `<br/><p>${title}</p>\n`;
        }

        if (url?.templateFile) {
          combinedContent += `<br/><div>${url?.templateFile}</div>\n`;
        } else {
          console.warn("Skipped processing due to missing templateFile:", url);
        }

        // Add resolution file content if available
        if (url?.resolutionFile) {
          combinedContent += `<br/><div>${url?.resolutionFile}</div>`;
        } else {
          console.warn(
            "Skipped processing due to missing resolutionFile:",
            url
          );
        }
      }

      if (initializedContent) {
        console.log(initializedContent, "inik");
        setEditorContent((initializedContent || "") + (combinedContent || ""));
      }

      console.log(editorContent, "ikea");
    } catch (error) {
      console.error("Error fetching or converting one or more files:", error);
    }
  };
  console.log(selectedData, "dattt");
  useEffect(() => {
    handleMultipleFilesAddOn(selectedData);
    processPlaceholders(editorContent);
  }, [selectedData, prevCSR, xresolution]);

  const autofillPlaceholders = () => {
    // Check if all placeholders have values
    const hasEmptyFields = Object.keys(inputFields).some(
      (key) => !inputFields[key]?.trim()
    );

    if (hasEmptyFields) {
      // Show a toast notification for empty fields
      toast.error("Please fill all required fields.");
      return; // Stop execution
    }

    // Replace placeholders for non-system variables
    const updatedContent = editorContent.replace(
      /(?:\$\{([a-zA-Z0-9_]+)\})|(?:\#\{([a-zA-Z0-9_]+)\})/g,
      (match, p1, p2) => {
        const placeholder = p1 || p2;

        // Skip already confirmed/system variables
        if (confirmedFields[placeholder]) return match;

        const value = inputFields[placeholder]; // Use user-provided value

        // Confirm field and update state
        setConfirmedFields((prevState) => ({
          ...prevState,
          [placeholder]: true,
        }));

        setPlaceVar((prevData) => ({
          ...prevData,
          [placeholder]: value,
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

  useEffect(() => {
    if (!xresolution || !resolutionList?.length) return;

    // Find the matching agenda from resolutionList based on xresolution.templateName
    const agenda = resolutionList.find(
      (item) => item.templateName == xresolution.templateName
    );
    // Construct the selected agenda
    const selectedAgenda = {
      title: agenda?.title || "",
      templateFile: agenda?.fileName || "",
      resolutionFile: agenda?.resolutionUrl || "",
    };

    // Find the matching resolution for the dropdown options
    const match = resolutionList.find((option) => option.id === xresolution.id);

    // Prepare the new dropdown option
    const newSelect = match
      ? [
          {
            label: match.templateName,
            value: match.templateName,
          },
        ]
      : [];

    // Filter the options for previously selected resolutions
    const selectedResolOptions = resolutionList
      .map((res) => {
        const matchLabels = resolOptions.find(
          (option) => option.label === res.title
        );
        return matchLabels || null;
      })
      .filter(Boolean);
    console.log(selectedAgenda, "mukul");
    // Update state with a slight delay (if needed)
    setTimeout(() => {
      setSelectedData(selectedAgenda);
      setPrevoiusSelectedOptions(newSelect);
    }, 2000);
  }, [resolutionList?.length, xresolution]);
  console.log(selectedData, "selected");
  const resolOptions = resolutionList?.map((resol) => ({
    value: resol?.templateName,
    label: resol?.templateName,
  }));
  console.log(placeVar, "place");

  const saveDocument = async () => {
    setButtonLoading(true);
    const docxBlob = htmlDocx.asBlob(editorContent);

    const formData = new FormData();

    formData.append("file", docxBlob);
    formData.append("htmlcontent", editorContent);
    formData.append("agenda", agendaId);
    if (placeVar && Object.keys(placeVar).length > 0) {
      formData.append("variables", JSON.stringify(placeVar));
    }
    let url = `${apiURL}/circular-resolution/${id}`;
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success("Document saved successfully");
        navigate("/circular-resolution");
      } else {
        console.log("Failed to save the document.");
      }
    } catch (error) {
      toast.error("Error occurred while saving the document.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleAgendaItemChange = (selectedOption) => {
    console.log(selectedOption, "resol-lis");
    const agenda = selectedOption
      ? resolutionList.find(
          (item) => item.templateName === selectedOption.value
        )
      : null;

    if (agenda) {
      setAgendaId(agenda?.id);
    }
    const selectedAgenda = agenda
      ? {
          title: agenda.title || "",
          templateFile: agenda.fileName || "",
          resolutionFile: agenda.resolutionUrl || "",
        }
      : {};

    console.log("Selected Agenda", selectedAgenda);

    setSelectedData(selectedAgenda);
    setPrevoiusSelectedOptions(selectedOption || null);
  };

  const hasUnconfirmedPlaceholders = Object.keys(inputFields).some(
    (placeholder) => !confirmedFields[placeholder]
  );
  console.log(variable, "variable");
  return (
    <Container className="mt-5">
      <h1>Circular Resolution Generator</h1>
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
            <Form.Group controlId="agendaItems" className="mb-5">
              <Select
                options={resolOptions}
                placeholder="Select Agenda Documents"
                value={previousSelectedOptions}
                onChange={handleAgendaItemChange}
                isClearable
              />
            </Form.Group>

            <h3>Detected Placeholders:</h3>
            {Object.keys(inputFields)?.length > 0 ? (
              Object.keys(inputFields)?.map((placeholder) => {
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
              variant="secondary"
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
                "Save Meeting Document"
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
}
