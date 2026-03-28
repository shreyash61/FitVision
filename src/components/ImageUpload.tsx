import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  selectedImage: string | null;
}

export function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4",
            isDragActive ? "border-purple-500 bg-purple-500/10" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="p-4 bg-zinc-800 rounded-full">
            <Upload className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Upload full body picture</p>
            <p className="text-sm text-zinc-500 mt-1">Drag and drop or click to select</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 group">
          <img src={selectedImage} alt="Preview" className="w-full h-64 object-cover" />
          <button
            onClick={() => onImageSelect('')}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-medium">Click X to change image</p>
          </div>
        </div>
      )}
    </div>
  );
}
