import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { PDFDocument, PageSizes } from "pdf-lib";

import styles from "../styles/Home.module.css";
import PdfViewer from "../components/PdfViewer";

interface SetMethod {
  (v: PDFDocument): any;
}

const getPdfUrl = (bytes: Uint8Array) => {
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
};

export default function Home() {
  const [topPDF, setTopPDF] = useState<PDFDocument>();
  const [scriptPDF, setScriptPDF] = useState<PDFDocument>();
  const [pdfURL, setPdfUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (topPDF) {
      console.log(topPDF);
    }
  }, [topPDF]);

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
      const scriptPages = await topPDF.copyPages(
        scriptPDF,
        scriptPDF.getPageIndices()
      );
      scriptPages.map((page) => {
        topPDF.addPage(page);
      });

      const pdfBytes = await topPDF.save();
      const pdfURL = getPdfUrl(pdfBytes);
      setPdfUrl(pdfURL);
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
              className="mb-5 text-xl mb-auto bg-gray-700 w-full text-center text-white py-5 select-none cursor-pointer"
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
            {topPDF && <h1>PDF</h1>}
          </div>
          <div className="flex flex-col justify-center items-center">
            <label
              htmlFor="scriptPage"
              className="mb-5 text-xl mb-auto bg-gray-500 w-full text-center text-white py-5 select-none cursor-pointer"
            >
              Select Script Page
            </label>
            <input
              id="scriptPage"
              type="file"
              onChange={(e) => fileChangeHandler(e)}
              accept=".pdf"
              className="mb-auto ml-24"
            />
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
          {!pdfURL && (
            <button
              className="bg-green-600 p-5 px-32 text-white text-3xl rounded-lg"
              onClick={merge}
            >
              Merge
            </button>
          )}
          {pdfURL && <PdfViewer url={pdfURL} />}
          {pdfURL && (
            <a
              href={pdfURL + "#toolbar=0&navpanes=0"}
              className="bg-green-600 p-5 px-32 text-white text-3xl rounded-lg"
              download
            >
              Download
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
