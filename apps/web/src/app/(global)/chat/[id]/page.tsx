"use client";

import React, { useEffect, useRef, useState } from "react";
import InputField from "../_components/input-field";
import { useChatStore } from "../_components/chat-store";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AnimatePresence, motion } from "framer-motion";
import MarkdownRenderer from "@/components/molecules/markdown-renderer";
// import Logo from "@/components/atoms/dynamic-icons/logo";
import {
  Square2StackIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function ChatThreadPage() {
  const endOfChatThreadRef = useRef<HTMLDivElement | null>(null);
  const streamingStartedRef = useRef<boolean>(false);
  const streamingCompleteRef = useRef<boolean>(false);

  const { threadHistory, chatLoading } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [expandedHtml, setExpandedHtml] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!threadHistory.length) return;

    const lastMessage = threadHistory[threadHistory.length - 1];
    const isModelLastMessage = lastMessage && lastMessage.role === "model";

    if (isModelLastMessage && chatLoading && !streamingStartedRef.current) {
      setIsStreaming(true);
      streamingStartedRef.current = true;
      streamingCompleteRef.current = false;

      setTimeout(() => {
        if (
          threadHistory.length >= 2 &&
          threadHistory[threadHistory.length - 2]?.role === "user" &&
          threadHistory[threadHistory.length - 1]?.role === "model"
        ) {
          const userMessageElement = document.querySelector(
            `[data-message-index="${threadHistory.length - 2}"]`
          );
          if (userMessageElement) {
            userMessageElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }, 100);
    }

    if (
      !chatLoading &&
      streamingStartedRef.current &&
      !streamingCompleteRef.current
    ) {
      setIsStreaming(false);
      streamingStartedRef.current = false;
      streamingCompleteRef.current = true;

      setTimeout(() => {
        if (endOfChatThreadRef.current) {
          endOfChatThreadRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }

    if (
      !isStreaming &&
      threadHistory.length > 0 &&
      !streamingStartedRef.current
    ) {
      setTimeout(() => {
        endOfChatThreadRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [threadHistory, chatLoading, isStreaming]);

  useEffect(() => {
    if (!threadHistory.length) return;
    const lastMessage = threadHistory[threadHistory.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      streamingStartedRef.current = false;
      streamingCompleteRef.current = false;
      setIsStreaming(false);
    }
  }, [threadHistory]);

  const parseContent = (content: string) => {
    const markdownMatch = content.match(/\[MARKDOWN\]([\s\S]*?)(?:\[HTML\]|$)/);
    const htmlMatch = content.match(/\[HTML\]([\s\S]*?)$/);

    const markdownContent =
      markdownMatch && markdownMatch[1] ? markdownMatch[1].trim() : content;
    const htmlContent = htmlMatch && htmlMatch[1] ? htmlMatch[1].trim() : null;

    return {
      markdown: markdownContent,
      html: htmlContent,
      hasMultipleFormats: !!(markdownMatch && htmlMatch),
    };
  };

  const copyToClipboard = (content: string, type: "text" | "html" = "text") => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast.success(
          type === "html" ? "HTML copied to clipboard" : "Copied to clipboard"
        );
      },
      (error) => {
        throw new Error(
          typeof error === "string" ? error : JSON.stringify(error)
        );
      }
    );
  };

  const downloadAsPDF = async (htmlContent: string) => {
    const toastId = toast.loading("Generating PDF...");

    try {
      // Create a temporary container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "210mm"; // A4 width
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        logging: false,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add image to PDF with JPEG compression for smaller file size
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const filename = `terms-of-service-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);

      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const scrollToBottom = () => {
    endOfChatThreadRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      endOfChatThreadRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="flex max-w-[840px] max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide min-w-2/5 flex-col items-center w-full  h-full pt-5">
        <div className="flex flex-col space-y-2 transition-all pt-12 w-full">
          {threadHistory.map((message, index) => {
            const userMsg = message.role === "user";
            const textContent = message.parts[0]?.text ?? "";
            const parsedContent = parseContent(textContent);

            return (
              <div
                key={index}
                className="flex items-start justify-start space-x-4"
                data-user-message={userMsg}
                data-message-index={index}
              >
                <div className="flex grow flex-col space-y-2">
                  <div
                    className={`prose prose-sm max-w-none text-sm font-normal text-text-title -tracking-[0.5%] leading-[150%] dark:prose-invert  ${userMsg ? "w-fit ml-auto" : "min-w-full"}`}
                  >
                    <div className="flex flex-col items-end gap-y-1">
                      {/* image from user here if userMsg is true */}
                      <div
                        className={`min-h-[53px] ${userMsg ? "rounded-l-full rounded-r-full bg-bg-light2 w-fit flex items-center justify-center px-4" : "w-full"}`}
                      >
                        <MarkdownRenderer text={parsedContent.markdown} />
                      </div>
                    </div>
                  </div>
                  {isStreaming && index === threadHistory.length - 1 && (
                    <div
                      className={`mr-auto flex w-fit justify-start text-primary`}
                    >
                      <div className="loader"></div>
                    </div>
                  )}
                  {!isStreaming && !userMsg && (
                    <div className="mr-auto flex flex-col gap-3 w-full">
                      <div className="flex w-fit gap-2 items-center justify-start">
                        <button
                          onClick={() => {
                            copyToClipboard(parsedContent.markdown, "text");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-light2 hover:bg-bg-light3 transition-colors border border-border-base group"
                          title="Copy as text"
                        >
                          <Square2StackIcon className="size-4 text-icon-label stroke-[1.5px] group-hover:text-icon-title transition-colors" />
                          <span className="text-xs font-medium text-text-label group-hover:text-text-title transition-colors">
                            Copy Text
                          </span>
                        </button>
                        {parsedContent.hasMultipleFormats &&
                          parsedContent.html && (
                            <>
                              <button
                                onClick={() => {
                                  copyToClipboard(parsedContent.html!, "html");
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-light2 hover:bg-bg-light3 transition-colors border border-border-base group"
                                title="Copy as HTML"
                              >
                                <CodeBracketIcon className="size-4 text-icon-label stroke-[1.5px] group-hover:text-icon-title transition-colors" />
                                <span className="text-xs font-medium text-text-label group-hover:text-text-title transition-colors">
                                  Copy HTML
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  void downloadAsPDF(parsedContent.html!);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg bg-bg-base-inv hover:bg-opacity-90 transition-colors group"
                                title="Download as PDF"
                              >
                                <ArrowDownTrayIcon className="size-4 text-icon-white-inv stroke-[1.5px]" />
                                <span className="text-xs font-medium text-text-white-inv">
                                  Download PDF
                                </span>
                              </button>
                            </>
                          )}
                      </div>

                      {parsedContent.hasMultipleFormats &&
                        parsedContent.html && (
                          <div className="w-full border border-border-base rounded-lg overflow-hidden bg-bg-light2">
                            <button
                              onClick={() => {
                                setExpandedHtml((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }));
                                scrollToBottom();
                              }}
                              className="w-full flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-bg-light3 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <CodeBracketIcon className="size-4 text-icon-label stroke-[1.5px]" />
                                <span className="text-xs font-medium text-text-label">
                                  View HTML Source
                                </span>
                              </div>
                              {expandedHtml[index] ? (
                                <ChevronDownIcon className="size-4 text-icon-label stroke-[1.5px]" />
                              ) : (
                                <ChevronRightIcon className="size-4 text-icon-label stroke-[1.5px]" />
                              )}
                            </button>
                            <AnimatePresence>
                              {expandedHtml[index] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                  className="border-t border-border-base overflow-hidden"
                                >
                                  <pre className="p-4 overflow-x-auto text-xs font-mono max-w-full text-text-title bg-bg-light max-h-[400px] overflow-y-auto w-full">
                                    <code className="whitespace-pre-wrap">
                                      {parsedContent.html}
                                    </code>
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <AnimatePresence>
            {isStreaming && (
              <motion.div
                initial={{ height: 250 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <div ref={endOfChatThreadRef} style={{ height: "1px" }} />
        </div>
      </div>
      <div className="w-full max-w-[840px] min-w-2/5 sticky bottom-0 pt-4 mb-4">
        <InputField />
      </div>
    </div>
  );
}
