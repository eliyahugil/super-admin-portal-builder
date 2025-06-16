
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  width?: number;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  width = 400,
  height = 150
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // הגדרות ציור משופרות למובייל
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // רקע לבן
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;
    if ('touches' in event) {
      x = (event.touches[0].clientX - rect.left) * scaleX;
      y = (event.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (event.clientX - rect.left) * scaleX;
      y = (event.clientY - rect.top) * scaleY;
    }

    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;
    if ('touches' in event) {
      x = (event.touches[0].clientX - rect.left) * scaleX;
      y = (event.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (event.clientX - rect.left) * scaleX;
      y = (event.clientY - rect.top) * scaleY;
    }

    const context = canvas.getContext('2d');
    if (context) {
      context.lineTo(x, y);
      context.stroke();
      setIsEmpty(false);
      
      // עדכון החתימה
      const signatureData = canvas.toDataURL();
      onSignatureChange(signatureData);
    }
  };

  const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      setIsEmpty(true);
      onSignatureChange(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded cursor-crosshair touch-none"
        style={{ 
          width: '100%', 
          maxWidth: `${width}px`,
          height: 'auto',
          aspectRatio: `${width}/${height}`
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {!isEmpty && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="absolute top-2 left-2 bg-white shadow-md"
          title="נקה חתימה"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
          צייר את החתימה שלך כאן
        </div>
      )}
    </div>
  );
};
