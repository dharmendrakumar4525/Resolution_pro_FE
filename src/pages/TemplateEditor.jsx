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

const DocumentEditor = () => {
  const [rows, setRows] = useState([]);
  const [resolutionList, setResolutionList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [xresolution, setXResolutions] = useState([]);
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
  const [confirmedFields, setConfirmedFields] = useState({}); // Confirmed placeholders
  const location = useLocation();
  const { id } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [circleResolution, setCircleResolution] = useState([]);
  const [prevCSR, setPrevCSR] = useState([]);
  const editor = useRef(null);

  const token = localStorage.getItem("refreshToken");
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const page = location.state?.page || "";
  console.log(page, "123345");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMeetData = async (id) => {
      try {
        let url;
        let meetingType;

        // Determine the URL and meeting type based on the page
        if (page === "committee") {
          url = `${apiURL}/committee-meeting`;
          meetingType = "committee_meeting";
        } else if (page === "shareholder") {
          url = `${apiURL}/shareholder-meeting`;
          meetingType = "shareholder_meeting";
        } else {
          url = `${apiURL}/meeting`;
          meetingType = "board_meeting";
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch meeting data
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch meeting data: ${response.status}`);
        }
        const data = await response.json();
        setMeetData(data?.results);

        // Find specific meeting info by ID
        const specificMeetInfo = data?.results.find((item) => item.id === id);
        console.log(specificMeetInfo, "meetData");
        if (!specificMeetInfo) {
          console.warn("No match found for the specified id.");
          return;
        }
        setMeetInfo(specificMeetInfo);

        const targetDate = new Date(specificMeetInfo?.date);

        // Fetch committee meeting data
        const committeeResponse = await fetch(`${apiURL}/committee-meeting`, {
          headers,
        });
        if (!committeeResponse.ok) {
          throw new Error(
            `Failed to fetch committee data: ${committeeResponse.status}`
          );
        }
        const committeeData = await committeeResponse.json();

        // Find the closest previous CSR meeting
        const closestPreviousCSRMeeting = committeeData?.results.filter(
          (meeting) =>
            new Date(meeting.date) < targetDate &&
            meeting?.client_name?.id === specificMeetInfo?.client_name?.id
        );

        const newCSRDate = closestPreviousCSRMeeting?.reduce((prev, curr) => {
          const prevDate = prev ? new Date(prev.date) : new Date(0);
          const currDate = new Date(curr.date);
          return currDate > prevDate ? curr : prev;
        }, null);

        if (newCSRDate) {
          setPrevCSR((prevCSR) => [...prevCSR, newCSRDate]);
        }

        // Find the closest previous meeting
        const closestPreviousMeeting = data?.results.filter(
          (meeting) =>
            new Date(meeting.date) < targetDate &&
            meeting?.client_name?.id === specificMeetInfo?.client_name?.id
        );

        const newDate = closestPreviousMeeting.reduce((prev, curr) => {
          const prevDate = prev ? new Date(prev?.date) : new Date(0);
          const currDate = new Date(curr?.date);
          return currDate > prevDate ? curr : prev;
        }, null);

        // Fetch circular resolutions
        const circularResolutionsResponse = await fetch(
          `${apiURL}/circular-resolution?client_name=${specificMeetInfo.client_name.id}&meeting_type=${meetingType}&status=approved`,
          { headers }
        );

        if (!circularResolutionsResponse.ok) {
          throw new Error(
            `Failed to fetch circular resolutions: ${circularResolutionsResponse.status}`
          );
        }

        const circularResolutions = await circularResolutionsResponse.json();

        let filteredCircularResolutions = [];
        if (closestPreviousMeeting.length > 0) {
          const previousDate = new Date(closestPreviousMeeting[0]?.date);
          const currMeetDate = new Date(specificMeetInfo?.date);

          filteredCircularResolutions = circularResolutions?.results.filter(
            (resolution) =>
              new Date(resolution.approved_at) > previousDate &&
              new Date(resolution.approved_at) <= currMeetDate
          );
        } else {
          // For the first meeting, return all resolutions
          filteredCircularResolutions = circularResolutions?.results;
        }
        console.log(specificMeetInfo, "test-in");
        setPreviousMeet(newDate?.date || null);
        setClientInfo(specificMeetInfo?.client_name);
        setCircleResolution(filteredCircularResolutions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    handleFileLoad(fileUrl);

    fetchMeetData(id);
  }, [id, token]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let keyword;
        if (page === "committee") {
          keyword = "committee_meeting";
        } else {
          keyword = "board_meeting";
        }
        const response = await fetch(
          `${apiURL}/agenda?meetingType=${keyword}&status=usable`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        console.log(data.results, "mkjl");
        setResolutionList(data.results);
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

        setXResolutions(data?.resolutions);
        setVariable(data?.variables);
        setDirectorList(data?.participants);
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
        new Date(meeting.date) < new Date(currentMeeting?.date) // Created before the current meeting
    );

    const count = previousMeetings.length + 1;

    // Set the count in the current meeting object (if needed)
    currentMeeting.previousMeetingCount = count;

    return count;
  };

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
            const suffixes = ["th", "st", "nd", "rd"];
            const value = number % 100;
            const suffix =
              suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
            return `${number}<sup style="color:#4a5073">${suffix}</sup>`;
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

              return `${day}, ${month} ${date}, ${year}`;
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
          } else if (
            res == "prev_board_meeting" ||
            res == "prev_committee_meeting"
          ) {
            if (previousMeet == undefined) {
              console.log(previousMeet, res, "res-123", systemVariable);
              if (variable !== {}) {
                fields[placeholder] = variable[placeholder] || "";
              } else {
                fields[placeholder] = inputFields[placeholder] || "";
              }

              // Preserve or initialize
            } else {
              const dateObj = new Date(previousMeet);
              const day = String(dateObj.getDate()).padStart(2, "0"); // Add leading zero
              const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Add leading zero, months are 0-indexed
              const year = dateObj.getFullYear();
              // return `${day}/${month}/${year}`; // Fo
              const result = `${day}/${month}/${year}`;
              value = result;
              updatedContent = updatedContent.replace(
                new RegExp(`(?:\\$|\\#)\\{${placeholder}\\}`, "g"),
                value
              );
              // setConfirmedFields((prevState) => ({
              //   ...prevState,
              //   [placeholder]: true,
              // }));
              setPlaceVar((prevData) => ({
                ...prevData,
                [systemVariable.name]: value,
              }));
            }
          } else if (res == "startTime") {
            const timeParts =
              meetInfo[res]?.split(":") ||
              "2024-11-28T09:08:41.931+00:00"?.split(":");
            console.log(timeParts, "tp");
            if (timeParts == undefined) {
              return (fields[placeholder] = inputFields[placeholder] || ""); // Preserve or initialize
            }
            const hours = parseInt(timeParts[0], 10);
            const minutes = timeParts[1];
            const amPm = hours >= 12 ? "PM" : "AM";

            const formattedHours = hours % 12 || 12;
            const result = `${formattedHours}:${minutes} ${amPm} ${meetInfo?.standard_time}`;
            console.log(result, "time-23");
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
              ...prevData,
              [systemVariable.name]: value,
            }));
          } else if (formulaRes == "date") {
            console.log(res, "response1234");
            function getFormattedDate(dateString) {
              const dateObj = new Date(dateString);
              const day = String(dateObj.getDate()).padStart(2, "0"); // Add leading zero
              const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Add leading zero, months are 0-indexed
              const year = dateObj.getFullYear();
              return `${day}/${month}/${year}`; // Format as dd/mm/yyyy
            }
            let result = getFormattedDate(clientInfo[res]);
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
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };
  const handleMultipleFilesAddOn = async (urls) => {
    let count = 5;
    let csrCount = 1;
    let csrContent = "";

    function getFormattedDate(dateString) {
      const dateObj = new Date(dateString);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`; // Fo
      // const result = `${day}/${month}/${year}`;
    }
    if (page == "board") {
      if (prevCSR.length >= 1) {
        let formattedDate = await getFormattedDate(prevCSR[0]?.date);
        csrContent += `<b>${count}. To note the minutes of previous Corporate Social Responsibility Committee Meeting held on ${formattedDate}</b>

      <br/>The minutes of the previous meeting of the Corporate Social Responsibility Committee of the Board of Directors (“CSR Committee") held on ${formattedDate}, is proposed to be placed before the Board of Directors for noting. The same is enclosed as Annexure-2.`;
        count++;
      }
    }
    if (circleResolution?.length >= 1) {
      csrContent += `<br/><b>${count}. To take note of the resolutions passed by the board by way of Circulation</b><br/>

      As per the provisions of the Companies Act, 2013, circular resolutions, if any, passed by the Board shall be noted at the subsequent meeting and recorded in the minutes of such meeting. Accordingly, the Board is requested to note the below circular resolutions approved by the Board between the meeting held on #{prev_board_meeting} and this meeting. The same is enclosed as Annexure-3.`;

      for (const url of circleResolution) {
        if (url?.title) {
          const title = url?.title || "Untitled";

          csrContent += `<p>${count}.${csrCount}. ${title}</p>`;
          csrCount++;
        }

        if (url?.filehtml) {
          csrContent += `<div>${url?.filehtml}</div>\n`;
        } else {
          console.warn("Skipped processing due to missing templateFile:", url);
        }
      }
      count++;
    } else {
    }

    try {
      let combinedContent = "";
      if (urls) {
        for (const url of urls) {
          if (url?.title) {
            const title = url?.title || "Untitled";
            if (title === "For #{company_name}") {
              combinedContent += `<b>${title}</b>\n`;
            } else {
              combinedContent += `<br/><p><strong>${count}. ${title}</strong></p>\n`;
              count++;
            }
          }

          if (url?.templateFile) {
            combinedContent += `<br/><div>${url?.templateFile}</div>\n`;
          } else {
            console.warn(
              "Skipped processing due to missing templateFile:",
              url
            );
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
      }

      let footerContent = `
      <br/><p>For <b>#{company_name}</b></p><p></p>


<h6>
Name: \${name}</h6>
<h6> Director</h6>
<h6> DIN: \${din_pan}</h6>
`;
      if (initializedContent) {
        console.log(initializedContent, "inik");
        setEditorContent(
          (initializedContent || "") +
            (csrContent || "") +
            (combinedContent || "") +
            (footerContent || "")
        );
      }

      console.log(editorContent, "ikea");
    } catch (error) {
      console.error("Error fetching or converting one or more files:", error);
    }
  };

  useEffect(() => {
    handleMultipleFilesAddOn(selectedData);
    processPlaceholders(editorContent);
  }, [selectedData, prevCSR, circleResolution, initializedContent]);

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
      : "";
    let match = {};
    let newSelect = [];
    const selectedOptions = xresolution
      ?.map((res) => {
        match = resolutionList.find(
          (option) => option.title === res?.templateName
        );
        newSelect.push({
          label: match?.templateName,
          value: match?.templateName,
        });

        return {
          title: match?.title || "",
          templateFile: match?.fileName || "",
          resolutionFile: match?.resolutionUrl || "",
        };
      })
      .filter(Boolean);
    console.log(match, "matches");

    const selectedResolOptions = resolutionList
      ?.map((res) => {
        // console.log(res,"tilejjjjj")
        const matchLabels = resolOptions.find(
          (option) => option.label === res.title
        );
        return matchLabels || null;
      })
      .filter(Boolean);

    setTimeout(() => {
      setSelectedData(selectedAgendas);
      setPrevoiusSelectedOptions(newSelect);
      // handleAgendaItemChange()
    }, 3000);
  }, [resolutionList?.length, xresolution?.length]);
  const resolOptions = resolutionList?.map((resol) => ({
    value: resol?.templateName,
    label: resol?.templateName,
  }));
  const directorOptions = directorList?.map((director) => ({
    value: director?.director?.id,
    label: director?.director?.name,
  }));

  const saveResolutions = async () => {
    try {
      if (selectedData) {
        const filteredData = selectedData?.filter(
          (item) => item.title !== "For #{company_name}"
        );
        let meetingType;
        let url;
        let redirectedUrl;
        if (page == "committee") {
          url = `${apiURL}/committee-meeting/${id}`;
          redirectedUrl = `/committee-documents/${id}`;
          meetingType = "committee_meeting";
        } else if (page == "shareholder") {
          url = `${apiURL}/shareholder-meeting/${id}`;
          redirectedUrl = `/shareholder-documents/${id}`;
          meetingType = "shareholder_meeting";
        } else {
          url = `${apiURL}/meeting/${id}`;
          redirectedUrl = `/documents/${id}`;
          meetingType = "board_meeting";
        }

        const resolutions = filteredData?.map((item) => ({
          templateName: item.title || "",
          templateFile: item.resolutionFile || "",
          meetingType: meetingType,
        }));

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ resolutions }),
        });

        if (response.ok) {
          toast.success("Resolutions Saved");
          navigate(redirectedUrl);
        } else {
          const errorData = await response.json();
          toast.error(
            `Error: ${errorData.message || "Failed to save resolutions"}`
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error occurred while saving the resolutions.");
    }
  };

  const saveDocument = async () => {
    setButtonLoading(true);

    const docxBlob = htmlDocx.asBlob(editorContent);

    const formData = new FormData();

    formData.append("file", docxBlob);
    formData.append("index", index);
    formData.append("variables", JSON.stringify(placeVar));
    formData.append("is_approved", true);
    formData.append("htmlcontent", editorContent);
    console.log(JSON.stringify(placeVar));
    let url;
    if (page == "committee") {
      url = `${apiURL}/committee-meeting/${id}`;
    } else if (page == "shareholder") {
      url = `${apiURL}/shareholder-meeting/${id}`;
    } else {
      url = `${apiURL}/meeting/${id}`;
    }
    try {
      const response = await fetch(url, {
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
  const handleSignatoryChange = (selectedOptions) => {
    const values = directorList.find(
      (i) => i.director.id == selectedOptions.value
    );

    const regex = /(?:\$\{([a-zA-Z0-9_]+)\})|(?:\#\{([a-zA-Z0-9_]+)\})/g;
    let match;
    let updatedContent = editorContent;
    while ((match = regex.exec(editorContent)) !== null) {
      const placeholder2 = match[1];
      console.log(values, "valewww", placeholder2);

      const value = values?.director?.name || placeholder2;
      const value2 = values?.director?.["din/pan"] || placeholder2;

      setInputFields((prevData) => ({
        ...prevData, // Spread the existing state
        ["name"]: value,
        ["din_pan"]: value2,
      }));
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
      <h1>Document Editor</h1>
      {/* <Button onClick={handleFileAddOn}>Add On</Button>
      <Button onClick={handleFileRemoveOn}>Remove On</Button> */}
      <div className="parentContainer">
        <div className="leftContainer">
          <JoditEditor
            ref={editor}
            value={editorContent}
            //config={config}
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
                isMulti
                onChange={handleAgendaItemChange}
                isClearable
              />
            </Form.Group>
            <Form.Group controlId="directorList" className="mb-5">
              <Select
                options={directorOptions}
                placeholder="Select Signatory Director"
                onChange={handleSignatoryChange}
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
};

export default DocumentEditor;
