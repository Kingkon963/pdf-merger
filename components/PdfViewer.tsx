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
        <iframe src={pdfUrl} data-type="application/pdf" className="h-1/2" />
      )}
    </>
  );
};

export default PdfViewer;
