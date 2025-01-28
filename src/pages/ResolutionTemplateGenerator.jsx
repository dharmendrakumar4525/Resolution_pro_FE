import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

import {
  Button,
  Modal,
  Form,
  FormControl,
  Container,
  Spinner,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";
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
import { saveAs } from "file-saver";
import JoditEditor from "jodit-react";
import htmlDocx from "html-docx-js/dist/html-docx";

const ResolutionTemplateGenerator = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocName, setCurrentDocName] = useState("");
  const [inputFields, setInputFields] = useState({});
  const [confirmedFields, setConfirmedFields] = useState({});
  const [docFile, setDocFile] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editor = useRef(null);

  const fileUrl = location.state;
  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/system-variable?page=${pageNo}&limit=15`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setTotalPages(data.totalPages);

        setRows(data.results);
        console.log(data, "mkkl");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(page);
  }, [page, token]);
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
  const handlePageChange = (newPage) => {
    setPage(newPage);
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

  const handleFileLoad = async (url) => {
    try {
      setEditorContent(url);
    } catch (error) {
      console.error("Error fetching or converting the file:", error);
    }
  };

  useEffect(() => {
    handleFileLoad(fileUrl);
  }, [fileUrl]);

  // Parse HTML content to docx-compatible Paragraphs and TextRuns

  // Save the document in the dashboard list
  const saveDocument = async () => {
    setButtonLoading(true);
    const formData = new FormData();
    formData.append("resolutionUrl", editorContent);

    try {
      // Make a PATCH request with the document
      const response = await fetch(`${apiURL}/agenda/${id}`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });
      console.log(formData, "tokennn2");
      if (response.ok) {
        toast.success("Resolution saved successfully!");

        // Optionally update your document list
        const newDoc = {
          name: currentDocName,
          content: editorContent,
        };

        setDocuments([...documents, newDoc]);
        navigate("/agenda-template");
      } else {
        toast.error("Failed to save the document.");
      }
    } catch (error) {
      toast.error("Error occurred while saving the document.");
    } finally {
      setButtonLoading(false);
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
      <ToastContainer />
      <div className="parentContainer">
        <div className="leftContainer">
          <h1 className="mb-4">Resolution Template Generator</h1>

          <JoditEditor
            ref={editor}
            value={editorContent}
            onChange={(newContent) => {
              setEditorContent(newContent);
            }}
          />

          <Button variant="secondary" onClick={saveDocument} className="mt-5">
            {buttonLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Save Resolution"
            )}
          </Button>
        </div>
        <div className="rightContainer">
          <h4 className="h4-heading-style mt-3">System Variables</h4>

          {loading ? (
            <div className="text-center mt-2">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <div className="table-responsive mt-4">
              <table className="Master-table p-5">
                <tbody>
                  {rows?.map((row) => (
                    <tr key={row?.id}>
                      <td>{row?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination className="mt-4">
                <Pagination.Prev
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                />
                {Array.from({ length: totalPages }, (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === page}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          )}
          <Button variant="danger" onClick={() => navigate(-1)}>
            Exit Without Saving
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ResolutionTemplateGenerator;
