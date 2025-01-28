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
import JoditEditor from "jodit-react";

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
import htmlDocx from "html-docx-js/dist/html-docx";
const TemplateGenerator = () => {
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
  const [buttonLoading, setButtonLoading] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileUrl = location.state;
  const editor = useRef(null);
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
      // // template file fetch
      // const response = await fetch(url);
      // if (!response.ok) throw new Error("Network response was not ok");
      // const arrayBuffer = await response.arrayBuffer();
      // // console.log(arrayBuffer, "arr-Buff");
      // const mammothOptions = {
      //   styleMap: [
      //     "p[style-name='Heading 1'] => h1:fresh",
      //     "p[style-name='Heading 2'] => h2:fresh",
      //     "p[style-name='Normal'] => p:fresh",
      //     "p[style-name='AlignedCenter'] => p.text-center:fresh",
      //     "p[style-name='AlignedRight'] => p.text-right:fresh",
      //   ],
      // };

      // const result = await mammoth.convertToHtml(
      //   { arrayBuffer },
      //   mammothOptions
      // );
      // const htmlContent = result.value;
      // console.log(htmlContent, "htmllll");
      setEditorContent(url);
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
      console.log(element.tagName, "tagss", element);
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
          console.log("table inside figure");
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
        console.log("table outside figure");
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
    const docxBlob = htmlDocx.asBlob(formattedContent);
    saveAs(docxBlob);
    return;
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

  // Save the document in the dashboard list
  const saveDocument = async () => {
    setButtonLoading(true);

    // Create Word document as a Blob
    // const docBlob = await createWordDocument();
    // const blob = new Blob([editorContent]);
    // saveAs(blob, "editor-content.html"); // Use FileSaver.js's saveAs

    // return
    // Prepare FormData with the document Blob
    const formData = new FormData();
    formData.append("fileName", editorContent);
    // formData.append("file", blob);

    try {
      // Make a PATCH request with the document
      const response = await fetch(`${apiURL}/meeting-agenda-template/${id}`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });
      console.log(formData, "tokennn2");
      if (response.ok) {
        toast.success("Document saved successfully!");

        // Optionally update your document list
        const newDoc = {
          name: currentDocName,
          content: editorContent,
        };

        setDocuments([...documents, newDoc]);
        navigate("/document-template");
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
          <h1 className="mb-4">Document Template Generator</h1>

          {/* CKEditor for writing content */}
          <JoditEditor
            ref={editor}
            value={editorContent}
            onChange={(newContent) => {
              setEditorContent(newContent);
            }}
          />
          {/* <CKEditor
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
          /> */}

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
              "Save Document"
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

export default TemplateGenerator;
