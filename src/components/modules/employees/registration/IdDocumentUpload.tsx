import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle, X, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtractedData {
  first_name: string;
  last_name: string;
  id_number: string;
  birth_date: string;
  confidence: number;
  errors?: string[];
}

interface Props {
  onDataExtracted: (data: ExtractedData) => void;
}

export const IdDocumentUpload: React.FC<Props> = ({ onDataExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    try {
      console.log('🔍 Starting file analysis:', file.name, file.type, 'Size:', file.size);
      setError(null);
      setIsProcessing(true);
      
      // Validate file type - accept only images for now
      if (!file.type.startsWith('image/')) {
        throw new Error('אנא בחר קובץ תמונה (JPG, PNG) בלבד. תמיכה ב-PDF תתווסף בקרוב');
      }

      // Validate file size (max 10MB for images)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('גודל הקובץ חייב להיות עד 10MB');
      }

      const base64File = await convertFileToBase64(file);
      setUploadedImage(base64File);

      console.log('📤 Sending file to edge function for analysis...');
      
      const { data, error: functionError } = await supabase.functions.invoke('analyze-id-document', {
        body: { 
          file: base64File,
          fileName: file.name
        }
      });

      console.log('📊 Edge function response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'שגיאה בניתוח התמונה');
      }

      if (!data || !data.success) {
        console.error('❌ Analysis failed:', data);
        throw new Error(data?.error || 'שגיאה בניתוח התמונה');
      }

      console.log('✅ Analysis successful:', data.data);
      
      setExtractedData(data.data);
      onDataExtracted(data.data);

      toast({
        title: 'הצלחה!',
        description: `המידע חולץ בהצלחה (דיוק: ${data.data.confidence}%)`,
      });

    } catch (err) {
      console.error('Error processing ID document:', err);
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעיבוד התמונה';
      setError(errorMessage);
      toast({
        title: 'שגיאה',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryAnalysis = () => {
    if (uploadedImage && fileInputRef.current?.files?.[0]) {
      handleFileSelect(fileInputRef.current.files[0]);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Camera className="h-5 w-5" />
            העלאה מהירה - תמונת תעודת זהות
          </Label>
          
          <div className="text-sm text-muted-foreground">
            צלם או העלה תמונה של תעודת הזהות והמערכת תמלא את הפרטים האישיים אוטומטית
          </div>

          {!uploadedImage ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <div className="font-medium">גרור קובץ לכאן או לחץ לבחירה</div>
                <div className="text-sm text-muted-foreground">
                  PNG, JPG עד 10MB • וודא שהתמונה ברורה וכל הטקסט קריא
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="relative">
                {uploadedImage?.startsWith('data:application/pdf') ? (
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg border p-8">
                    <div className="text-center">
                      <svg className="h-16 w-16 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V6H8a2 2 0 01-2-2z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm font-medium">קובץ PDF נבחר</div>
                      <div className="text-xs text-muted-foreground">מנתח את תעודת הזהות...</div>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={uploadedImage} 
                    alt="תעודת זהות" 
                    className="max-w-full h-auto max-h-64 mx-auto rounded-lg border"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    מנתח את תעודת הזהות/PDF... זה יכול לקחת כמה שניות
                  </AlertDescription>
                </Alert>
              )}

              {/* Error State */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={retryAnalysis}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      נסה שוב
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Success State */}
              {extractedData && !isProcessing && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium text-green-800">
                        מידע חולץ בהצלחה! (דיוק: {extractedData.confidence}%)
                      </div>
                      <div className="text-sm text-green-700">
                        <div>שם: {extractedData.first_name} {extractedData.last_name}</div>
                        <div>ת.ז.: {extractedData.id_number}</div>
                        <div>תאריך לידה: {extractedData.birth_date}</div>
                      </div>
                      {extractedData.errors && extractedData.errors.length > 0 && (
                        <div className="text-sm text-amber-600">
                          <div className="font-medium">אזהרות:</div>
                          <ul className="list-disc list-inside">
                            {extractedData.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-green-600">
                        הפרטים הועברו לטופס אוטומטית. אנא בדוק ותקן במידת הצורך.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Upload Another */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  העלה קובץ אחר
                </Button>
                {extractedData && extractedData.confidence < 80 && (
                  <Button 
                    variant="outline" 
                    onClick={retryAnalysis}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    נסה שוב
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};