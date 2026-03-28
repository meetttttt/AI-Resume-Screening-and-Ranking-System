"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, X, FileText, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface ResumeUploaderProps {
  onUpload: (files: File[]) => void
  isLoading: boolean
}

export function ResumeUploader({ onUpload, isLoading }: ResumeUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Simulate progress when loading
  if (isLoading && uploadProgress < 100) {
    setTimeout(() => {
      setUploadProgress((prev) => Math.min(prev + 5, 100))
    }, 200)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      )
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      )
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName))
  }

  const handleSubmit = () => {
    if (files.length > 0) {
      setUploadProgress(0)
      onUpload(files)
    }
  }

  return (
    <Card className="w-full overflow-hidden bg-white/90 backdrop-blur-sm border-none shadow-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Upload Resumes</CardTitle>
        <CardDescription>Upload PDF or DOCX resume files for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 ${
            dragActive
              ? "border-purple-400 bg-purple-50"
              : "border-gray-300 hover:border-purple-300 hover:bg-purple-50/50"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <motion.div
            animate={{
              y: dragActive ? -10 : 0,
              scale: dragActive ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <FileUp className="h-10 w-10 text-purple-500" />
            </div>
            <p className="mt-2 text-base text-gray-600 font-medium">
              Drag and drop resume files, or{" "}
              <button
                type="button"
                className="text-purple-600 hover:text-purple-700 hover:underline font-semibold"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports: PDF, DOCX</p>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Uploaded Files ({files.length})
              </h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <motion.li
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-md border border-purple-100"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                        <FileText className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-purple-700">Analyzing resumes...</span>
              <span className="text-indigo-600">{uploadProgress}%</span>
            </div>
            <Progress
              value={uploadProgress}
              className="h-2 bg-purple-100"
              indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500"
            />
            <p className="text-xs text-center text-gray-500 animate-pulse mt-2">
              Our AI is analyzing the content and matching with job requirements
            </p>
          </motion.div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={files.length === 0 || isLoading}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing
            </>
          ) : (
            "Analyze Resumes"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

