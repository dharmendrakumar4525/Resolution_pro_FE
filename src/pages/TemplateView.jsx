import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

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

  const index = location.state?.index;
  const fileUrl = location.state?.fileUrl;
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
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();

      const fileType = url.split(".").pop().toLowerCase(); // Determine file type by extension

      if (fileType === "docx") {
        // Handle DOCX file
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;
        setEditorContent(htmlContent);
      } 
      // else if (fileType === "pdf") {
      //   // Handle PDF file
      //   const textContent = await extractPdfText(arrayBuffer);
      //   setEditorContent(textContent);
      // } 
      else {
        throw new Error(
          "Unsupported file format. Only DOCX and PDF are supported."
        );
      }
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
      <div className="parentContainer">
        <div className="leftContainer" style={{ width: "70%" }}>
          <h1 className="mb-4">Document Viewer</h1>

          <CKEditor
            editor={ClassicEditor}
            data={editorContent}
            onReady={(editor) => {
              editor.enableReadOnlyMode("read-only-mode");
            }}
            onChange={(event, editor) => handleEditorChange(editor.getData())}
            config={{
              toolbar: false,
            }}
          />
        </div>
        <div className="rightContainerHidden">
          {/* Detected Placeholder Input Fields */}
          <div className="dynamic-inputs mt-4">
            <h3>Detected Placeholders:</h3>
            {Object.keys(inputFields).length > 0 ? (
              Object.keys(inputFields).map((placeholder) => (
                <div key={placeholder}>
                  <label>{placeholder}:</label>
                  <input
                    type="text"
                    value={inputFields[placeholder]}
                    onChange={(e) =>
                      handleInputChange(placeholder, e.target.value)
                    }
                    placeholder={`Enter ${placeholder}`}
                    disabled={confirmedFields[placeholder]} // Disable if confirmed
                  />
                  <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={() => handleConfirm(placeholder)}
                    disabled={confirmedFields[placeholder]} // Disable if already confirmed
                  >
                    Confirm
                  </Button>
                </div>
              ))
            ) : (
              <p>All placeholders with ${"{example}"} are filled</p>
            )}
          </div>

          {/* Download and Save Actions */}
          <div className="download-options mt-5">
            <Button
              // onClick={createWordDocument}
              onClick={saveDocument}
              disabled={hasUnconfirmedPlaceholders} // Disable if placeholders are unconfirmed
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
                downloading the Word file.
              </p>
            )}
          </div>

          {/* Saved documents removed */}
          {/* {documents.length > 0 && (
            <div className="mt-5">
              <h3>Saved Documents</h3>
              <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                  <tr>
                    <th>#</th>
                    <th>Document Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{doc.name}</td>
                      <td>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setEditorContent(doc.content);
                            setCurrentDocName(doc.name);
                            setIsEditing(true);
                          }}
                          className="me-2"
                        >
                          Open
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={createWordDocument}
                        >
                          Download as .docx
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )} */}
        </div>
      </div>
    </Container>
  );
};

export default TemplateViewer;
