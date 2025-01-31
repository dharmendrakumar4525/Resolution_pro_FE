import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// import { getDocument } from "pdfjs-dist";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Button, Form, Table, Container, Spinner } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import mammoth from "mammoth";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styling/templateEditor.css";
import JoditEditor from "jodit-react";

const TemplateViewer = () => {
  const [documents, setDocuments] = useState([]); // List of saved documents
  const [editorContent, setEditorContent] = useState(""); // CKEditor content
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocName, setCurrentDocName] = useState(""); // Track current doc
  const [inputFields, setInputFields] = useState({}); // Placeholder values
  const [confirmedFields, setConfirmedFields] = useState({}); // Confirmed placeholders
  const [docFile, setDocFile] = useState(null); // For storing the original DOCX file
  const location = useLocation();
  const { id } = useParams();
  const token = localStorage.getItem("refreshToken");
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();
  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
  const page = location.state?.page;
  const approvalData = location.state?.meetData;
  const meetData = approvalData?.meeting_id;
  const editor = useRef(null);

  console.log(approvalData, "approved");
  console.log(fileUrl, "approved");
  console.log(meetData, "meetData");
  useEffect(() => {
    handleFileLoad(fileUrl);
  }, [fileUrl]);
  const handleEditorChange = (content) => {
    setEditorContent(content);

    // Regex to detect placeholders in the format ${placeholder}
    const regex = /\$\{([a-zA-Z0-9_]+)\}/g;
    let match;
    const fields = {};

    while ((match = regex.exec(content)) !== null) {
      const placeholder = match[1];
      fields[placeholder] = inputFields[placeholder] || ""; // Initialize if not present
    }

    setInputFields(fields);
  };
  const [formData, setFormData] = useState({
    decision: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    if (formData.decision == "revise" && formData.remarks == "") {
      toast.info("Please add a reason before sending for Revision");
      return;
    } else if (formData.decision == "revise") {
      const RefusalData = {
        meeting_id: meetData?.id,
        meeting_type: meetData?.meetingType,
        company_id: meetData?.client_name,
        reason: formData?.remarks,
      };
      try {
        let url;
        if (meetData?.meetingType == "committee_meeting") {
          url = `${apiURL}/committee-meeting/${meetData.id}`;
        } else if (meetData?.meetingType == "shareholder_meeting") {
          url = `${apiURL}/shareholder-meeting/${meetData.id}`;
        } else {
          url = `${apiURL}/meeting/${meetData.id}`;
        }
        const response = await fetch(`${apiURL}/meeting-revise`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(RefusalData),
        });
        const patchResponse = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approval_status: "draft",
          }),
        });
        const patchApprovalResponse = await fetch(
          `${apiURL}/meeting-approval/${approvalData._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              is_active: false,
            }),
          }
        );
        if (response.ok && patchResponse.ok && patchApprovalResponse.ok) {
          toast.success("This Document is sent for revision");
          navigate("/approval-docs");
        } else {
          toast.error("Error making request");
        }
      } catch (error) {
        toast.error("Error occurred while saving the document.");
      }
    } else if (formData.decision == "accept") {
      try {
        let url;
        if (meetData?.meetingType == "committee_meeting") {
          url = `${apiURL}/committee-meeting/${meetData.id}`;
        } else if (meetData?.meetingType == "shareholder_meeting") {
          url = `${apiURL}/shareholder-meeting/${meetData.id}`;
        } else {
          url = `${apiURL}/meeting/${meetData.id}`;
        }
        const patchResponse = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_approved: false,
            approval_status: "approved",
          }),
        });
        const patchApprovalResponse = await fetch(
          `${apiURL}/meeting-approval/${approvalData._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              is_active: false,
            }),
          }
        );
        if (patchResponse.ok && patchApprovalResponse) {
          toast.success("The document is approved now");
          navigate("/approval-docs");
        } else {
          toast.error("Error making request");
        }
      } catch (error) {
        toast.error("Error occurred while saving the document.");
      }
    }
  };

  // Handle input changes for each placeholder
  const handleInputChange = (placeholder, value) => {
    setInputFields((prevState) => ({
      ...prevState,
      [placeholder]: value,
    }));
  };

  // Confirm the value and replace the placeholder in the content
  const handleConfirm = (placeholder) => {
    const value = inputFields[placeholder] || placeholder;
    const updatedContent = editorContent.replace(
      new RegExp(`\\$\\{${placeholder}\\}`, "g"),
      value
    );
    setEditorContent(updatedContent);
    setConfirmedFields((prevState) => ({
      ...prevState,
      [placeholder]: true,
    })); // Mark placeholder as confirmed
  };

  // Parse HTML content to docx-compatible Paragraphs and TextRuns
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
      } else {
        return new Paragraph({
          children: [new TextRun(element.textContent)],
        });
      }
    });

    return children;
  };

  const handleFileLoad = async (url) => {
    try {
      const updatedHtmlString = url.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      setEditorContent(updatedHtmlString);

      // const response = await fetch(url);
      // if (!response.ok) throw new Error("Network response was not ok");
      // const arrayBuffer = await response.arrayBuffer();

      // const fileType = url.split(".").pop().toLowerCase(); // Determine file type by extension

      // if (fileType === "docx") {
      //   // Handle DOCX file
      //   const result = await mammoth.convertToHtml({ arrayBuffer });
      //   const htmlContent = result.value;
      //   setEditorContent(htmlContent);
      // }
      // // else if (fileType === "pdf") {
      // //   // Handle PDF file
      // //   const textContent = await extractPdfText(arrayBuffer);
      // //   setEditorContent(textContent);
      // // }
      // else {
      //   throw new Error(
      //     "Unsupported file format. Only DOCX and PDF are supported."
      //   );
      // }
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };

  // const extractPdfText = async (arrayBuffer) => {
  //   const pdf = await getDocument({ data: arrayBuffer }).promise;
  //   const numPages = pdf.numPages;
  //   let text = "";

  //   for (let i = 1; i <= numPages; i++) {
  //     const page = await pdf.getPage(i);
  //     const content = await page.getTextContent();
  //     const pageText = content.items.map((item) => item.str).join(" ");
  //     text += pageText + "\n";
  //   }

  //   return text;
  // };

  const createWordDocument = async () => {
    const parsedContent = parseHtmlToDocx(editorContent);

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
  const saveDocument = async () => {
    const docBlob = await createWordDocument();
    setButtonLoading(true);

    // Prepare FormData with the document Blob
    const formData = new FormData();
    formData.append("templateName", docBlob);
    formData.append("index", index);

    try {
      // Make a PATCH request with the document
      const response = await fetch(`${apiURL}/meeting/${id}`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: formData,
      });

      if (response.ok) {
        toast.success("Document saved successfully!");

        // Optionally update your document list
        const newDoc = {
          name: currentDocName,
          content: editorContent,
        };

        setDocuments([...documents, newDoc]);
        setCurrentDocName("");
        setIsEditing(false);
      } else {
        alert("Failed to save the document.");
      }
    } catch (error) {
      toast.error("Error occurred while saving the document.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setDocFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;
      setEditorContent(htmlContent);
    };
    reader.readAsArrayBuffer(file);
  };

  // Save changes to an existing document
  const saveChanges = () => {
    const updatedDocs = documents.map((doc) =>
      doc.name === currentDocName ? { ...doc, content: editorContent } : doc
    );
    setDocuments(updatedDocs);
    setEditorContent("");
    setCurrentDocName("");
    setIsEditing(false);
  };

  // Check for unconfirmed placeholders
  const hasUnconfirmedPlaceholders = Object.keys(inputFields).some(
    (placeholder) => !confirmedFields[placeholder]
  );

  return (
    <Container className="mt-5">
      <ToastContainer />
      <div className="parentContainer">
        <div className="leftContainer" style={{ width: "70%" }}>
          <h1 className="mb-4">Document Viewer</h1>
          <JoditEditor
            ref={editor}
            value={editorContent}
            onChange={(newContent) => {
              setEditorContent(newContent);
            }}
            config={{
              toolbar: false,
              readonly: true,
            }}
          />
        </div>

        {page == "approval" ? (
          <form onSubmit={(e) => handleSubmit(e)} className="mt-4">
            {/* Select Field */}
            <div className="mb-3">
              <label htmlFor="decision" className="form-label">
                Decision<sup>*</sup>
              </label>
              <select
                id="decision"
                name="decision"
                className="form-select"
                value={formData.decision}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="accept">Accept</option>
                <option value="revise">Revise</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="remarks" className="form-label">
                {formData?.decision == "revise" ? (
                  <>
                    Remarks<sup>*</sup>
                  </>
                ) : (
                  `Remarks`
                )}
              </label>
              <textarea
                id="remarks"
                name="remarks"
                className="form-control"
                rows="4"
                placeholder="Enter remarks here..."
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <Button
              className="mt-4"
              variant="danger"
              onClick={() => navigate(-1)}
            >
              Exit without Approval
            </Button>
          </form>
        ) : (
          <Button
            variant="primary"
            onClick={() => navigate(-1, { state: { tab: "notice" } })}
            style={{ marginRight: "20px" }}
          >
            Go Back
          </Button>
        )}
      </div>
    </Container>
  );
};

export default TemplateViewer;
