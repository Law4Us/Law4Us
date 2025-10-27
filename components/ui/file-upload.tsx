"use client";

import * as React from "react";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  value?: File | File[] | null;
  onChange?: (value: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  error,
  disabled,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const files = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    // Validate file sizes
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(
          `הקובץ ${file.name} גדול מדי. גודל מקסימלי: ${formatFileSize(maxSize)}`
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (multiple) {
      onChange?.(validFiles);
    } else {
      onChange?.(validFiles[0]);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (multiple) {
      const newFiles = files.filter((_, i) => i !== index);
      onChange?.(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange?.(null);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8",
          "flex flex-col items-center justify-center gap-3",
          "transition-smooth cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          !isDragging && !error && "border-neutral hover:border-neutral-dark",
          error && "border-red-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
        />

        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-neutral-light transition-smooth",
            isDragging && "bg-primary/10"
          )}
        >
          <Upload
            className={cn(
              "w-6 h-6 transition-smooth",
              isDragging ? "text-primary" : "text-neutral-dark"
            )}
          />
        </div>

        <div className="text-center">
          <p className="text-body font-medium text-neutral-darkest mb-1">
            {isDragging
              ? "שחררו לצירוף הקובץ"
              : "גררו קובץ לכאן או לחצו לבחירה"}
          </p>
          <p className="text-body-small text-neutral-dark">
            {accept
              ? `קבצים נתמכים: ${accept}`
              : "כל סוגי הקבצים נתמכים"}
            {" • "}
            גודל מקסימלי: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 bg-neutral-lightest rounded-lg"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-neutral-darkest truncate">
                  {file.name}
                </p>
                <p className="text-caption text-neutral-dark">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                disabled={disabled}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full",
                  "flex items-center justify-center",
                  "hover:bg-red-50 text-neutral-dark hover:text-red-500",
                  "transition-smooth",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label="הסר קובץ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
