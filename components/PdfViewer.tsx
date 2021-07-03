import { useEffect, useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";

const PdfViewer = ({ url }: { url: string }) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    setPdfUrl(url);
  }, [url]);

  return (
    <>
      {pdfUrl && (
        <iframe
          src={pdfUrl + "#toolbar=0&navpanes=0"}
          data-type="application/pdf"
          className="h-full"
        />
      )}
    </>
  );
};

export default PdfViewer;
