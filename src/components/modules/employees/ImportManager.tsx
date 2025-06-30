
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { ImportFileUpload } from './ImportFileUpload';
import { EnhancedFieldMappingDialog } from './EnhancedFieldMappingDialog';
import { ImportPreview } from './ImportPreview';
import { ImportResults } from './ImportResults';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface ImportManagerProps {
  selectedBusinessId?: string | null;
  onRefetch?: () => void;
}

export const ImportManager: React.FC<ImportManagerProps> = ({ 
  selectedBusinessId,
  onRefetch 
}) => {
  const { businessId: currentBusinessId } = useCurrentBusiness();
  const effectiveBusinessId = selectedBusinessId || currentBusinessId;

  console.log('🔧 ImportManager - Rendering with validated business context:', {
    selectedBusinessId,
    currentBusinessId,
    effectiveBusinessId,
    hasValidBusinessId: !!effectiveBusinessId,
    onRefetch: !!onRefetch
  });

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
    businessId: hookBusinessId
  } = useEmployeeImport(effectiveBusinessId);

  console.log('📊 ImportManager - Hook state validation:', {
    step,
    hookBusinessId,
    effectiveBusinessId,
    businessIdMatch: hookBusinessId === effectiveBusinessId,
    fileSelected: !!file,
    headersCount: headers.length,
    rawDataCount: rawData.length,
    previewDataCount: previewData.length,
    showMappingDialog,
    fieldMappingsCount: fieldMappings.length,
    importResult: !!importResult
  });

  // Enhanced business validation
  if (!effectiveBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            שגיאה - לא נבחר עסק
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">חובה לבחור עסק לפני ביצוע ייבוא</h3>
            <p className="text-gray-600 mb-4">
              אנא בחר עסק מהרשימה בחלק העליון של המסך
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleBack = () => {
    console.log('🔄 ImportManager - handleBack called, current step:', step);
    
    if (step === 'preview') {
      console.log('🔄 Going back from preview to mapping');
      setStep('mapping');
      setShowMappingDialog(true);
    } else if (step === 'results') {
      console.log('🔄 Going back from results, resetting form');
      setStep('closed');
      resetForm();
    } else {
      console.log('🔄 Default back action, resetting form');
      setStep('closed');
      resetForm();
    }
  };

  const handleExecuteImport = async () => {
    console.log('🚀 ImportManager - Starting import execution with validation:', {
      businessId: hookBusinessId,
      previewDataCount: previewData.length,
      validEmployeesCount: previewData.filter(emp => emp.isValid).length
    });
    
    if (!hookBusinessId) {
      console.error('❌ No business ID available for import execution');
      return;
    }
    
    try {
      await executeImport();
      console.log('✅ Import execution completed successfully');
      if (onRefetch) {
        console.log('🔄 Triggering data refresh');
        onRefetch();
      }
    } catch (error) {
      console.error('💥 Import execution failed:', error);
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
          <p className="text-sm text-gray-600">
            עסק נבחר: {effectiveBusinessId ? 'כן' : 'לא'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">ייבא עובדים מקובץ Excel</h3>
            <p className="text-gray-600 mb-4">
              העלה קובץ Excel עם פרטי עובדים וקבל מיפוי מתקדם עם יכולות תיקון ידני
            </p>
            <Button onClick={() => {
              console.log('🔄 Starting import process with business ID:', effectiveBusinessId);
              setStep('upload');
            }} className="flex items-center gap-2">
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
                <p className="text-xs text-gray-500 mt-1">
                  עסק: {hookBusinessId || 'לא זוהה'}
                </p>
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
              onConfirm={handleExecuteImport}
              onCancel={() => {
                console.log('🔄 ImportPreview - Cancel clicked');
                setStep('closed');
                resetForm();
              }}
              onBack={() => {
                console.log('🔄 ImportPreview - Back clicked');
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
              <p className="text-sm text-gray-500 mt-2">עסק: {hookBusinessId}</p>
            </div>
          )}

          {step === 'results' && importResult && (
            <ImportResults
              result={importResult}
              onClose={() => {
                console.log('🔄 ImportResults - Close clicked');
                setStep('closed');
                resetForm();
                if (onRefetch) onRefetch();
              }}
              onBackToMapping={() => {
                console.log('🔄 ImportResults - Back to mapping clicked');
                setStep('mapping');
                setShowMappingDialog(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Enhanced Field Mapping Dialog */}
      <EnhancedFieldMappingDialog
        open={showMappingDialog}
        onOpenChange={(open) => {
          console.log('🗺️ EnhancedFieldMappingDialog - onOpenChange:', open);
          setShowMappingDialog(open);
        }}
        fileColumns={headers}
        sampleData={rawData.slice(0, 5)}
        onConfirm={confirmMapping}
        onBack={() => {
          console.log('🔄 EnhancedFieldMappingDialog - Back clicked');
          setStep('upload');
          setShowMappingDialog(false);
        }}
        businessId={hookBusinessId}
      />
    </div>
  );
};
