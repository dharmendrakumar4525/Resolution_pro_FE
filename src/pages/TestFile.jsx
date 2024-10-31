import React, { useEffect, useState } from "react";
import mammoth from "mammoth";

const TestFile = ({ fileUrl }) => {
  const [docxText, setDocxText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndReadDocx = async () => {
      try {
        const response = await fetch(
          "https://gamerji-dharmendra.s3.amazonaws.com/agendas/BoardN.docx"
        );
        const arrayBuffer = await response.arrayBuffer();
        const docxBuffer = Buffer.from(arrayBuffer);

        // Use Mammoth to extract text from the DOCX file
        const result = await mammoth.extractRawText({ buffer: docxBuffer });
        setDocxText(result.value);
      } catch (error) {
        console.error("Error fetching or parsing DOCX:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndReadDocx();
  }, [fileUrl]);

  return (
    <div>
      {loading ? (
        <p>Loading DOCX file...</p>
      ) : (
        <div>
          <h3>Document Content:</h3>
          <pre>{docxText}</pre>
        </div>
      )}
    </div>
  );
};

export default TestFile;
