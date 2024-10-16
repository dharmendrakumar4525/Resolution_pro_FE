import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import ReactQuill from "react-quill";
import { Button, Form, Table, Container, Row, Col } from "react-bootstrap";
import "react-quill/dist/quill.snow.css"; // React Quill styling
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styling

// Custom toolbar options for the editor
const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["link", "image"],
  [{ color: [] }, { background: [] }],
  ["clean"],
];

const WordEditorModule = () => {
  const [documents, setDocuments] = useState([]); // List of saved documents
  const [editorContent, setEditorContent] = useState(""); // Quill editor content
  const [isEditing, setIsEditing] = useState(false); // Edit mode state
  const [currentDocName, setCurrentDocName] = useState(""); // Track current doc

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
          children: [new TextRun({ text: element.textContent, bold: true, size: 48 })],
        });
      } else if (element.tagName === "H2") {
        return new Paragraph({
          children: [new TextRun({ text: element.textContent, bold: true, size: 36 })],
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

  // Generate and save the Word file from the editor
  const createWordDocument = async () => {
    const parsedContent = parseHtmlToDocx(editorContent); // Parse HTML content to docx-friendly format

    const doc = new Document({
      sections: [
        {
          children: parsedContent, // Insert parsed content into document
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${currentDocName || "Document"}.docx`);
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

  // Save changes as a new document (create a new version)
  const saveChangesAsNew = () => {
    let baseName = currentDocName;
    const match = baseName.match(/(\d+)$/);
    let version = 1;

    // Check if the document already has a number version, and increment it
    if (match) {
      baseName = baseName.replace(/ \d+$/, ""); // Remove the existing number
      version = parseInt(match[0]) + 1;
    } else {
      // Find the last version and increment it
      const existingVersions = documents.filter((doc) =>
        doc.name.startsWith(baseName)
      );
      if (existingVersions.length > 0) {
        const lastVersion = existingVersions.reduce((max, doc) => {
          const versionMatch = doc.name.match(/(\d+)$/);
          if (versionMatch) {
            const versionNumber = parseInt(versionMatch[0]);
            return Math.max(max, versionNumber);
          }
          return max;
        }, 1);
        version = lastVersion + 1;
      }
    }

    const newDocName = `${baseName} ${version}`;

    const newDoc = {
      name: newDocName,
      content: editorContent,
    };

    setDocuments([...documents, newDoc]);
    setCurrentDocName(newDocName);
    setEditorContent("");
    setCurrentDocName("");
    setIsEditing(false);
  };

  // Open a saved document for editing
  const openDocument = (doc) => {
    setEditorContent(doc.content);
    setCurrentDocName(doc.name);
    setIsEditing(true);
  };

  // Cancel editing and return to the document list
  const cancelEditing = () => {
    setEditorContent("");
    setCurrentDocName("");
    setIsEditing(false);
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Meeting Template </h1>

      {!isEditing ? (
        <>
          {/* Form for creating a new document */}
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

          {/* Editor for writing content */}
          <ReactQuill
            value={editorContent}
            onChange={setEditorContent}
            modules={{ toolbar: toolbarOptions }}
            className="quill-editor mt-3"
            style={{ height: "200px" }}
          />

          <Button variant="success" onClick={saveDocument} className="mt-5">
            Save Document
          </Button>

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
                          onClick={() => openDocument(doc)}
                          className="me-2"
                        >
                          Open
                        </Button>
                        <Button variant="secondary" onClick={createWordDocument}>
                          Download as .docx
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Edit Mode */}
          <Row>
            <Col>
              <h2>Editing: {currentDocName}</h2>

              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={{ toolbar: toolbarOptions }}
                className="quill-editor mt-3"
                style={{ height: "400px" }}
              />

              <div className="toolbar-header mt-5">
                <Button variant="success" onClick={saveChanges} className="mt-3 me-2">
                  Save Changes
                </Button>
                <Button
                  variant="info"
                  onClick={saveChangesAsNew}
                  className="mt-3 me-2"
                >
                  Save Changes as New File
                </Button>
                <Button variant="danger" onClick={cancelEditing} className="mt-3 me-2">
                  Cancel
                </Button>
                <Button variant="primary" onClick={createWordDocument} className="mt-3">
                  Download as .docx
                </Button>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default WordEditorModule;
