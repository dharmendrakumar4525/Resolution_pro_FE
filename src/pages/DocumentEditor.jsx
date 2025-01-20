import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
//import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styling
import mammoth from "mammoth"; // Import mammoth.js

const DocumentTemplate = () => {
  // Initialize form data for placeholders
  const [formData, setFormData] = useState({
    absentDirName: "",
    absentDirDIN: "",
    clientName: "",
    meetingDate: "",
    clientRegAddress: "",
  });

  const [editorContent, setEditorContent] = useState("");
  const [documents, setDocuments] = useState([]); // To save files
  const [currentDocName, setCurrentDocName] = useState(""); // Track current doc
  const [isEditing, setIsEditing] = useState(false); // Editing state for opening docs
  const [buttonLoading, setButtonLoading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Upload DOCX file and convert to HTML using mammoth.js
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const arrayBuffer = reader.result;
      mammoth
        .convertToHtml({ arrayBuffer: arrayBuffer })
        .then((result) => {
          setEditorContent(result.value); // Load the HTML content from the DOCX file into the editor
        })
        .catch((err) => console.log(err));
    };

    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  };

  // Replace placeholders with actual form data
  const updateEditorContent = () => {
    let updatedContent = editorContent
      .replace(/\${Client Name}/g, formData.clientName || "${Client Name}")
      .replace(
        /\${Client Reg Address}/g,
        formData.clientRegAddress || "${Client Reg Address}"
      )
      .replace(/\${Meeting Date}/g, formData.meetingDate || "${Meeting Date}")
      .replace(
        /\${Absent Dir Name}/g,
        formData.absentDirName || "${Absent Dir Name}"
      )
      .replace(
        /\${Absent Dir DIN}/g,
        formData.absentDirDIN || "${Absent Dir DIN}"
      );

    setEditorContent(updatedContent);

    // Clear form after updating the preview
    setFormData({
      absentDirName: "",
      absentDirDIN: "",
      clientName: "",
      meetingDate: "",
      clientRegAddress: "",
    });

    document.getElementById("fileUpload").value = null;
  };

  // Save the updated document in a list
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

    document.getElementById("fileUpload").value = null;
  };

  // Open a saved document for editing
  const openDocument = (doc) => {
    setEditorContent(doc.content);
    setCurrentDocName(doc.name);
    setIsEditing(true);
    document.getElementById("fileUpload").value = null;
  };

  // Cancel editing and return to the document list
  const cancelEditing = () => {
    setEditorContent("");
    setCurrentDocName("");
    setIsEditing(false);
  };

  return (
    <Container className="mt-5">
      <Row>
        {/* Left Column: Document Editor */}
        <Col md={8}>
          <h3>Document Preview</h3>
          <CKEditor
            //editor=\{ClassicEditor\}
            data={editorContent}
            onChange={(event, editor) => {
              const data = editor.getData();
              setEditorContent(data);
            }}
          />
        </Col>

        {/* Right Column: Form to Update Variables */}
        <Col md={4}>
          <h3>Update Document Fields</h3>
          <Form>
            {/* Document Name Field */}
            <Form.Group controlId="documentName" className="mt-3">
              <Form.Label>Document Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter document name"
                value={currentDocName}
                onChange={(e) => setCurrentDocName(e.target.value)}
              />
            </Form.Group>

            {/* Upload DOCX File */}
            <Form.Group controlId="fileUpload" className="mt-3">
              <Form.Label>Upload DOCX File</Form.Label>
              <Form.Control
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
              />
            </Form.Group>

            <Form.Group controlId="clientName" className="mt-3">
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                name="clientName"
                placeholder="Enter client name"
                value={formData.clientName}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="clientRegAddress" className="mt-3">
              <Form.Label>Client Registered Address</Form.Label>
              <Form.Control
                type="text"
                name="clientRegAddress"
                placeholder="Enter client registered address"
                value={formData.clientRegAddress}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="meetingDate" className="mt-3">
              <Form.Label>Meeting Date</Form.Label>
              <Form.Control
                type="date"
                name="meetingDate"
                value={formData.meetingDate}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="absentDirName" className="mt-3">
              <Form.Label>Absent Director Name</Form.Label>
              <Form.Control
                type="text"
                name="absentDirName"
                placeholder="Enter absent director name"
                value={formData.absentDirName}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="absentDirDIN" className="mt-3">
              <Form.Label>Absent Director DIN</Form.Label>
              <Form.Control
                type="text"
                name="absentDirDIN"
                placeholder="Enter absent director DIN"
                value={formData.absentDirDIN}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button
              variant="primary"
              className="mt-4"
              onClick={updateEditorContent}
            >
              Update Document Preview
            </Button>
          </Form>

          <Button variant="success" className="mt-3" onClick={saveDocument}>
            Save Document
          </Button>
        </Col>
      </Row>

      {/* Document List */}
      {documents.length > 0 && (
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
                      onClick={() => openDocument(doc)}
                      className="me-2"
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default DocumentTemplate;
