
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  width?: number;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // הגדרת canvas
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // רקע לבן
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context) return;

    setIsDrawing(true);
    
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context) return;

    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
    
    setHasSignature(true);
    
    // המרת החתימה ל-base64
    const signatureData = canvas.toDataURL();
    onSignatureChange(signatureData);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // ניקוי הcanvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          צייר את החתימה שלך במסגרת למעלה
        </p>
        
        <div className="flex items-center gap-2">
          {hasSignature && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              חתימה מוכנה
            </span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            נקה
          </Button>
        </div>
      </div>
    </div>
  );
};
