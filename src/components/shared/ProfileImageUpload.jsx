"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowUpFromSquare, CircleDashed } from "@gravity-ui/icons";

// Upload image to imgbb and return URL
async function uploadToImgbb(file) {
  const apiKey = process.env.NEXT_PUBLIC_IMAGE_API;
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.success) return data.data.url;
  throw new Error("Image upload failed");
}

export default function ProfileImageUpload({ currentImage, name, onUpload, accentColor = "#6254f5" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError("");
    setUploading(true);
    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    try {
      const url = await uploadToImgbb(file);
      setPreview(url);
      onUpload(url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div
        className="relative group cursor-pointer"
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl ring-4 ring-white/5 transition-all group-hover:ring-white/20">
          {preview ? (
            <Image
              src={preview}
              alt={name || "Profile"}
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-3xl font-extrabold"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
          {uploading ? (
            <CircleDashed className="w-6 h-6 text-white animate-spin" />
          ) : (
            <ArrowUpFromSquare className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Camera badge */}
        <div
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg text-white text-sm border-2 border-[var(--bg-primary)]"
          style={{ backgroundColor: accentColor }}
        >
          📷
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div className="text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </button>
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5">JPG, PNG or WebP · Max 5MB</p>
        {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
      </div>
    </div>
  );
}
