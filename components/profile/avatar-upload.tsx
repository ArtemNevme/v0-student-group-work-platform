"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AvatarUploadProps {
  avatarUrl: string | null
  fullName: string | null
}

export function AvatarUpload({ avatarUrl, fullName }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setPreviewUrl(data.url)
      router.refresh()
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload avatar. Please try again.")
      setPreviewUrl(avatarUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
        <AvatarImage src={previewUrl || undefined} alt={fullName || "User"} />
        <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          {fullName?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
    </div>
  )
}
