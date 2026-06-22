"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadFormProps {
  onUpload: (file: File, type: string) => void;
  isLoading?: boolean;
  parcelId?: string;
}

const acceptedFiles = {
  "application/geo+json": [".geojson", ".json"],
  "application/vnd.google-earth.kml+xml": [".kml"],
  "application/octet-stream": [".shp", ".shx", ".dbf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
};

const fileTypeLabels: Record<string, string> = {
  "application/geo+json": "GeoJSON",
  "application/vnd.google-earth.kml+xml": "KML",
  "application/octet-stream": "Shapefile",
  "image/png": "PNG Image",
  "image/jpeg": "JPEG Image",
  "application/pdf": "PDF Document",
};

export function UploadForm({ onUpload, isLoading, parcelId }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("document");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles,
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, fileType);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop the file here...</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports GeoJSON, KML, Shapefile, PNG, JPG, PDF
              </p>
            </>
          )}
        </div>

        {selectedFile && (
          <div className="mt-4 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button onClick={clearFile} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground">File Type</label>
              <div className="mt-1 flex gap-2">
                {["geometry", "document", "image"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFileType(type)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium border",
                      fileType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:border-primary"
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Button className="mt-3 w-full" onClick={handleUpload} disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
