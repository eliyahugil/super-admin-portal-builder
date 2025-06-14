
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BusinessFormData } from './business-form/types';
import { StepIndicator } from './business-form/StepIndicator';
import { BusinessDetailsStep } from './business-form/BusinessDetailsStep';
import { ContactDetailsStep } from './business-form/ContactDetailsStep';
import { ModulesSelectionStep } from './business-form/ModulesSelectionStep';
import { FormNavigation } from './business-form/FormNavigation';
import { useBusinessFormValidation } from './business-form/useBusinessFormValidation';
import { useBusinessCreation } from './business-form/useBusinessCreation';

export const NewBusinessForm: React.FC = () => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    admin_email: '',
    contact_phone: '',
    address: '',
    description: '',
    admin_full_name: ''
  });
  
  const [selectedModules, setSelectedModules] = useState<string[]>(['shift_management', 'employee_documents']);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [useSubscriptionPlan, setUseSubscriptionPlan] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { validateStep } = useBusinessFormValidation();
  const { loading, createBusinessWithAutoAdmin } = useBusinessCreation();

  const totalSteps = 3;

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleModule = (moduleKey: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const nextStep = () => {
    const canProceed = validateStep(currentStep, formData, useSubscriptionPlan, selectedPlanId, selectedModules);
    if (canProceed) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive',
      });
    }
  };

  const previousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  const handleSubmit = async () => {
    const success = await createBusinessWithAutoAdmin(
      formData,
      useSubscriptionPlan,
      selectedPlanId,
      selectedModules
    );

    if (success) {
      // Reset form
      setFormData({
        name: '',
        admin_email: '',
        contact_phone: '',
        address: '',
        description: '',
        admin_full_name: ''
      });
      setSelectedModules(['shift_management', 'employee_documents']);
      setSelectedPlanId('');
      setCurrentStep(1);
    }
  };

  const canProceed = validateStep(currentStep, formData, useSubscriptionPlan, selectedPlanId, selectedModules);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <ContactDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <ModulesSelectionStep
            selectedModules={selectedModules}
            selectedPlanId={selectedPlanId}
            useSubscriptionPlan={useSubscriptionPlan}
            onToggleModule={handleToggleModule}
            onPlanSelect={setSelectedPlanId}
            onToggleSubscriptionPlan={setUseSubscriptionPlan}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6" dir="rtl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
          יצירת עסק חדש + מנהל אוטומטי
        </h1>
        <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          המערכת תיצור אוטומטית את העסק ואת חשבון המנהל
        </p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="space-y-6">
        {renderCurrentStep()}

        <FormNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          loading={loading}
          canProceed={canProceed}
          onNext={nextStep}
          onPrevious={previousStep}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
