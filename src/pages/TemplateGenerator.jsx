import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Button, Form, Table, Container, Row, Col } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styling/templateEditor.css";
import mammoth from "mammoth";
import { useParams } from "react-router-dom";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TemplateGenerator = () => {
  const [rows, setRows] = useState([]);
  const [fileUrl, setFileUrl] = useState();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocName, setCurrentDocName] = useState("");
  const [inputFields, setInputFields] = useState({});
  const [confirmedFields, setConfirmedFields] = useState({});
  const [docFile, setDocFile] = useState(null);

  const { id } = useParams();
  console.log(id, "iddd");

  const handleEditorChange = (content) => {
    setEditorContent(content);

    // Regex to detect placeholders in the format ${placeholder}
    const regex = /\$\{([a-zA-Z0-9_]+)\}/g;
    let match;
    const fields = {};

    while ((match = regex.exec(content)) !== null) {
      const placeholder = match[1];
      fields[placeholder] = inputFields[placeholder] || "";
    }

    setInputFields(fields);
  };

  const handleInputChange = (placeholder, value) => {
    setInputFields((prevState) => ({
      ...prevState,
      [placeholder]: value,
    }));
  };

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
    }));
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template/${id}`);
        const data = await response.json();
        setRows(data);
        setFileUrl(data.fileName);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileLoad = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;
      setEditorContent(htmlContent);
      console.log("fetchDocxFile-2", result);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };

  useEffect(() => {
    handleFileLoad(fileUrl);
  }, [fileUrl]);

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

  const formattedContent = editorContent.replace(/\n/g, "<br>");
    const parsedContent = parseHtmlToDocx(editorContent); 

    const doc = new Document({
      sections: [
        {
          children: parsedContent, // Insert parsed content into document
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob
  };

  // Save the document in the dashboard list
  const saveDocument = async () => {
  
    // Create Word document as a Blob
    const docBlob = await createWordDocument();
  
    // Prepare FormData with the document Blob
    const formData = new FormData();
    formData.append('file', docBlob);
  
    try {
      // Make a PATCH request with the document
      const response = await fetch(`${apiURL}/meeting-agenda-template/${id}`, {
        method: 'PATCH',
        body: formData,
      });
  
      if (response.ok) {
        toast.success('Document saved successfully!');
        
        // Optionally update your document list
        const newDoc = {
          name: currentDocName,
          content: editorContent,
        };
        
        setDocuments([...documents, newDoc]);
        setCurrentDocName("");
        setIsEditing(false);
      } else {
        alert('Failed to save the document.');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Error occurred while saving the document.');
    }
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

  const hasUnconfirmedPlaceholders = Object.keys(inputFields).some(
    (placeholder) => !confirmedFields[placeholder]
  );

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Meeting Template</h1>

      {/* CKEditor for writing content */}
      <CKEditor
        editor={ClassicEditor}
        data={editorContent}
        onChange={(event, editor) => handleEditorChange(editor.getData())}
        config={{
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "|",
            "bulletedList",
            "numberedList",
            "blockQuote",
            // Remove 'imageUpload', 'mediaEmbed', etc., from the toolbar.
          ],
        }}
      />

      <Button variant="success" onClick={saveDocument} className="mt-5">
        Save Document
      </Button>

     
   
    </Container>
  );
};

export default TemplateGenerator;
