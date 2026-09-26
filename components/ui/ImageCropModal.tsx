'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal } from './Modal';
import { Button } from './Button';
import { Upload, ZoomIn, Check, AlertCircle } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialImageUrl?: string;
  aspectRatio?: '16:9' | '1:1';
  onSave: (croppedDataUrl: string, blob?: Blob) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  title,
  initialImageUrl = '',
  aspectRatio = '16:9',
  onSave,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(initialImageUrl);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState<number>(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectNum = aspectRatio === '16:9' ? 16 / 9 : 1;

  useEffect(() => {
    setImageSrc(initialImageUrl);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setZoom(1);
  }, [initialImageUrl, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setZoom(1);
      }
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectNum));
  };

  const getCroppedCanvas = (): { canvas: HTMLCanvasElement; blobPromise: Promise<Blob | null> } | null => {
    const image = imgRef.current;
    if (!image || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      return null;
    }

    const targetWidth = aspectRatio === '16:9' ? 1200 : 600;
    const targetHeight = aspectRatio === '16:9' ? 675 : 600;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropW = completedCrop.width * scaleX;
    const cropH = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const blobPromise = new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });

    return { canvas, blobPromise };
  };

  const handleCropAndSave = async () => {
    if (!imageSrc) return;

    const result = getCroppedCanvas();
    if (!result) {
      onSave(imageSrc);
      onClose();
      return;
    }

    const { canvas, blobPromise } = result;
    const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
    const blob = await blobPromise;

    onSave(croppedUrl, blob || undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="xl">
      <div className="space-y-4">
        {/* Important Display Notice */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>💡 Display Tip:</strong> Adjust the crop box to center your main logo or subject. This ensures clean display across mobile and desktop devices.
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex items-center justify-between gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1.5 text-[#005A63]" /> Choose Image File
          </Button>
          <span className="text-xs text-gray-400 font-mono">
            {aspectRatio === '16:9' ? '16:9 Landscape' : '1:1 Square'}
          </span>
        </div>

        {/* Interactive ReactCrop Box */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl border-2 border-gray-800 flex items-center justify-center p-2 min-h-[260px] max-h-[420px]">
          {imageSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectNum}
              className="max-h-[380px]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                className="max-h-[360px] w-auto object-contain transition-transform duration-100"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          ) : (
            <div className="text-center text-gray-500 text-xs p-6">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Upload an image to start cropping
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        {imageSrc && (
          <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-4 h-4 text-[#005A63]" /> Zoom Level
              </span>
              <span className="text-[#005A63] font-mono">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#005A63]"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!imageSrc}
              onClick={() => {
                onSave(imageSrc);
                onClose();
              }}
            >
              Use Original Image
            </Button>

            <Button variant="primary" disabled={!imageSrc} onClick={handleCropAndSave}>
              <Check className="w-4 h-4 mr-1.5" /> Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
