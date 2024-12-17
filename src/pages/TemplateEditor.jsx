import React, { useState, useEffect } from "react";
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
import Select from "react-select";

const DocumentEditor = () => {
  const [rows, setRows] = useState([]);
  const [resolutionList, setResolutionList] = useState([]);
  const [xresolution, setXResolutions] = useState([]);
  const [variable, setVariable] = useState([]);
  const [previousSelectedOptions, setPrevoiusSelectedOptions] = useState([]);
  const [clientInfo, setClientInfo] = useState([]);
  const [meetInfo, setMeetInfo] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [placeVar, setPlaceVar] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [editorContent, setEditorContent] = useState(""); // CKEditor content
  const [initializedContent, setInitializedContent] = useState(""); // CKEditor content
  const [inputFields, setInputFields] = useState({}); // Placeholder values
  const [confirmedFields, setConfirmedFields] = useState({}); // Confirmed placeholders
  const location = useLocation();
  const { id } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);

  const token = localStorage.getItem("refreshToken");
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const page = location.state?.page || "";
  console.log(page, "123345");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMeetData = async (id) => {
      try {
        let response;
        if (page == "committee") {
          response = await fetch(`${apiURL}/committee-meeting`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          response = await fetch(`${apiURL}/meeting`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }
        const data = await response.json();
        setMeetData(data.results);
        const specificMeetInfo = data.results.find((item) => item.id === id);

        if (specificMeetInfo) {
          console.log(specificMeetInfo, "Filtered meetInfo");
          setMeetInfo(specificMeetInfo); // Set the filtered object
          setClientInfo(specificMeetInfo?.client_name);
        } else {
          console.warn("No match found for the specified id.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMeetData(id);
  }, [id, token]);
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
    const fetchVariables = async () => {
      try {
        let response;
        if (page == "committee") {
          response = await fetch(`${apiURL}/committee-meeting`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
        response = await fetch(`${apiURL}/meeting/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })}
        const data = await response.json();

        setXResolutions(data?.resolutions);
        setVariable(data?.variables);
        // processStoredPlaceholders();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchVariables();

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
      const systemVariable = rows?.find((row) => row?.name === placeholder);
      if (systemVariable) {
        console.log(systemVariable, "system-var");
        let res = systemVariable.mca_name;
        let value;
        function getOrdinalSuffix(number) {
          const suffixes = ["th", "st", "nd", "rd"];
          const value = number % 100;
          return (
            number +
            (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
          );
        }
        if (res == "count") {
          const selectedId = id; // Replace with the id of the current meeting
          const previousMeetingsCount = countPreviousMeetings(
            meetData,
            selectedId
          );

          let result = getOrdinalSuffix(previousMeetingsCount);
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
        } else if (res == "current_year") {
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

          // Mark as confirmed
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
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setEditorContent(result.value);
      console.log("object", result.value);
      setInitializedContent(result.value);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };

  useEffect(() => {
    const handleMultipleFilesAddOn = async (urls) => {
      console.log(urls, "urls");
      let count = 7; // Start count from 7
      try {
        let combinedContent = "";

        for (const url of urls) {
          if (url?.title) {
            const title = url?.title || "Untitled";
            if (title === "For #{company_name}") {
              combinedContent += `<p>${title}</p>\n`;
              continue;
            }
            combinedContent += `<p>${count}. ${title}</p>\n`;
            count++;
          }

          if (url?.templateFile) {
            console.log("Processing templateFile:", url.templateFile);
            const response = await fetch(url.templateFile);
            if (!response.ok) {
              throw new Error(`Failed to fetch file from: ${url.templateFile}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            combinedContent += `<div>${result.value}</div>\n`;
          } else {
            console.warn(
              "Skipped processing due to missing templateFile:",
              url
            );
          }

          // Add resolution file content if available
          if (url?.resolutionFile) {
            console.log("Processing resolutionFile:", url.resolutionFile);
            const response = await fetch(url.resolutionFile);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch file from: ${url.resolutionFile}`
              );
            }
            const arrayBuffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            combinedContent += `<div>${result.value}</div>\n`;
          } else {
            console.warn(
              "Skipped processing due to missing resolutionFile:",
              url
            );
          }
        }

        setEditorContent(initializedContent + combinedContent);
      } catch (error) {
        console.error("Error fetching or converting one or more files:", error);
      }
    };

    handleMultipleFilesAddOn(selectedData);
    processPlaceholders(selectedData);
  }, [selectedData]);

  useEffect(() => {
    setTimeout(() => {
      if (fileUrl) handleFileLoad(fileUrl);
    }, 3000);
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

  const parseHtmlToDocx = (htmlContent) => {
    const parser = new DOMParser();
    const content = parser.parseFromString(htmlContent, "text/html");
    const elements = content.body.childNodes;

    const children = Array.from(elements).map((element) => {
      if (element.tagName === "B" || element.tagName === "STRONG") {
        return new Paragraph({
          children: [new TextRun({ text: element.textContent, bold: true })],
        });
      } else if (element.tagName === "I" || element.tagName === "EM") {
        return new Paragraph({
          children: [new TextRun({ text: element.textContent, italics: true })],
        });
      } else if (element.tagName === "U") {
        return new Paragraph({
          children: [new TextRun({ text: element.textContent, underline: {} })],
        });
      } else if (element.tagName === "H1") {
        return new Paragraph({
          children: [
            new TextRun({ text: element.textContent, bold: true, size: 48 }),
          ],
        });
      } else if (element.tagName === "H2") {
        return new Paragraph({
          children: [
            new TextRun({ text: element.textContent, bold: true, size: 36 }),
          ],
        });
      } else if (element.tagName === "LI") {
        return new Paragraph({
          children: [new TextRun({ text: element.textContent })],
          bullet: { level: 0 },
        });
      } else if (element.tagName === "FIGURE") {
        const table = element.querySelector("table"); // Get the table inside the figure
        if (table) {
          const rows = Array.from(table.rows).map((row) => {
            const cells = Array.from(row.cells).map((cell) => {
              return new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun(cell.textContent)] }),
                ],
                width: { size: 1000, type: WidthType.AUTO },
              });
            });
            return new TableRow({ children: cells });
          });
          return new Table({
            rows: rows,
          });
        }
      }

      // Handle tables directly (outside of figure tag)
      else if (element.tagName === "TABLE") {
        const rows = Array.from(element.rows).map((row) => {
          const cells = Array.from(row.cells).map((cell) => {
            return new TableCell({
              children: [
                new Paragraph({ children: [new TextRun(cell.textContent)] }),
              ],
              width: { size: 1000, type: WidthType.AUTO },
            });
          });
          return new TableRow({ children: cells });
        });
        return new Table({
          rows: rows,
        });
      } else {
        return new Paragraph({
          children: [new TextRun(element.textContent)],
        });
      }
    });

    return children;
  };

  const createWordDocument = async () => {
    const formattedContent = editorContent.replace(/\n/g, "<br>");
    const parsedContent = parseHtmlToDocx(formattedContent);

    const doc = new Document({
      sections: [
        {
          children: parsedContent,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  };
  useEffect(() => {
    const selectedAgendas = xresolution
      ? xresolution.map((option) => {
          console.log(option, resolutionList, "match");
          const agenda = resolutionList?.find((item) => {
            if (item.title == option.templateName) {
              return item;
            }
          });
          return {
            title: agenda?.title || "",
            templateFile: agenda?.fileName || "",
            resolutionFile: agenda?.resolutionUrl || "",
          };
        })
      : [];
    let match = {};
    const selectedOptions = xresolution?.map((res) => {
        match = resolutionList.find(
          (option) => option.title === res?.templateName
        );

        return {
          title: match?.title || "",
          templateFile: match?.fileName || "",
          resolutionFile: match?.resolutionUrl || "",
        };
      })
      .filter(Boolean);
    const selectedResolOptions = resolutionList?.map((res) => {
        // console.log(res,"tilejjjjj")
        const matchLabels = resolOptions.find(
          (option) => option.label === "Authorisation MCA Compliances"
        );
        return matchLabels || null;
      })
      .filter(Boolean);

    console.log("fge", selectedResolOptions);
    // console.log("dds", selectedOptions);
    let newSelect = [
      { label: match?.templateName, value: match?.templateName },
    ];
    setTimeout(() => {
      setSelectedData(selectedOptions);
      setPrevoiusSelectedOptions(newSelect);
      // handleAgendaItemChange()
    }, 5000);
  }, [resolutionList, xresolution]);
  const resolOptions = resolutionList?.map((resol) => ({
    value: resol?.templateName,
    label: resol?.templateName,
  }));

  const saveResolutions = async () => {
    try {
      if (selectedData) {
        const filteredData = selectedData?.filter(
          (item) => item.title !== "For #{company_name}"
        );

        const resolutions = filteredData?.map((item) => ({
          templateName: item.title || "",
          templateFile: item.resolutionFile || "",
          meetingType: "board_meeting",
        }));

        const response = await fetch(`${apiURL}/meeting/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ resolutions }),
        });

        if (response.ok) {
          toast.success("Resolutions Saved");
          navigate(`/documents/${id}`);
        } else {
          console.error("Failed to save the resolutions.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error occurred while saving the resolutions.");
    }
  };

  const saveDocument = async () => {
    setButtonLoading(true);

    const docBlob = await createWordDocument();

    const formData = new FormData();

    formData.append("file", docBlob);
    formData.append("index", index);
    formData.append("variables", JSON.stringify(placeVar));
    formData.append("is_approved", true);
    console.log(JSON.stringify(placeVar));
    try {
      const response = await fetch(`${apiURL}/meeting/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        saveResolutions();

        toast.success("Document saved successfully");
      } else {
        console.log("Failed to save the document.");
      }
    } catch (error) {
      toast.error("Error occurred while saving the document.");
    } finally {
      setButtonLoading(false);
    }
  };
  const handleAgendaItemChange = (selectedOptions) => {
    console.log(resolutionList, "resol-lis");
    const selectedAgendas = selectedOptions
      ? selectedOptions?.map((option) => {
          const agenda = resolutionList.find(
            (item) => item.templateName === option.value
          );
          return {
            // templateName: option.value,
            // meetingType: agenda?.meetingType || "",
            title: agenda?.title || "",
            templateFile: agenda?.fileName || "",
            resolutionFile: agenda?.resolutionUrl || "",
          };
        })
      : [];
    console.log("dds", selectedAgendas);
    setSelectedData(selectedAgendas);
    setPrevoiusSelectedOptions(selectedOptions || []);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   agendaItems: selectedAgendas,
    // }));
  };
  const hasUnconfirmedPlaceholders = Object.keys(inputFields).some(
    (placeholder) => !confirmedFields[placeholder]
  );
  console.log(variable, "variable");
  return (
    <Container className="mt-5">
      <h1>Document Editor</h1>
      {/* <Button onClick={handleFileAddOn}>Add On</Button>
      <Button onClick={handleFileRemoveOn}>Remove On</Button> */}
      <div className="parentContainer">
        <div className="leftContainer">
          <CKEditor
            editor={ClassicEditor}
            data={editorContent}
            onChange={(event, editor) => handleEditorChange(editor.getData())}
            config={{
              toolbar: false,
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
                isMulti
                onChange={handleAgendaItemChange}
                isClearable
              /> 
            </Form.Group>
         {/* {Object.keys(variable)?.length > 0 ? (
              <div className="mb-5">
                <h4 className="h4-heading-style">
                  Previously Filled Placeholders
                </h4>

                <div className="mt-3">
                  <table className="Master-table">
                    <tbody>
                      {Object.entries(variable)?.map(([key, value], index) => (
                        <tr key={index}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              " "
            )}  */}

            <h3>Detected Placeholders:</h3>
            {
            Object.keys(inputFields)?.length > 0 ? (
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
            ) :
             (
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
        </div>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default DocumentEditor;
