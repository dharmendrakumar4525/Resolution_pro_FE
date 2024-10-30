import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Button, Form, Table, Container } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import mammoth from "mammoth";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styling/templateEditor.css";

const TemplateEditor = () => {
  const [documents, setDocuments] = useState([]); // List of saved documents
  const [editorContent, setEditorContent] = useState(""); // CKEditor content
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocName, setCurrentDocName] = useState(""); // Track current doc
  const [inputFields, setInputFields] = useState({}); // Placeholder values
  const [confirmedFields, setConfirmedFields] = useState({}); // Confirmed placeholders
  const [docFile, setDocFile] = useState(null); // For storing the original DOCX file

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

  const createWordDocument = async () => {
    const parsedContent = parseHtmlToDocx(editorContent); // Parse HTML content to docx-friendly format

    const doc = new Document({
      sections: [
        {
          children: parsedContent,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${currentDocName || "Document"}.docx`);
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

  // Save the document in the dashboard list
  const saveDocument = () => {
    if (!currentDocName) {
      alert("Please enter a document name.");
      return;
    }

    const newDoc = {
      name: currentDocName,
      content: editorContent,
    };

    setDocuments([...documents, newDoc]);
    setEditorContent("");
    setCurrentDocName("");
    setIsEditing(false);
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
        <div className="leftContainer">
          <h1 className="mb-4">Template Editor</h1>

          <Form.Group className="mb-3">
            <Form.Label>Upload DOCX File</Form.Label>
            <Form.Control
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
            />
          </Form.Group>

          <Form>
            <Form.Group controlId="documentName">
              <Form.Label>Document Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter document name"
                value={currentDocName}
                onChange={(e) => setCurrentDocName(e.target.value)}
              />
            </Form.Group>
          </Form>

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

          <Button variant="success" onClick={saveDocument} className="mt-5">
            Save Document
          </Button>
        </div>
        <div className="rightContainer">
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
              <p>
                No placeholders detected yet. Use the format ${"{name}"} in your
                content.
              </p>
            )}
          </div>

          {/* Download and Save Actions */}
          <div className="download-options mt-5">
            <Button
              onClick={createWordDocument}
              disabled={hasUnconfirmedPlaceholders} // Disable if placeholders are unconfirmed
            >
              Download Updated Word File
            </Button>
            {hasUnconfirmedPlaceholders && (
              <p style={{ color: "red" }}>
                Some placeholders are unconfirmed. Please confirm all before
                downloading the Word file.
              </p>
            )}
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mt-5">
              <h3>Saved Documents</h3>
              <Table striped bordered hover>
                <thead>
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
          )}
        </div>
      </div>
    </Container>
  );
};

export default TemplateEditor;