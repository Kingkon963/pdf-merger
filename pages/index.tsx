import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import { PDFDocument, PageSizes } from "pdf-lib";

import styles from "../styles/Home.module.css";
import PdfViewer from "../components/PdfViewer";

interface SetMethod {
  (v: PDFDocument): any;
}

export default function Home() {
  const [topPDF, setTopPDF] = useState<PDFDocument | null>();
  const [topPdfUrl, setTopPdfUrl] = useState<string>("");
  const [scriptPDF, setScriptPDF] = useState<PDFDocument | null>();
  const [scriptPdfUrl, setScriptPdfUrl] = useState<string>("");
  const [mergedPDF, setMergedPDF] = useState<PDFDocument | null>();
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const getPdfUrl = async (doc: PDFDocument) => {
    try {
      const bytes = await doc.save();
      return URL.createObjectURL(
        new Blob([bytes], { type: "application/pdf" })
      );
    } catch (e) {
      console.log(e);
      setError(e.toString());
    }
  };

  const setPdfUrl = useCallback(async (doc: PDFDocument, settr: any) => {
    const url = await getPdfUrl(doc);
    if (settr) settr(url);
  }, []);

  useEffect(() => {
    if (topPDF) {
      setPdfUrl(topPDF, setTopPdfUrl);
    }
  }, [setPdfUrl, topPDF]);

  useEffect(() => {
    if (scriptPDF) {
      setPdfUrl(scriptPDF, setScriptPdfUrl);
    }
  }, [scriptPDF, setPdfUrl]);

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
      if (pdfURL) setMergedPdfUrl(pdfURL);
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

      <main className="h-screen flex flex-col text-2xs">
        {/* <div className="py-4 flex justify-center gap-3">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/LogoAust.jpg"
            width="38"
            height="50"
            alt="AUST Logo"
          />
          <h1 className="text-center text-4xl font-bold ">PDF merger</h1>
        </div> */}
        <div className="lg:grid lg:grid-cols-2 flex-grow sm:h-3/6 ">
          <div className="flex flex-col justify-center items-center border-r-4 border-gray-600">
            <label
              htmlFor="topPage"
              className=" lg:text-xl bg-gray-700 w-full text-center text-white py-5 select-none cursor-pointer"
            >
              Select Top Page
            </label>
            <div className="flex-grow bg-white flex items-center">
              {!topPDF && (
                <div className="flex justify-center w-full items-center h-24 lg:h-auto">
                  <input
                    id="topPage"
                    type="file"
                    onChange={(e) => fileChangeHandler(e)}
                    accept=".pdf"
                    className="w-10/12"
                  />
                </div>
              )}
              {topPDF && topPdfUrl && (
                <div className="sm:h-5/6">
                  <PdfViewer url={topPdfUrl} />
                  <h3 className="text-center bg-black text-white relative">
                    {topPDF.getPageCount()} Pages
                    <button
                      className="ml-auto absolute right-1 text-red-400"
                      onClick={() => setTopPDF(null)}
                    >
                      Remove
                    </button>
                  </h3>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <label
              htmlFor="scriptPage"
              className=" lg:text-xl bg-gray-700 w-full text-center text-white py-5 select-none cursor-pointer"
            >
              Select Script Page
            </label>
            <div className="flex-grow bg-white flex items-center">
              {!scriptPDF && (
                <div className="flex justify-center w-full items-center h-24 lg:h-auto">
                  <input
                    id="scriptPage"
                    type="file"
                    onChange={(e) => fileChangeHandler(e)}
                    accept=".pdf"
                    className="w-10/12"
                  />
                </div>
              )}
              {scriptPDF && scriptPdfUrl && (
                <div className="sm:h-5/6">
                  <PdfViewer url={scriptPdfUrl} />
                  <h3 className="text-center bg-black text-white relative">
                    {scriptPDF.getPageCount()} Pages
                    <button
                      className="ml-auto absolute right-1 text-red-400"
                      onClick={() => setScriptPDF(null)}
                    >
                      Remove
                    </button>
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && (
          <div className="absolute p-5 bg-black left-0 bottom-0 lg:left-7 lg:bottom-7">
            <p className="text-red-500 text-center text-sm py-1">{error}</p>
          </div>
        )}
        <div className="bg-gray-600 h-5/6 sm:h-3/6 flex sm:flex-row gap-24 items-center justify-center">
          {!mergedPdfUrl && (
            <button
              className="bg-green-600 p-5 px-32 text-white lg:text-3xl rounded-lg"
              onClick={merge}
            >
              Merge
            </button>
          )}
          {mergedPdfUrl && (
            <div className="flex flex-col lg:flex-row sm:gap-24 sm:h-2/3 items-center">
              <div className="self-stretch">
                <PdfViewer url={mergedPdfUrl} />
                <h3 className="text-center text-white bg-black">
                  {mergedPDF?.getPageCount()} Pages
                </h3>
              </div>
              <div className="flex flex-col">
                <a
                  href={mergedPdfUrl}
                  className="bg-green-600 text-md p-5 self-stretch lg:self-auto text-center px-28 text-white lg:text-3xl rounded-lg"
                  download
                >
                  Download
                </a>
                <button
                  className="self-end hover:text-white"
                  onClick={() => {
                    setMergedPDF(null);
                    setMergedPdfUrl("");
                  }}
                >
                  Merge Again?
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
