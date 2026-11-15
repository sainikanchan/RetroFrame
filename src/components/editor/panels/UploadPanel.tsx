"use client";

import React, { useCallback, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ImagePlus } from "lucide-react";
import { toast } from "sonner";

function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
  return Promise.all(
    arr.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

export function UploadPanel() {
  const setImage = useEditorStore((s) => s.setImage);
  const uploadedImages = useEditorStore((s) => s.uploadedImages);
  const addUploadedImages = useEditorStore((s) => s.addUploadedImages);
  const [isDragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      try {
        const urls = await filesToDataUrls(files);
        if (urls.length === 0) {
          toast.error("Please choose an image file.");
          return;
        }
        addUploadedImages(urls);
        setImage(urls[0]);
        toast.success(urls.length > 1 ? `${urls.length} photos added` : "Photo added");
      } catch {
        toast.error("Couldn't read that file.");
      }
    },
    [addUploadedImages, setImage]
  );

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      toast.error("Couldn't access your camera. Check browser permissions.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const url = canvas.toDataURL("image/png");
    addUploadedImages([url]);
    setImage(url);
    toast.success("Snapshot captured");
    closeCamera();
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-safelight bg-safelight/10" : "border-line"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
      >
        <ImagePlus className="size-8 text-ink-soft" />
        <p className="text-sm text-ink-soft">Drag and drop photos here</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="accent" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" /> Choose files
          </Button>
          <Button size="sm" variant="outline" onClick={openCamera}>
            <Camera className="size-4" /> Camera
          </Button>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div>
          <p className="mb-2 font-mono-label text-xs text-ink-soft">YOUR PHOTOS</p>
          <div className="grid grid-cols-4 gap-2">
            {uploadedImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setImage(src)}
                className="aspect-square overflow-hidden rounded-md border border-line hover:ring-2 hover:ring-safelight cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-sprocket/90 p-6">
          <video ref={videoRef} autoPlay playsInline className="max-h-[60vh] rounded-lg [transform:scaleX(-1)]" />
          <div className="flex gap-3">
            <Button variant="accent" onClick={capturePhoto}>
              <Camera className="size-4" /> Capture
            </Button>
            <Button variant="outline" onClick={closeCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
