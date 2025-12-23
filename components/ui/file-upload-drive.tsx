"use client";

import * as React from "react";
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Represents an uploaded file stored in Google Drive
 */
export interface UploadedFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Internal state for tracking upload progress
 */
interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  result?: UploadedFile;
  error?: string;
}

export interface FileUploadDriveProps {
  value?: UploadedFile | UploadedFile[] | null;
  onChange?: (value: UploadedFile | UploadedFile[] | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  error?: boolean;
  disabled?: boolean;
  className?: string;
  sessionId?: string; // Optional session ID for organizing uploads
  fieldName?: string; // Field name for tracking
}

/**
 * File upload component that immediately uploads to Google Drive
 * Returns file IDs instead of File objects to avoid payload size limits
 */
export function FileUploadDrive({
  value,
  onChange,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB per file
  error,
  disabled,
  className,
  sessionId,
  fieldName,
}: FileUploadDriveProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploads, setUploads] = React.useState<FileUploadState[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Convert value to array for easier handling
  const uploadedFiles = React.useMemo(() => {
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
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    // Validate file sizes
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`הקובץ ${file.name} גדול מדי. גודל מקסימלי: ${formatFileSize(maxSize)}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create upload states for each file
    const newUploads: FileUploadState[] = validFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      await uploadFile(file, uploads.length + i);
    }
  };

  const uploadFile = async (file: File, index: number) => {
    // Update status to uploading
    setUploads((prev) =>
      prev.map((u, i) =>
        u.file === file ? { ...u, status: 'uploading' as const, progress: 10 } : u
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sessionId) formData.append('sessionId', sessionId);
      if (fieldName) formData.append('fieldName', fieldName);

      // Simulate progress (actual progress would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file && u.status === 'uploading'
              ? { ...u, progress: Math.min(u.progress + 20, 90) }
              : u
          )
        );
      }, 200);

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה בהעלאת הקובץ');
      }

      const result = await response.json();

      // Update status to success
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? {
                ...u,
                status: 'success' as const,
                progress: 100,
                result: {
                  fileId: result.fileId,
                  fileName: result.fileName,
                  fileSize: result.fileSize,
                  mimeType: result.mimeType,
                },
              }
            : u
        )
      );

      // Update value with new uploaded file
      const uploadedFile: UploadedFile = {
        fileId: result.fileId,
        fileName: result.fileName,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
      };

      if (multiple) {
        onChange?.([...uploadedFiles, uploadedFile]);
      } else {
        onChange?.(uploadedFile);
      }
    } catch (err) {
      console.error('Upload error:', err);

      // Update status to error
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? {
                ...u,
                status: 'error' as const,
                error: err instanceof Error ? err.message : 'שגיאה בהעלאה',
              }
            : u
        )
      );
    }
  };

  const handleRemoveFile = (fileId: string) => {
    if (multiple) {
      const newFiles = uploadedFiles.filter((f) => f.fileId !== fileId);
      onChange?.(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange?.(null);
    }

    // Also remove from uploads state
    setUploads((prev) => prev.filter((u) => u.result?.fileId !== fileId));
  };

  const handleRemoveUpload = (file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Check if there are any active uploads
  const isUploading = uploads.some((u) => u.status === 'uploading');

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
          !isDragging && !error && "border-neutral-300 hover:border-neutral-700",
          error && "border-red-500",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />

        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-neutral-200 transition-smooth",
            isDragging && "bg-primary/10"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <Upload
              className={cn(
                "w-6 h-6 transition-smooth",
                isDragging ? "text-primary" : "text-neutral-700"
              )}
            />
          )}
        </div>

        <div className="text-center">
          <p className="text-body font-medium text-neutral-900 mb-1">
            {isUploading
              ? "מעלה קבצים..."
              : isDragging
              ? "שחררו לצירוף הקובץ"
              : "גררו קובץ לכאן או לחצו לבחירה"}
          </p>
          <p className="text-body-small text-neutral-700">
            {accept ? `קבצים נתמכים: ${accept}` : "כל סוגי הקבצים נתמכים"}
            {" • "}
            גודל מקסימלי: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* Active uploads */}
      {uploads.filter((u) => u.status !== 'success').length > 0 && (
        <div className="space-y-2">
          {uploads
            .filter((u) => u.status !== 'success')
            .map((upload, index) => (
              <div
                key={`upload-${index}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  upload.status === 'error' ? "bg-red-50" : "bg-neutral-100"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded flex items-center justify-center",
                    upload.status === 'error' ? "bg-red-100" : "bg-primary/10"
                  )}
                >
                  {upload.status === 'uploading' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : upload.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <File className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-neutral-900 truncate">
                    {upload.file.name}
                  </p>
                  {upload.status === 'uploading' && (
                    <div className="mt-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-caption text-red-600">{upload.error}</p>
                  )}
                </div>
                {upload.status === 'error' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUpload(upload.file);
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 text-red-500 transition-smooth"
                    aria-label="הסר"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.fileId}
              className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-neutral-900 truncate">
                  {file.fileName}
                </p>
                <p className="text-caption text-green-700">
                  הועלה בהצלחה • {formatFileSize(file.fileSize)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(file.fileId);
                }}
                disabled={disabled}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full",
                  "flex items-center justify-center",
                  "hover:bg-red-50 text-neutral-700 hover:text-red-500",
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
