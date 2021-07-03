import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { PDFDocument, PageSizes } from "pdf-lib";

import styles from "../styles/Home.module.css";
import PdfViewer from "../components/PdfViewer";

interface SetMethod {
  (v: PDFDocument): any;
}

const getPdfUrl = async (doc: PDFDocument) => {
  const bytes = await doc.save();
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
};

const setPdfUrl = async (doc: PDFDocument, settr: any) => {
  const url = await getPdfUrl(doc);
  if (settr) settr(url);
};

export default function Home() {
  const [topPDF, setTopPDF] = useState<PDFDocument>();
  const [topPdfUrl, setTopPdfUrl] = useState<string>("");
  const [scriptPDF, setScriptPDF] = useState<PDFDocument>();
  const [scriptPdfUrl, setScriptPdfUrl] = useState<string>("");
  const [mergedPDF, setMergedPDF] = useState<PDFDocument>();
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (topPDF) {
      setPdfUrl(topPDF, setTopPdfUrl);
    }
  }, [topPDF]);

  useEffect(() => {
    if (scriptPDF) {
      setPdfUrl(scriptPDF, setScriptPdfUrl);
    }
  }, [scriptPDF]);

  const readAndSetPDF = async (files: FileList, set: SetMethod) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const arrayBuffer = this.result;
      if (arrayBuffer) {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        set(pdfDoc);
      }
    };

    if (files.length) {
      setError("");
      if (files[0].type === "application/pdf")
        reader.readAsArrayBuffer(files[0]);
      else setError(`Slected File [${files[0].name}] is not a PDF`);
    }
  };

  const fileChangeHandler = (e: any) => {
    const node: HTMLInputElement = e.target;
    if (node.id === "topPage" && node.files) {
      readAndSetPDF(node.files, setTopPDF);
    } else if (node.id === "scriptPage" && node.files) {
      readAndSetPDF(node.files, setScriptPDF);
    }
  };

  const merge = async () => {
    if (topPDF && scriptPDF) {
      setError("");
      const mergedPdfDoc = await PDFDocument.create();
      const TopPages = await mergedPdfDoc.copyPages(
        topPDF,
        topPDF.getPageIndices()
      );
      TopPages.map((page) => mergedPdfDoc.addPage(page));

      const scriptPages = await mergedPdfDoc.copyPages(
        scriptPDF,
        scriptPDF.getPageIndices()
      );
      scriptPages.map((page) => mergedPdfDoc.addPage(page));

      setMergedPDF(mergedPdfDoc);

      const pdfURL = await getPdfUrl(mergedPdfDoc);
      setMergedPdfUrl(pdfURL);
    } else {
      setError("Please choose the Top Page and the Script Page first to Merge");
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PDF Merger</title>
        <meta
          name="description"
          content="PDF merger created for AUST students"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen">
        <div className="py-4 flex justify-center gap-3">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/LogoAust.jpg"
            width="38"
            height="50"
            alt="AUST Logo"
          />
          <h1 className="text-center text-4xl font-bold ">PDF merger</h1>
        </div>
        <div className="grid lg:grid-cols-2 h-3/6">
          <div className="flex flex-col justify-center items-center border-r-4 border-gray-600">
            <label
              htmlFor="topPage"
              className="text-xl mb-auto bg-gray-700 w-full text-center text-white py-5 select-none cursor-pointer"
            >
              Select Top Page
            </label>
            {!topPDF && (
              <input
                id="topPage"
                type="file"
                onChange={(e) => fileChangeHandler(e)}
                accept=".pdf"
                className="mb-auto ml-24"
              />
            )}
            {topPDF && topPdfUrl && (
              <div className="mb-auto h-2/3">
                <PdfViewer url={topPdfUrl} />
                <h3 className="text-center">{topPDF.getPageCount()} Pages</h3>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center items-center">
            <label
              htmlFor="scriptPage"
              className="text-xl mb-auto bg-gray-500 w-full text-center text-white py-5 select-none cursor-pointer"
            >
              Select Script Page
            </label>
            {!scriptPDF && (
              <input
                id="scriptPage"
                type="file"
                onChange={(e) => fileChangeHandler(e)}
                accept=".pdf"
                className="mb-auto ml-24"
              />
            )}
            {scriptPDF && scriptPdfUrl && (
              <div className="mb-auto h-2/3">
                <PdfViewer url={scriptPdfUrl} />
                <h3 className="text-center">
                  {scriptPDF.getPageCount()} Pages
                </h3>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1">
          {error && (
            <p className="text-red-500 text-center text-2xl bg-black py-1">
              {error}
            </p>
          )}
        </div>
        <div className="bg-gray-600 h-3/6 flex gap-24 items-center justify-center">
          {!mergedPdfUrl && (
            <button
              className="bg-green-600 p-5 px-32 text-white text-3xl rounded-lg"
              onClick={merge}
            >
              Merge
            </button>
          )}
          {mergedPdfUrl && (
            <>
              <div className="h-2/3">
                <PdfViewer url={mergedPdfUrl} />
                <h3 className="text-center">
                  {mergedPDF?.getPageCount()} Pages
                </h3>
              </div>
              <a
                href={mergedPdfUrl}
                className="bg-green-600 p-5 px-32 text-white text-3xl rounded-lg"
                download
              >
                Download
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
