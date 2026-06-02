/**
 * pdfExport.js
 * PDF generation using html2pdf.js (loaded from CDN).
 */

let html2pdfLoaded = false;

/** Ensure html2pdf.js is loaded from CDN */
async function ensureHtml2Pdf() {
  if (html2pdfLoaded && window.html2pdf) return;

  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      html2pdfLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js";
    script.onload = () => {
      html2pdfLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load html2pdf.js"));
    document.head.appendChild(script);
  });
}

/**
 * Export the resume preview to PDF.
 * @param {HTMLElement} element - The .resume-paper element
 * @param {string} [filename='resume'] - Output filename (without extension)
 */
export async function exportToPdf(element, filename = "resume") {
  await ensureHtml2Pdf();

  const opt = {
    margin: 0,
    filename: `${filename}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await window.html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.error("PDF export error:", err);
    throw err;
  }
}
