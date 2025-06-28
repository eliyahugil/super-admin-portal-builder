
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { ImportFileUpload } from './ImportFileUpload';
import { EnhancedFieldMappingDialog } from './EnhancedFieldMappingDialog';
import { ImportPreview } from './ImportPreview';
import { ImportResults } from './ImportResults';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';
import { useAuth } from '@/components/auth/AuthContext';

export const ImportManager: React.FC = () => {
  const { user } = useAuth();
  const businessId = user?.business_id;

  const {
    step,
    setStep,
    file,
    headers,
    rawData,
    fieldMappings,
    previewData,
    importResult,
    showMappingDialog,
    setShowMappingDialog,
    processFile,
    confirmMapping,
    executeImport,
    resetForm,
    downloadTemplate,
  } = useEmployeeImport(businessId);

  console.log('📊 ImportManager - Current state:', {
    step,
    businessId,
    fileSelected: !!file,
    headersCount: headers.length,
    rawDataCount: rawData.length,
    previewDataCount: previewData.length,
    showMappingDialog
  });

  const handleBack = () => {
    if (step === 'preview') {
      setStep('mapping');
      setShowMappingDialog(true);
    } else if (step === 'results') {
      setStep('closed');
      resetForm();
    } else {
      setStep('closed');
      resetForm();
    }
  };

  const getStepIcon = (currentStep: string) => {
    switch (currentStep) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'mapping':
        return <Eye className="h-5 w-5" />;
      case 'preview':
        return <CheckCircle className="h-5 w-5" />;
      case 'importing':
        return <AlertCircle className="h-5 w-5 animate-spin" />;
      case 'results':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'upload':
        return 'העלאת קובץ Excel';
      case 'mapping':
        return 'מיפוי שדות מתקדם';
      case 'preview':
        return 'תצוגה מקדימה ותיקון שגיאות';
      case 'importing':
        return 'מבצע ייבוא...';
      case 'results':
        return 'תוצאות הייבוא';
      default:
        return 'ייבוא עובדים מקובץ Excel';
    }
  };

  if (step === 'closed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            ייבוא עובדים מקובץ Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">ייבא עובדים מקובץ Excel</h3>
            <p className="text-gray-600 mb-4">
              העלה קובץ Excel עם פרטי עובדים וקבל מיפוי מתקדם עם יכולות תיקון ידני
            </p>
            <Button onClick={() => setStep('upload')} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              התחל ייבוא
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStepIcon(step)}
              <div>
                <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
                {file && (
                  <p className="text-sm text-gray-600 mt-1">
                    קובץ: {file.name} • {headers.length} עמודות • {rawData.length} שורות נתונים
                  </p>
                )}
              </div>
            </div>
            
            {step !== 'upload' && step !== 'importing' && (
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                חזור
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {step === 'upload' && (
            <ImportFileUpload
              onFileSelect={processFile}
              onDownloadTemplate={downloadTemplate}
            />
          )}

          {step === 'preview' && (
            <ImportPreview
              previewData={previewData}
              onConfirm={executeImport}
              onCancel={() => {
                setStep('closed');
                resetForm();
              }}
              onBack={() => {
                setStep('mapping');
                setShowMappingDialog(true);
              }}
            />
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">מבצע ייבוא עובדים...</h3>
              <p className="text-gray-600">אנא המתן בזמן עיבוד הנתונים</p>
            </div>
          )}

          {step === 'results' && importResult && (
            <ImportResults
              result={importResult}
              onReset={() => {
                setStep('closed');
                resetForm();
              }}
              onImportMore={() => {
                setStep('upload');
                resetForm();
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Enhanced Field Mapping Dialog */}
      <EnhancedFieldMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        fileColumns={headers}
        sampleData={rawData.slice(0, 5)}
        onConfirm={confirmMapping}
        onBack={() => {
          setStep('upload');
          setShowMappingDialog(false);
        }}
        businessId={businessId}
      />
    </div>
  );
};
