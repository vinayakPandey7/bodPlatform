"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Download } from "lucide-react";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string | null;
  candidateName?: string;
  onDownload?: () => void;
  downloadFileName?: string;
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  resumeUrl,
  candidateName,
  onDownload,
  downloadFileName,
}: ResumePreviewModalProps) {
  const [pdfViewError, setPdfViewError] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("ResumePreviewModal - isOpen:", isOpen);
    console.log("ResumePreviewModal - resumeUrl:", resumeUrl);
    console.log("ResumePreviewModal - candidateName:", candidateName);
  }, [isOpen, resumeUrl, candidateName]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen && resumeUrl) {
      console.log("Setting up PDF viewer for URL:", resumeUrl);
      setPdfViewError(false);
    } else {
      setPdfViewError(false);
    }
  }, [isOpen, resumeUrl]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else if (resumeUrl) {
      // Default download behavior
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = downloadFileName || "resume.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            Resume Preview{candidateName ? ` - ${candidateName}` : ""}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-4">
          {!resumeUrl ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No resume available</p>
            </div>
          ) : pdfViewError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mb-4 mx-auto" />
                <p className="text-gray-600 mb-4">
                  Unable to preview this file format.
                </p>
                <button
                  onClick={handleDownloadClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Instead
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const iframeUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
                resumeUrl.startsWith("http")
                  ? resumeUrl
                  : window.location.origin + resumeUrl
              )}&embedded=true`;
              console.log("Generated iframe URL:", iframeUrl);

              return (
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0 rounded"
                  title="Resume Preview"
                  onLoad={() => {
                    console.log("PDF loaded successfully");
                  }}
                  onError={() => {
                    console.log("PDF loading error occurred");
                    setPdfViewError(true);
                  }}
                />
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
