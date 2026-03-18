"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/utils/cn";

interface FileUploadProps {
  label: string;
  accept: string;
  description: string;
  maxSize?: number; // MB
  onFile: (file: File, previewUrl: string) => void;
  previewUrl?: string;
  onClear?: () => void;
  className?: string;
}

export function FileUpload({
  label,
  accept,
  description,
  maxSize = 100,
  onFile,
  previewUrl,
  onClear,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError("");

      if (file.size > maxSize * 1024 * 1024) {
        setError(`File too large. Max size: ${maxSize}MB`);
        return;
      }

      const url = URL.createObjectURL(file);
      onFile(file, url);
    },
    [maxSize, onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (previewUrl) {
    const isVideo = accept.includes("video");
    const isAudio = accept.includes("audio");

    return (
      <div className={cn("space-y-1.5", className)}>
        <label className="text-xs font-medium text-surface-600">{label}</label>
        <div className="relative rounded-lg border border-surface-200 overflow-hidden bg-surface-50">
          {isVideo ? (
            <video
              src={previewUrl}
              className="w-full h-32 object-cover"
              controls
              muted
            />
          ) : isAudio ? (
            <div className="p-4">
              <audio src={previewUrl} controls className="w-full" />
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Upload preview"
              className="w-full h-32 object-cover"
            />
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="absolute top-2 right-2 w-6 h-6 bg-surface-900/70 text-white rounded-full flex items-center justify-center hover:bg-surface-900/90 transition-colors text-xs"
            >
              x
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-surface-600">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all",
          isDragging
            ? "border-kinetic-500 bg-kinetic-50"
            : "border-surface-300 hover:border-kinetic-400 hover:bg-surface-50"
        )}
      >
        <svg
          className={cn(
            "w-8 h-8 transition-colors",
            isDragging ? "text-kinetic-500" : "text-surface-400"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <div className="text-center">
          <p className="text-sm text-surface-700">
            Drop file here or <span className="text-kinetic-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-surface-500 mt-1">{description}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  );
}
