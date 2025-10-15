import React, { useState, useRef, useEffect } from 'react';
import { useAssets } from '../hooks/useAssets';
import { isValidImageUrl, createFilePreview } from '../utils/fileUtils';

interface ImageUploadProps {
  onImageSelected: (source: { type: 'upload' | 'url'; value: string }) => void;
  onError?: (error: string) => void;
  currentValue?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  onError,
  currentValue,
  label = 'Logo Image'
}) => {
  const { uploadAsset, uploading } = useAssets();
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(currentValue || '');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentValue) {
      setImageUrl(currentValue);
      setPreviewUrl(currentValue);
    }
  }, [currentValue]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB limit for IC message size)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const errorMsg = `Image too large! Your file is ${sizeMB}MB. Maximum allowed is 2MB. Please compress or resize your image.`;
      setUrlError(errorMsg);
      onError?.(errorMsg);
      if (e.target) e.target.value = ''; // Clear input
      return;
    }

    setSelectedFile(file);
    setUrlError('');

    try {
      // Create preview
      const preview = await createFilePreview(file);
      setPreviewUrl(preview);

      // Upload to canister
      const assetId = await uploadAsset(file, true, ['dao-logo']);
      
      // Notify parent component
      onImageSelected({ type: 'upload', value: assetId });
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMsg = error.message || 'Failed to upload image';
      setUrlError(errorMsg);
      onError?.(errorMsg);
      setPreviewUrl('');
      setSelectedFile(null);
    }
  };

  const handleUrlInput = (url: string) => {
    setImageUrl(url);
    setUrlError('');

    if (url.trim() === '') {
      setPreviewUrl('');
      return;
    }

    if (!isValidImageUrl(url)) {
      setUrlError('Please enter a valid image URL');
      setPreviewUrl('');
      return;
    }

    // Set preview and notify parent
    setPreviewUrl(url);
    onImageSelected({ type: 'url', value: url });
  };

  const handleUrlBlur = () => {
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      setUrlError('Invalid image URL format');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setImageUrl('');
    setPreviewUrl('');
    setUrlError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelected({ type: 'url', value: '' });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Simulate file input change
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label} <span className="text-gray-500">(Optional)</span>
      </label>

      {/* Warning Message */}
      <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <span className="text-orange-400 text-sm mt-0.5">⚠️</span>
        <div className="text-xs text-orange-300">
          <p className="font-semibold">Logo is permanent and cannot be changed later.</p>
          <p className="mt-1 text-gray-400">Max size: 2MB • Recommended: 512×512px PNG/JPG</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📁 Upload Image
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🔗 Paste URL
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload-input"
          />
          <label
            htmlFor="image-upload-input"
            className={`
              flex flex-col items-center justify-center
              w-full h-32 px-4 py-6
              border-2 border-dashed rounded-lg
              cursor-pointer transition-colors
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500'}
              ${selectedFile ? 'border-green-500 bg-green-500/5' : 'border-gray-600 bg-gray-800/50'}
            `}
          >
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">Uploading...</p>
              </div>
            ) : selectedFile ? (
              <div className="text-center">
                <span className="text-3xl mb-2">✅</span>
                <p className="text-sm text-green-400 font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-3xl mb-2">📁</span>
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-purple-400">Click to browse</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP (Max 5MB)
                </p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => handleUrlInput(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com/logo.png"
              className={`
                w-full px-4 py-3 rounded-lg
                bg-gray-800 border
                ${urlError ? 'border-red-500' : 'border-gray-700'}
                text-white placeholder-gray-500
                focus:outline-none focus:border-purple-500
                transition-colors
              `}
            />
            {imageUrl && (
              <button
                type="button"
                onClick={() => handleUrlInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          {urlError && (
            <p className="text-sm text-red-400">⚠️ {urlError}</p>
          )}
          <p className="text-xs text-gray-500">
            Paste a direct link to an image (e.g., from Pexels, Unsplash, or your CDN)
          </p>
        </div>
      )}

      {/* Preview */}
      {previewUrl && !urlError && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Preview:</p>
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                setUrlError('Failed to load image');
                setPreviewUrl('');
              }}
            />
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white hover:bg-black transition-colors flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
