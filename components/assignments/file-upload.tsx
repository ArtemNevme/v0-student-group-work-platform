"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, File, X, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface UploadedFile {
  id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  created_at: string
  profiles: {
    full_name: string
  }
}

interface FileUploadProps {
  assignmentId: string
  files: UploadedFile[]
}

export function FileUpload({ assignmentId, files: initialFiles }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("assignmentId", assignmentId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      // Add the new file to the list
      const newFile: UploadedFile = {
        id: data.id,
        file_name: data.filename,
        file_url: data.url,
        file_size: data.size,
        file_type: data.type,
        created_at: new Date().toISOString(),
        profiles: {
          full_name: "You",
        },
      }

      setFiles([newFile, ...files])
      toast.success("File uploaded successfully")

      // Refresh the page to update AI analysis
      window.location.reload()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload file")
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const handleDelete = async (fileId: string, fileUrl: string) => {
    try {
      const response = await fetch("/api/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, fileUrl }),
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setFiles(files.filter((f) => f.id !== fileId))
      toast.success("File deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete file")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignment Files</CardTitle>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png"
            />
            <Button asChild size="sm" disabled={uploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </label>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <File className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" strokeWidth={1.75} />
            <p>No files uploaded yet</p>
            <p className="mt-1 text-xs">Upload assignment files for AI analysis</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-control border border-border p-3 transition-colors duration-150 hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-num">{formatFileSize(file.file_size)}</span> • Uploaded by {file.profiles.full_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id, file.file_url)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT, MD, JPG, PNG (max 10MB)</p>
      </CardContent>
    </Card>
  )
}
