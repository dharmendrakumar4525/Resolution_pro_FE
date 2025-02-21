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
import { apiURL } from "../../../API/api";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styling/templateEditor.css";
import JoditEditor from "jodit-react";
import htmlDocx from "html-docx-js/dist/html-docx";

import Select from "react-select";

export default function DIREditor() {
  const [rows, setRows] = useState([]);
  const [resolutionList, setResolutionList] = useState([]);
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
  const location = useLocation();
  const { id } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [prevCSR, setPrevCSR] = useState([]);

  const token = localStorage.getItem("refreshToken");
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const circularData = location?.state?.circular || "";
  const editor = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        let url = `${apiURL}/director-docs/${id}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data, "saved-cs");
        setVariable(data?.DIR_doc?.variables || {});
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
  }, [token]);

  // Helper function to process placeholders
  const processPlaceholders = (content) => {
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
        console.log("content-out-match-fix", match);

        if (variable !== {}) {
          const filledVariable = variable[placeholder2];

          xValues = filledVariable;
        }
        // Check if it's a system variable
        console.log(rows, "rows");
        const systemVariable = rows?.find((row) => row?.name === placeholder);
        console.log("content-out-match-fix-var", systemVariable);
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
      console.log(editorContent, "eddy");
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
      setInitializedContent(url);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };
  useEffect(() => {
    handleFileLoad(fileUrl);
  }, []);

  useEffect(() => {
    processPlaceholders(editorContent);
  }, [selectedData, prevCSR, initializedContent]);

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

  const saveDocument = async () => {
    setButtonLoading(true);
    const docxBlob = htmlDocx.asBlob(editorContent);

    const formData = new FormData();
    formData.append("DIR_file", docxBlob);
    formData.append("DIR_doc[filehtml]", editorContent);
    if (placeVar && Object.keys(placeVar).length > 0) {
      formData.append("DIR_doc[variables]", JSON.stringify(placeVar));
    }
    let url = `${apiURL}/director-docs/${id}`;
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
        navigate(-1);
      } else {
        console.log("Failed to save the document.");
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
  useEffect(() => {
    setEditorContent(`<h1 style="text-align:center">FORM 'DIR-8'</h1>
    <div style="text-align: center;">
    <u>Intimation by Director</u>
</div>

    <p style="text-align:center"><strong>[Pursuant to Section 164(1) and Section 164(2) and rule 14(1) of Companies (Appointment and Qualification of Directors) Rules, 2014]</strong></p>

    <p><strong>Registration No. of Company:</strong> U40103KA2010PTC053912</p>
    <p><strong>Nominal Capital:</strong> Rs. 54,10,78,150</p>
    <p><strong>Paid-up Capital:</strong> Rs. 53,74,15,900</p>

    <p><strong>Name of Company:</strong> Surya Energy Photo Voltaic India Private Limited</p>
    <p><strong>Address of its Registered Office:</strong> Tower A, 3rd Floor, The Millenia, No. 1 & 2 Murphy Road, Ulsoor Bangalore 560008 Karnataka, INDIA</p>

    <p><strong>To,</strong></p>
    <p>The Board of Directors of SURYA ENERGY PHOTO VOLTAIC INDIA PRIVATE LIMITED</p>

    <p>I, <strong>Thomas T. Karimpanal</strong>, son of Mr. Karimpanal Sebastian Thomas, resident of House No. 7 Amber Gardens #02-15, Singapore-439974, Director, in the Company hereby give notice that I am/was a director in the following companies during the last three years:</p>

    <table>
        <tr>
            <th>No.</th>
            <th>Name of the Company</th>
            <th>Date of Appointment</th>
            <th>Date of Cessation</th>
        </tr>
        <tr>
            <td>1</td>
            <td>Aerosite Energy Private Limited</td>
            <td>02/11/2017</td>
            <td>22/07/2022</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3"><strong>Director</strong> (26/09/2018 - Present)</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Sun Photo Voltaic Energy India Private Limited</td>
            <td>02/11/2017</td>
            <td>-</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3"><strong>Director</strong> (28/09/2018 - Present)</td>
        </tr>
        <tr>
            <td>3</td>
            <td>Tuppadahalli Energy India Private Limited</td>
            <td>02/11/2017</td>
            <td>-</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3"><strong>Director</strong> (26/09/2018 - Present)</td>
        </tr>
        <tr>
            <td>4</td>
            <td>Acciona Wind Energy Private Limited</td>
            <td>02/11/2017</td>
            <td>-</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3"><strong>Director</strong> (28/09/2018 - Present)</td>
        </tr>
        <tr>
            <td>5</td>
            <td>Fujin Power Private Limited</td>
            <td>02/11/2017</td>
            <td>22/07/2022</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3"><strong>Director</strong> (26/09/2018 - Present)</td>
        </tr>
    </table>

    <p>I further confirm that I have not incurred disqualification under section 164(1) and section 164(2) of the Companies Act, 2013 in any of the above companies, in the previous financial year, and that I, at present, stand free from any disqualification from being a director.</p>

    
    <p><strong>Place:</strong> Madrid</p>
    <p><strong>Signature:</strong> ______________</p>
    <p><strong>Date:</strong> 31-Mar-2024</p>
    <p><strong>Name:</strong> Thomas T. Karimpanal</p>
    <p><strong>DIN:</strong> 07974134</p>

    <h3>Instructions for Filling Form DIR-8</h3>
    <ul>
        <li>First table should include details of all Indian companies where the Director was/is a director in the past three years.</li>
        <li>If more companies exist, increase the number of rows.</li>
        <li>If the Director was not a director in any company in the past three years, mention "NIL".</li>
        <li>Second table should list companies where the Director has been disqualified in the past three years.</li>
        <li>If the Director has no disqualifications, leave the table blank or fill as "NOT APPLICABLE".</li>
    </ul>`);
  }, []);

  return (
    <Container className="mt-5">
      <h1>DIR Form</h1>
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
