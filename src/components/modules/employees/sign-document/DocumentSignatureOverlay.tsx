
import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DocumentSignatureOverlayProps {
  documentUrl: string;
  signatureData: any;
  signedAt: string;
  signedBy: string;
  onDocumentGenerated: (pdfBlob: Blob) => void;
}

export const DocumentSignatureOverlay: React.FC<DocumentSignatureOverlayProps> = ({
  documentUrl,
  signatureData,
  signedAt,
  signedBy,
  onDocumentGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateSignedDocument();
  }, [documentUrl, signatureData, signedAt, signedBy]);

  const generateSignedDocument = async () => {
    if (!canvasRef.current || !signatureData?.signature_image) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for A4 document (595 x 842 points)
      canvas.width = 595;
      canvas.height = 842;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load and draw the original document
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        // Draw the document
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height - 120); // Leave space for signature
        
        // Load signature image
        const signatureImg = new Image();
        signatureImg.crossOrigin = 'anonymous';
        
        signatureImg.onload = async () => {
          // Position signature at bottom right
          const sigWidth = 150;
          const sigHeight = 60;
          const sigX = canvas.width - sigWidth - 50;
          const sigY = canvas.height - sigHeight - 30;
          
          // Draw signature text (name and time) above signature
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'right';
          ctx.direction = 'rtl';
          
          const timeText = format(new Date(signedAt), 'dd/MM/yyyy בשעה HH:mm', { locale: he });
          
          // Draw signer name
          ctx.fillText(`נחתם על ידי: ${signedBy}`, canvas.width - 50, sigY - 25);
          
          // Draw signing time
          ctx.fillText(`זמן חתימה: ${timeText}`, canvas.width - 50, sigY - 10);
          
          // Draw signature image
          ctx.drawImage(signatureImg, sigX, sigY, sigWidth, sigHeight);
          
          // Add border around signature area
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = 1;
          ctx.strokeRect(sigX - 5, sigY - 35, sigWidth + 10, sigHeight + 40);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              onDocumentGenerated(blob);
            }
          }, 'image/png', 0.9);
        };
        
        signatureImg.src = signatureData.signature_image;
      };
      
      img.src = documentUrl;
      
    } catch (error) {
      console.error('Error generating signed document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {isGenerating && (
        <div className="text-sm text-gray-500">
          מייצר מסמך עם חתימה...
        </div>
      )}
    </div>
  );
};
