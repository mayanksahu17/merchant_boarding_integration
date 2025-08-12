import { useEffect, useState, useRef } from "react";
import { Download, X, FileText, Maximize2, Minimize2 } from "lucide-react";

export default function Guide() {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const dialogRef = useRef(null);
  const pdfHref = "/dummy.pdf";

  // Close on ESC + lock scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Backdrop click to close
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  // Compose container size classes
  const modalSize =
    "w-full " +
    (fullscreen
      ? "max-w-[95vw] h-[92vh]"
      : "max-w-[80rem] h-[88vh] md:max-w-[90rem] md:h-[90vh]");

  return (
    <div className="p-4">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[.99] text-white rounded-lg shadow-md transition"
      >
        <FileText className="w-5 h-5" />
        Guide
      </button>

      {open && (
        <div
          onClick={onBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-title"
        >
          <div
            ref={dialogRef}
            className={`relative ${modalSize} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden transition-all`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/60 dark:to-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2
                  id="guide-title"
                  className="text-base md:text-lg font-semibold truncate"
                  title="Guide.pdf"
                >
                  Guide.pdf
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* <button
                  onClick={() => setFullscreen((v) => !v)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
                  title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {fullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Exit</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </>
                  )}
                </button> */}

                <a
                  href={pdfHref}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm shadow"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-red-500 hover:bg-red-600 text-white shadow"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="w-full h-full">
              <iframe
                src={pdfHref}
                title="Guide PDF"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
