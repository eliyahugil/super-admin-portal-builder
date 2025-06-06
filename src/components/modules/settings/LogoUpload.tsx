
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'שגיאה',
        description: 'אנא בחר קובץ תמונה',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'שגיאה',
        description: 'גודל הקובץ לא יכול לעלות על 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // For now, we'll create a data URL
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onLogoChange(dataUrl);
        setUploading(false);
        toast({
          title: 'הועלה בהצלחה',
          description: 'הלוגו עודכן',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעלות את הלוגו',
        variant: 'destructive',
      });
      setUploading(false);
    }
  };

  const removeLogo = () => {
    onLogoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentLogo && (
          <div className="relative">
            <img
              src={currentLogo}
              alt="לוגו עסק"
              className="w-20 h-20 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
              onClick={removeLogo}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'מעלה...' : currentLogo ? 'החלף לוגו' : 'העלה לוגו'}
          </Button>
          <p className="text-xs text-gray-500">
            קבצי JPG, PNG עד 5MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
