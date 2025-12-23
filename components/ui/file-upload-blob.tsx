"use client";

import * as React from "react";
import { upload } from "@vercel/blob/client";
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage, isCompressibleImage } from "@/lib/utils/image-compression";

/**
 * Represents an uploaded file stored in Vercel Blob
 */
export interface BlobFile {
  url: string;
  pathname: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Internal state for tracking upload progress
 */
interface FileUploadState {
  id: string;
  file: File;
  status: "pending" | "compressing" | "uploading" | "success" | "error";
  progress: number;
  result?: BlobFile;
  error?: string;
}

export interface FileUploadBlobProps {
  value?: BlobFile | BlobFile[] | null;
  onChange?: (value: BlobFile | BlobFile[] | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes (before compression)
  maxFiles?: number; // max number of files
  error?: boolean;
  disabled?: boolean;
  className?: string;
  compressImages?: boolean; // whether to compress images before upload
}

/**
 * File upload component using Vercel Blob for direct uploads
 *
 * Benefits:
 * - Bypasses Vercel's 4.5MB serverless limit entirely
 * - Files upload directly from browser to Blob storage
 * - Supports files up to 50MB each
 * - Shows real upload progress
 * - Optional image compression before upload
 */
export function FileUploadBlob({
  value,
  onChange,
  accept,
  multiple = false,
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 20,
  error,
  disabled,
  className,
  compressImages = true,
}: FileUploadBlobProps) {
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
      inputRef.current.value = "";
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    // Check max files limit
    const totalFiles = uploadedFiles.length + newFiles.length;
    if (totalFiles > maxFiles) {
      alert(`ניתן להעלות עד ${maxFiles} קבצים. יש לכם כבר ${uploadedFiles.length}.`);
      return;
    }

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
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "pending" as const,
      progress: 0,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Upload each file
    for (const uploadState of newUploads) {
      await uploadFile(uploadState);
    }
  };

  const uploadFile = async (uploadState: FileUploadState) => {
    const { id, file } = uploadState;
    let fileToUpload = file;

    // Compress images if enabled
    if (compressImages && isCompressibleImage(file)) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: "compressing" as const, progress: 0 } : u
        )
      );

      try {
        fileToUpload = await compressImage(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.8,
          maxSizeKB: 1024, // Target 1MB for better quality
        });
        console.log(
          `📷 Compressed ${file.name}: ${formatFileSize(file.size)} → ${formatFileSize(fileToUpload.size)}`
        );
      } catch (err) {
        console.warn(`Failed to compress ${file.name}, using original:`, err);
      }
    }

    // Update status to uploading
    setUploads((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "uploading" as const, progress: 5 } : u
      )
    );

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const pathname = `uploads/${timestamp}-${safeName}`;

      // Upload directly to Vercel Blob
      const blob = await upload(pathname, fileToUpload, {
        access: "public",
        handleUploadUrl: "/api/upload-blob",
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploads((prev) =>
            prev.map((u) =>
              u.id === id && u.status === "uploading" ? { ...u, progress } : u
            )
          );
        },
      });

      // Update status to success
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: "success" as const,
                progress: 100,
                result: {
                  url: blob.url,
                  pathname: blob.pathname,
                  fileName: file.name,
                  fileSize: fileToUpload.size,
                  mimeType: fileToUpload.type,
                },
              }
            : u
        )
      );

      // Update value with new uploaded file
      const blobFile: BlobFile = {
        url: blob.url,
        pathname: blob.pathname,
        fileName: file.name,
        fileSize: fileToUpload.size,
        mimeType: fileToUpload.type,
      };

      if (multiple) {
        onChange?.([...uploadedFiles, blobFile]);
      } else {
        onChange?.(blobFile);
      }
    } catch (err) {
      console.error("Upload error:", err);

      // Update status to error
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: "error" as const,
                error: err instanceof Error ? err.message : "שגיאה בהעלאה",
              }
            : u
        )
      );
    }
  };

  const handleRemoveFile = (url: string) => {
    if (multiple) {
      const newFiles = uploadedFiles.filter((f) => f.url !== url);
      onChange?.(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange?.(null);
    }

    // Also remove from uploads state
    setUploads((prev) => prev.filter((u) => u.result?.url !== url));
  };

  const handleRemoveUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const handleRetryUpload = async (id: string) => {
    const uploadState = uploads.find((u) => u.id === id);
    if (uploadState) {
      await uploadFile({ ...uploadState, status: "pending", progress: 0, error: undefined });
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Check if there are any active uploads
  const isUploading = uploads.some(
    (u) => u.status === "uploading" || u.status === "compressing"
  );

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
            {accept ? `קבצים נתמכים: ${accept}` : "תמונות ו-PDF נתמכים"}
            {" • "}
            עד {formatFileSize(maxSize)} לקובץ
            {multiple && ` • עד ${maxFiles} קבצים`}
          </p>
        </div>
      </div>

      {/* Active uploads */}
      {uploads.filter((u) => u.status !== "success").length > 0 && (
        <div className="space-y-2">
          {uploads
            .filter((u) => u.status !== "success")
            .map((uploadState) => (
              <div
                key={uploadState.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  uploadState.status === "error" ? "bg-red-50" : "bg-neutral-100"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded flex items-center justify-center",
                    uploadState.status === "error" ? "bg-red-100" : "bg-primary/10"
                  )}
                >
                  {uploadState.status === "compressing" ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : uploadState.status === "uploading" ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : uploadState.status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <FileIcon className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-neutral-900 truncate">
                    {uploadState.file.name}
                  </p>
                  {uploadState.status === "compressing" && (
                    <p className="text-caption text-primary">מכווץ תמונה...</p>
                  )}
                  {uploadState.status === "uploading" && (
                    <div className="mt-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  )}
                  {uploadState.status === "error" && (
                    <p className="text-caption text-red-600">{uploadState.error}</p>
                  )}
                </div>
                {uploadState.status === "error" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetryUpload(uploadState.id);
                      }}
                      className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-smooth"
                    >
                      נסה שוב
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUpload(uploadState.id);
                      }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 text-red-500 transition-smooth"
                      aria-label="הסר"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
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
              key={file.url}
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
                  handleRemoveFile(file.url);
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
