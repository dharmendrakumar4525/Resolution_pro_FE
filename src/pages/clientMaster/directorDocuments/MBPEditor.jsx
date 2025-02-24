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

export default function MBPEditor() {
  const [rows, setRows] = useState([]);
  const [resolutionList, setResolutionList] = useState([]);
  const [variable, setVariable] = useState([]);
  const [previousSelectedOptions, setPrevoiusSelectedOptions] = useState([]);
  const [clientInfo, setClientInfo] = useState([]);
  const [directorInfo, setDirectorInfo] = useState([]);
  const [dirRelatedParty, setDirRelatedParty] = useState([]);
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
        // console.log(data, "saved-cs");
        setVariable(data?.MBP_doc?.variables || {});
        setDirectorInfo(data?.director_id);
        setDirRelatedParty(data?.related_parties);
        setClientInfo(data?.director_id?.company_id);
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
        // console.log(rows, "rows");
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
    formData.append("MBP_file", docxBlob);
    formData.append("MBP_doc[filehtml]", editorContent);
    if (placeVar && Object.keys(placeVar).length > 0) {
      formData.append("MBP_doc[variables]", JSON.stringify(placeVar));
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
    const formatDate = (isoDate) => {
      return new Date(isoDate).toLocaleDateString("en-GB");
    };
    const tableRows = dirRelatedParty
      ?.map(
        (party, index) => `
    <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: left;">${
          index + 1
        }</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: left;">${
          party?.related_party_name
        }</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: left;">${
          party?.nature_of_interest
        }</td>
        
        <td style="border: 1px solid #000; padding: 8px; text-align: left;">${
          party?.shareholding_percentage
        }</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: left;">${formatDate(
          party?.date_of_interest_changed_resigned_or_cessation
        )}</td>
    </tr>

`
      )
      .join("");
    setTimeout(() => {
      document.getElementById("table-body").innerHTML = tableRows;
    }, 1000);
    console.log(tableRows, "madd");
  }, [dirRelatedParty]);
  function getFinancialYearStartDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const financialYearStart = month < 4 ? year - 1 : year;

    return new Date(financialYearStart, 3, 1).toLocaleDateString("en-GB"); // 01/04/YYYY format
  }
  // console.log(clientInfo, "saved", dirRelatedParty);
  useEffect(() => {
    setEditorContent(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Form MBP-1</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
        <h2 style="text-align: center; text-decoration: underline;">FORM MBP - 1</h2>
        <h3 style="text-align: center;">Notice of Interest by Director</h3>
        <p style="text-align: center; font-style: italic;">[Pursuant to section 184 (1) and rule 9(1)]</p>
        
        <p>To</p>
        <p><strong>The Board of Directors</strong><br>
        ${clientInfo?.company_name}</p>
        
        <p>Dear Sir(s),</p>
        
        <p>I, <strong>${directorInfo?.name}</strong>, son/daughter of ${
      directorInfo?.fathers_mothers_spouse_name
    }, resident of <strong>${
      directorInfo?.present_address
    } </strong>, being a Director in the Company hereby give notice of my interest or concern in the following company or companies, bodies corporate, firms or other association of individuals:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">No.</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Names of the Companies / Bodies Corporate / Firms / Associations of Individuals</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nature of Interest or Concern / Change in Interest or Concern</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Shareholding</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Date on Which Interest or Concern Arose / Changed</th>
            </tr>
           
           
            <tbody id="table-body"></tbody>
           
        </table>
        
        <p><strong>Place:</strong>${clientInfo?.registered_address}</p>
        <p><strong>Date:</strong> ${getFinancialYearStartDate()}</p>
        <p><strong>Signature:</strong> ______________</p>
        <p><strong>Name:</strong> ${directorInfo?.name}</p>
        <p><strong>Director</strong></p>
        <p><strong>DIN:</strong>${directorInfo && directorInfo["din/pan"]}</p>
        
        <hr style="margin: 30px 0;">
        
        <h3>Instructions for Filling Form MBP-1</h3>
        <ul>
            <li>Tabular column should be filled with details (Company Name, Address, and Nature of Interest) of all Indian as well as foreign companies/firms/proprietorships in which the director/relative is having an interest.</li>
            <li>The term "interest or concern" includes:
                <ul>
                    <li>Companies in which the director/relative is a Director.</li>
                    <li>Companies in which the director is a shareholder holding more than 2% of the paid-up share capital.</li>
                    <li>Firms in which the director/relative is a partner.</li>
                    <li>Proprietorships owned by the director/relative.</li>
                </ul>
            </li>
            <li>If the number of companies/firms/proprietorships exceeds the provided rows, additional rows should be added.</li>
            <li>If the director has no interests, mention “NIL” in the table.</li>
        </ul>
    </body>
    </html>
    `);
  }, [clientInfo]);

  return (
    <Container className="mt-5">
      <h1>MBP Form</h1>
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
