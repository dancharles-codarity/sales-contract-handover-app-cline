import React, { useState, useEffect } from 'react';
import './index.css';

// Zapier webhook URL - replace with actual URL when available
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/your-webhook-url';

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Client Information
    clientBusinessName: '',
    clientRegisteredAddress: '',
    clientPostcode: '',
    clientRepFirstName: '',
    clientRepLastName: '',
    clientRepTitle: '',
    clientRepEmail: '',
    clientLocation: '',
    
    // Sales Information
    salesRepName: '',
    salesRepEmail: '',
    agreementDate: '',
    
    // Service Selection
    isFullPackage: '',
    services: {
      googleAds: false,
      metaAds: false,
      marketingAutomationCRM: false,
      aiSalesSupport: false,
      messagingComms: false,
    },
    
    // Financial Data
    totalProjectValueExVAT: '',
    onboardingFeeExVAT: '',
    paymentOption: '',
    initialAdBudgetExVAT: '',
    paymentCollectedIncVAT: '',
    handoverNotes: '',
  });

  const [calculatedValues, setCalculatedValues] = useState({});
  const [errors, setErrors] = useState({});
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate values whenever form data changes
  useEffect(() => {
    calculateValues();
  }, [formData]);

  const calculateValues = () => {
    const isUKClient = formData.clientLocation === 'UK';
    const vatRate = isUKClient ? 0.20 : 0;
    
    const totalProjectValueExVAT = parseFloat(formData.totalProjectValueExVAT) || 0;
    const onboardingFeeExVAT = parseFloat(formData.onboardingFeeExVAT) || 0;
    const adBudget = parseFloat(formData.initialAdBudgetExVAT) || 0;

    // VAT calculations
    const totalProjectValueIncVAT = totalProjectValueExVAT * (1 + vatRate);
    const onboardingFeeIncVAT = onboardingFeeExVAT * (1 + vatRate);
    const totalVATApplied = (totalProjectValueExVAT + onboardingFeeExVAT) * vatRate;

    // Ad spend management fee calculation
    let adSpendManagementFeeExVAT = 0;
    if (adBudget >= 5000 && adBudget <= 10000) adSpendManagementFeeExVAT = 500;
    else if (adBudget > 10000 && adBudget <= 15000) adSpendManagementFeeExVAT = 900;
    else if (adBudget > 15000 && adBudget <= 20000) adSpendManagementFeeExVAT = 1400;
    else if (adBudget > 20000 && adBudget <= 25000) adSpendManagementFeeExVAT = 1500;
    else if (adBudget > 25000 && adBudget <= 30000) adSpendManagementFeeExVAT = 1500;
    else if (adBudget > 30000 && adBudget <= 35000) adSpendManagementFeeExVAT = 1750;
    else if (adBudget > 35000 && adBudget <= 40000) adSpendManagementFeeExVAT = 2000;
    else if (adBudget > 40000 && adBudget <= 45000) adSpendManagementFeeExVAT = 2250;
    else if (adBudget > 45000 && adBudget <= 50000) adSpendManagementFeeExVAT = 2500;
    else if (adBudget > 50000) adSpendManagementFeeExVAT = 2500;

    const adSpendManagementFeeIncVAT = adSpendManagementFeeExVAT * (1 + vatRate);

    // Payment option calculations
    let paymentSchedule = {};
    if (formData.paymentOption === 'A') {
      paymentSchedule = {
        upfrontPayment: totalProjectValueIncVAT + onboardingFeeIncVAT,
        description: '100% upfront payment'
      };
    } else if (formData.paymentOption === 'B') {
      const upfront50Percent = totalProjectValueIncVAT * 0.50;
      const remaining50Percent = totalProjectValueIncVAT - upfront50Percent;
      paymentSchedule = {
        initialPayment: upfront50Percent + onboardingFeeIncVAT,
        month3Payment: remaining50Percent / 2,
        month4Payment: remaining50Percent / 2,
        description: '50% + onboarding upfront, then 2 monthly payments'
      };
    } else if (formData.paymentOption === 'C') {
      const monthlyPaymentExVAT = totalProjectValueExVAT / 4;
      const monthlyPaymentIncVAT = monthlyPaymentExVAT * (1 + vatRate);
      paymentSchedule = {
        initialPayment: monthlyPaymentIncVAT + onboardingFeeIncVAT,
        month2Payment: monthlyPaymentIncVAT,
        month3Payment: monthlyPaymentIncVAT,
        month4Payment: monthlyPaymentIncVAT,
        description: 'Monthly payments over 4 months + onboarding upfront'
      };
    }

    setCalculatedValues({
      vatApplicable: isUKClient ? 'Y' : 'N',
      vatRate,
      vatRateDisplay: `${(vatRate * 100).toFixed(0)}%`,
      totalProjectValueIncVAT: totalProjectValueIncVAT.toFixed(2),
      onboardingFeeIncVAT: onboardingFeeIncVAT.toFixed(2),
      totalVATApplied: totalVATApplied.toFixed(2),
      adSpendManagementFeeExVAT: adSpendManagementFeeExVAT.toFixed(2),
      adSpendManagementFeeIncVAT: adSpendManagementFeeIncVAT.toFixed(2),
      paymentSchedule
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.clientBusinessName) newErrors.clientBusinessName = 'Client business name is required';
      if (!formData.clientRegisteredAddress) newErrors.clientRegisteredAddress = 'Client registered address is required';
      if (!formData.clientPostcode) newErrors.clientPostcode = 'Postcode/zipcode is required';
      if (!formData.clientRepFirstName) newErrors.clientRepFirstName = 'Client representative first name is required';
      if (!formData.clientRepLastName) newErrors.clientRepLastName = 'Client representative last name is required';
      if (!formData.clientRepTitle) newErrors.clientRepTitle = 'Client representative title is required';
      if (!formData.clientRepEmail) newErrors.clientRepEmail = 'Client representative email is required';
      if (!formData.clientLocation) newErrors.clientLocation = 'Client location is required';
      if (!formData.salesRepName) newErrors.salesRepName = 'Sales representative name is required';
      if (!formData.salesRepEmail) newErrors.salesRepEmail = 'Sales representative email is required';
      if (!formData.agreementDate) newErrors.agreementDate = 'Agreement date is required';

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.clientRepEmail && !emailRegex.test(formData.clientRepEmail)) {
        newErrors.clientRepEmail = 'Please enter a valid email address';
      }
      if (formData.salesRepEmail && !emailRegex.test(formData.salesRepEmail)) {
        newErrors.salesRepEmail = 'Please enter a valid email address';
      }

      // Postcode validation
      if (formData.clientLocation === 'UK' && formData.clientPostcode) {
        const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
        if (!ukPostcodeRegex.test(formData.clientPostcode)) {
          newErrors.clientPostcode = 'Please enter a valid UK postcode (e.g., SW1A 1AA)';
        }
      } else if (formData.clientLocation === 'Non-UK' && formData.clientPostcode) {
        const usZipcodeRegex = /^\d{5}(-\d{4})?$/;
        if (!usZipcodeRegex.test(formData.clientPostcode)) {
          newErrors.clientPostcode = 'Please enter a valid zipcode (e.g., 12345 or 12345-6789)';
        }
      }
    }

    if (step === 2) {
      if (formData.isFullPackage === 'no') {
        const hasSelectedService = Object.values(formData.services).some(service => service);
        if (!hasSelectedService) {
          newErrors.services = 'Please select at least one individual service';
        }
      }
      if (!formData.isFullPackage) {
        newErrors.isFullPackage = 'Please select whether this is a full package or individual services';
      }
    }

    if (step === 3) {
      if (!formData.totalProjectValueExVAT) newErrors.totalProjectValueExVAT = 'Total project value is required';
      if (!formData.onboardingFeeExVAT) newErrors.onboardingFeeExVAT = 'Onboarding fee is required';
      if (!formData.initialAdBudgetExVAT) newErrors.initialAdBudgetExVAT = 'Initial ad budget is required';

      // Numeric validation
      if (formData.totalProjectValueExVAT && isNaN(parseFloat(formData.totalProjectValueExVAT))) {
        newErrors.totalProjectValueExVAT = 'Please enter a valid number';
      }
      if (formData.onboardingFeeExVAT && isNaN(parseFloat(formData.onboardingFeeExVAT))) {
        newErrors.onboardingFeeExVAT = 'Please enter a valid number';
      }
      if (formData.initialAdBudgetExVAT && isNaN(parseFloat(formData.initialAdBudgetExVAT))) {
        newErrors.initialAdBudgetExVAT = 'Please enter a valid number';
      }
    }

    if (step === 4) {
      if (!formData.paymentOption) newErrors.paymentOption = 'Please select a payment option';
      if (!formData.paymentCollectedIncVAT) newErrors.paymentCollectedIncVAT = 'Payment collected amount is required';
      if (!formData.handoverNotes) newErrors.handoverNotes = 'Handover notes are required';

      if (formData.paymentCollectedIncVAT && isNaN(parseFloat(formData.paymentCollectedIncVAT))) {
        newErrors.paymentCollectedIncVAT = 'Please enter a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateServiceSelection = (service, checked) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: checked
      }
    }));
  };

  const generateCSV = () => {
    const selectedServices = Object.entries(formData.services)
      .filter(([_, selected]) => selected)
      .map(([service, _]) => service)
      .join(', ');

    const csvData = {
      'Client Business Name': formData.clientBusinessName,
      'Client Registered Address': formData.clientRegisteredAddress,
      'Client Postcode/Zipcode': formData.clientPostcode,
      'Client Rep First Name': formData.clientRepFirstName,
      'Client Rep Last Name': formData.clientRepLastName,
      'Client Rep Title': formData.clientRepTitle,
      'Client Rep Email': formData.clientRepEmail,
      'Client Location': formData.clientLocation,
      'Sales Rep Name': formData.salesRepName,
      'Sales Rep Email': formData.salesRepEmail,
      'Agreement Date': formData.agreementDate,
      'Full Package (Y/N)': formData.isFullPackage === 'yes' ? 'Y' : 'N',
      'Services Selected': formData.isFullPackage === 'yes' ? 'Evergreen Event Profit System (Full Package)' : selectedServices,
      'Total Project Value (Ex VAT) (£)': formData.totalProjectValueExVAT,
      'Total Project Value (Inc VAT) (£)': calculatedValues.totalProjectValueIncVAT,
      'Onboarding Fee (Ex VAT) (£)': formData.onboardingFeeExVAT,
      'Onboarding Fee (Inc VAT) (£)': calculatedValues.onboardingFeeIncVAT,
      'VAT Applicable (Y/N)': calculatedValues.vatApplicable,
      'VAT Rate (%)': calculatedValues.vatRateDisplay,
      'Total VAT Applied (£)': calculatedValues.totalVATApplied,
      'Initial Ad Budget (Ex VAT) (£)': formData.initialAdBudgetExVAT,
      'Ad Spend Management Fee (Ex VAT) (£)': calculatedValues.adSpendManagementFeeExVAT,
      'Ad Spend Management Fee (Inc VAT) (£)': calculatedValues.adSpendManagementFeeIncVAT,
      'Payment Option Selected': formData.paymentOption,
      'Payment Collected (Inc VAT) (£)': formData.paymentCollectedIncVAT,
      'Handover Notes': formData.handoverNotes,
    };

    // Add payment schedule details based on selected option
    if (calculatedValues.paymentSchedule) {
      if (formData.paymentOption === 'A') {
        csvData['Upfront Payment (£)'] = calculatedValues.paymentSchedule.upfrontPayment?.toFixed(2) || '0.00';
      } else if (formData.paymentOption === 'B') {
        csvData['Initial Payment (£)'] = calculatedValues.paymentSchedule.initialPayment?.toFixed(2) || '0.00';
        csvData['Month 3 Payment (£)'] = calculatedValues.paymentSchedule.month3Payment?.toFixed(2) || '0.00';
        csvData['Month 4 Payment (£)'] = calculatedValues.paymentSchedule.month4Payment?.toFixed(2) || '0.00';
      } else if (formData.paymentOption === 'C') {
        csvData['Initial Payment (£)'] = calculatedValues.paymentSchedule.initialPayment?.toFixed(2) || '0.00';
        csvData['Month 2 Payment (£)'] = calculatedValues.paymentSchedule.month2Payment?.toFixed(2) || '0.00';
        csvData['Month 3 Payment (£)'] = calculatedValues.paymentSchedule.month3Payment?.toFixed(2) || '0.00';
        csvData['Month 4 Payment (£)'] = calculatedValues.paymentSchedule.month4Payment?.toFixed(2) || '0.00';
      }
    }

    const headers = Object.keys(csvData);
    const values = Object.values(csvData);
    
    const csvContent = [
      headers.map(header => `"${header}"`).join(','),
      values.map(value => `"${value}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `${formData.clientBusinessName.replace(/[^a-z0-9]/gi, '_')}_${formData.agreementDate}_SalesContractInfo.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitForm = async () => {
    if (!summaryConfirmed) {
      setErrors({ summary: 'Please confirm the accuracy of the information before submitting' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for Zapier webhook
      const webhookData = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          webhookData.append(key, JSON.stringify(value));
        } else {
          webhookData.append(key, value);
        }
      });

      // Add calculated values
      Object.entries(calculatedValues).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          webhookData.append(key, JSON.stringify(value));
        } else {
          webhookData.append(key, value);
        }
      });

      // Try to send to Zapier webhook (silent failure)
      try {
        await fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: webhookData,
        });
      } catch (webhookError) {
        console.log('Zapier webhook failed, proceeding with CSV download');
      }

      // Generate and download CSV
      generateCSV();

      // Show success message
      alert('Form submitted successfully! CSV file has been downloaded.');
      
      // Ask if user wants to reset form
      const resetForm = window.confirm('Would you like to reset the form for a new entry?');
      if (resetForm) {
        window.location.reload();
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step, index) => (
        <React.Fragment key={step}>
          <div className={`step-indicator ${
            step < currentStep ? 'completed' : 
            step === currentStep ? 'active' : 'inactive'
          }`}>
            {step < currentStep ? '✓' : step}
          </div>
          {index < 4 && (
            <div className={`w-12 h-0.5 ${
              step < currentStep ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Client & Sales Representative Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Client Business Name *</label>
          <input
            type="text"
            className={`form-input ${errors.clientBusinessName ? 'error' : ''}`}
            value={formData.clientBusinessName}
            onChange={(e) => updateFormData('clientBusinessName', e.target.value)}
            placeholder="Enter client business name"
          />
          {errors.clientBusinessName && <div className="form-error">{errors.clientBusinessName}</div>}
        </div>

        <div>
          <label className="form-label">Client Location *</label>
          <select
            className={`form-input ${errors.clientLocation ? 'error' : ''}`}
            value={formData.clientLocation}
            onChange={(e) => updateFormData('clientLocation', e.target.value)}
          >
            <option value="">Select location</option>
            <option value="UK">UK</option>
            <option value="Non-UK">Non-UK</option>
          </select>
          {errors.clientLocation && <div className="form-error">{errors.clientLocation}</div>}
        </div>
      </div>

      <div>
        <label className="form-label">Client Registered Address *</label>
        <textarea
          className={`form-input ${errors.clientRegisteredAddress ? 'error' : ''}`}
          rows="3"
          value={formData.clientRegisteredAddress}
          onChange={(e) => updateFormData('clientRegisteredAddress', e.target.value)}
          placeholder="Enter full registered address"
        />
        {errors.clientRegisteredAddress && <div className="form-error">{errors.clientRegisteredAddress}</div>}
      </div>

      <div>
        <label className="form-label">
          {formData.clientLocation === 'UK' ? 'Postcode' : 'Zipcode'} *
        </label>
        <input
          type="text"
          className={`form-input ${errors.clientPostcode ? 'error' : ''}`}
          value={formData.clientPostcode}
          onChange={(e) => updateFormData('clientPostcode', e.target.value)}
          placeholder={formData.clientLocation === 'UK' ? 'e.g., SW1A 1AA' : 'e.g., 12345'}
        />
        {errors.clientPostcode && <div className="form-error">{errors.clientPostcode}</div>}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Representative</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">First Name *</label>
            <input
              type="text"
              className={`form-input ${errors.clientRepFirstName ? 'error' : ''}`}
              value={formData.clientRepFirstName}
              onChange={(e) => updateFormData('clientRepFirstName', e.target.value)}
              placeholder="First name"
            />
            {errors.clientRepFirstName && <div className="form-error">{errors.clientRepFirstName}</div>}
          </div>

          <div>
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              className={`form-input ${errors.clientRepLastName ? 'error' : ''}`}
              value={formData.clientRepLastName}
              onChange={(e) => updateFormData('clientRepLastName', e.target.value)}
              placeholder="Last name"
            />
            {errors.clientRepLastName && <div className="form-error">{errors.clientRepLastName}</div>}
          </div>

          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              className={`form-input ${errors.clientRepTitle ? 'error' : ''}`}
              value={formData.clientRepTitle}
              onChange={(e) => updateFormData('clientRepTitle', e.target.value)}
              placeholder="e.g., CEO, Marketing Director"
            />
            {errors.clientRepTitle && <div className="form-error">{errors.clientRepTitle}</div>}
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              className={`form-input ${errors.clientRepEmail ? 'error' : ''}`}
              value={formData.clientRepEmail}
              onChange={(e) => updateFormData('clientRepEmail', e.target.value)}
              placeholder="email@company.com"
            />
            {errors.clientRepEmail && <div className="form-error">{errors.clientRepEmail}</div>}
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Representative</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Sales Rep Name *</label>
            <input
              type="text"
              className={`form-input ${errors.salesRepName ? 'error' : ''}`}
              value={formData.salesRepName}
              onChange={(e) => updateFormData('salesRepName', e.target.value)}
              placeholder="Sales representative name"
            />
            {errors.salesRepName && <div className="form-error">{errors.salesRepName}</div>}
          </div>

          <div>
            <label className="form-label">Sales Rep Email *</label>
            <input
              type="email"
              className={`form-input ${errors.salesRepEmail ? 'error' : ''}`}
              value={formData.salesRepEmail}
              onChange={(e) => updateFormData('salesRepEmail', e.target.value)}
              placeholder="salesrep@company.com"
            />
            {errors.salesRepEmail && <div className="form-error">{errors.salesRepEmail}</div>}
          </div>

          <div>
            <label className="form-label">Agreement Date *</label>
            <input
              type="date"
              className={`form-input ${errors.agreementDate ? 'error' : ''}`}
              value={formData.agreementDate}
              onChange={(e) => updateFormData('agreementDate', e.target.value)}
            />
            {errors.agreementDate && <div className="form-error">{errors.agreementDate}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Service Selection</h2>
      
      <div>
        <label className="form-label">Is this the full "Evergreen Event Profit System" package? *</label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="isFullPackage"
              value="yes"
              checked={formData.isFullPackage === 'yes'}
              onChange={(e) => updateFormData('isFullPackage', e.target.value)}
              className="mr-2"
            />
            Yes - Full Package (includes all services)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="isFullPackage"
              value="no"
              checked={formData.isFullPackage === 'no'}
              onChange={(e) => updateFormData('isFullPackage', e.target.value)}
              className="mr-2"
            />
            No - Individual services only
          </label>
        </div>
        {errors.isFullPackage && <div className="form-error">{errors.isFullPackage}</div>}
      </div>

      {formData.isFullPackage === 'no' && (
        <div>
          <label className="form-label">Select Individual Services *</label>
          <div className="mt-2 space-y-3">
            {[
              { key: 'googleAds', label: 'Google Ads' },
              { key: 'metaAds', label: 'Meta Ads' },
              { key: 'marketingAutomationCRM', label: 'Marketing Automation/CRM' },
              { key: 'aiSalesSupport', label: 'AI Sales/Support' },
              { key: 'messagingComms', label: 'Messaging/Communications' },
            ].map(service => (
              <label key={service.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.services[service.key]}
                  onChange={(e) => updateServiceSelection(service.key, e.target.checked)}
                  className="mr-2"
                />
                {service.label}
              </label>
            ))}
          </div>
          {errors.services && <div className="form-error">{errors.services}</div>}
        </div>
      )}

      {formData.isFullPackage === 'yes' && (
        <div className="calculation-box">
          <h3 className="font-semibold text-blue-800 mb-2">Full Package Selected</h3>
          <p className="text-blue-700">
            The "Evergreen Event Profit System" includes all available services:
          </p>
          <ul className="list-disc list-inside mt-2 text-blue-700">
            <li>Google Ads</li>
            <li>Meta Ads</li>
            <li>Marketing Automation/CRM</li>
            <li>AI Sales/Support</li>
            <li>Messaging/Communications</li>
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Financial Inputs & Calculations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Total Project Value (4-month term, excluding VAT) *</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">£</span>
            <input
              type="number"
              step="0.01"
              className={`form-input pl-8 ${errors.totalProjectValueExVAT ? 'error' : ''}`}
              value={formData.totalProjectValueExVAT}
              onChange={(e) => updateFormData('totalProjectValueExVAT', e.target.value)}
              placeholder="0.00"
            />
          </div>
          {errors.totalProjectValueExVAT && <div className="form-error">{errors.totalProjectValueExVAT}</div>}
        </div>

        <div>
          <label className="form-label">Onboarding/Setup Fee (excluding VAT) *</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">£</span>
            <input
              type="number"
              step="0.01"
              className={`form-input pl-8 ${errors.onboardingFeeExVAT ? 'error' : ''}`}
              value={formData.onboardingFeeExVAT}
              onChange={(e) => updateFormData('onboardingFeeExVAT', e.target.value)}
              placeholder="0.00"
            />
          </div>
          {errors.onboardingFeeExVAT && <div className="form-error">{errors.onboardingFeeExVAT}</div>}
        </div>

        <div>
          <label className="form-label">Initial Agreed Ad Budget per Month (excluding VAT) *</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">£</span>
            <input
              type="number"
              step="0.01"
              className={`form-input pl-8 ${errors.initialAdBudgetExVAT ? 'error' : ''}`}
              value={formData.initialAdBudgetExVAT}
              onChange={(e) => updateFormData('initialAdBudgetExVAT', e.target.value)}
              placeholder="0.00"
            />
          </div>
          {errors.initialAdBudgetExVAT && <div className="form-error">{errors.initialAdBudgetExVAT}</div>}
        </div>
      </div>

      {(formData.totalProjectValueExVAT || formData.onboardingFeeExVAT || formData.initialAdBudgetExVAT) && (
        <div className="calculation-box">
          <h3 className="font-semibold text-blue-800 mb-4">Real-time Calculations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">VAT Applicable: <span className="font-semibold">{calculatedValues.vatApplicable}</span></p>
              <p className="text-sm text-blue-700">VAT Rate: <span className="font-semibold">{calculatedValues.vatRateDisplay}</span></p>
              <p className="text-sm text-blue-700">Total VAT Applied: <span className="font-semibold">£{calculatedValues.totalVATApplied}</span></p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Project Value (Inc VAT): <span className="font-semibold">£{calculatedValues.totalProjectValueIncVAT}</span></p>
              <p className="text-sm text-blue-700">Onboarding Fee (Inc VAT): <span className="font-semibold">£{calculatedValues.onboardingFeeIncVAT}</span></p>
              <p className="text-sm text-blue-700">Ad Management Fee: <span className="font-semibold">£{calculatedValues.adSpendManagementFeeExVAT} (Ex VAT)</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Payment Structure & Collection</h2>
      
      <div>
        <label className="form-label">Payment Option *</label>
        <div className="mt-2 space-y-4">
          <label className="flex items-start">
            <input
              type="radio"
              name="paymentOption"
              value="A"
              checked={formData.paymentOption === 'A'}
              onChange={(e) => updateFormData('paymentOption', e.target.value)}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium">Option A: 100% Upfront Payment</div>
              <div className="text-sm text-gray-600">Full project value + onboarding fee paid upfront</div>
              {formData.paymentOption === 'A' && calculatedValues.paymentSchedule && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-medium">
                    Total Upfront: £{calculatedValues.paymentSchedule.upfrontPayment?.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="paymentOption"
              value="B"
              checked={formData.paymentOption === 'B'}
              onChange={(e) => updateFormData('paymentOption', e.target.value)}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium">Option B: 50% + Installments</div>
              <div className="text-sm text-gray-600">50% + onboarding upfront, then 2 monthly payments</div>
              {formData.paymentOption === 'B' && calculatedValues.paymentSchedule && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800">Initial Payment: £{calculatedValues.paymentSchedule.initialPayment?.toFixed(2)}</p>
                  <p className="text-green-800">Month 3: £{calculatedValues.paymentSchedule.month3Payment?.toFixed(2)}</p>
                  <p className="text-green-800">Month 4: £{calculatedValues.paymentSchedule.month4Payment?.toFixed(2)}</p>
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="paymentOption"
              value="C"
              checked={formData.paymentOption === 'C'}
              onChange={(e) => updateFormData('paymentOption', e.target.value)}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium">Option C: Monthly Payments</div>
              <div className="text-sm text-gray-600">Monthly payments over 4 months + onboarding upfront</div>
              {formData.paymentOption === 'C' && calculatedValues.paymentSchedule && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800">Initial Payment: £{calculatedValues.paymentSchedule.initialPayment?.toFixed(2)}</p>
                  <p className="text-green-800">Month 2: £{calculatedValues.paymentSchedule.month2Payment?.toFixed(2)}</p>
                  <p className="text-green-800">Month 3: £{calculatedValues.paymentSchedule.month3Payment?.toFixed(2)}</p>
                  <p className="text-green-800">Month 4: £{calculatedValues.paymentSchedule.month4Payment?.toFixed(2)}</p>
                </div>
              )}
            </div>
          </label>
        </div>
        {errors.paymentOption && <div className="form-error">{errors.paymentOption}</div>}
      </div>

      <div>
        <label className="form-label">Actual Payment Collected (including VAT if applicable) *</label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">£</span>
          <input
            type="number"
            step="0.01"
            className={`form-input pl-8 ${errors.paymentCollectedIncVAT ? 'error' : ''}`}
            value={formData.paymentCollectedIncVAT}
            onChange={(e) => updateFormData('paymentCollectedIncVAT', e.target.value)}
            placeholder="0.00"
          />
        </div>
        {errors.paymentCollectedIncVAT && <div className="form-error">{errors.paymentCollectedIncVAT}</div>}
      </div>

      <div>
        <label className="form-label">Handover Notes for Finance Team *</label>
        <textarea
          className={`form-input ${errors.handoverNotes ? 'error' : ''}`}
          rows="4"
          value={formData.handoverNotes}
          onChange={(e) => updateFormData('handoverNotes', e.target.value)}
          placeholder="Include any important notes for the finance team regarding this contract, payment terms, special arrangements, etc."
        />
        {errors.handoverNotes && <div className="form-error">{errors.handoverNotes}</div>}
      </div>
    </div>
  );

  const renderStep5 = () => {
    const selectedServices = Object.entries(formData.services)
      .filter(([_, selected]) => selected)
      .map(([service, _]) => {
        const serviceNames = {
          googleAds: 'Google Ads',
          metaAds: 'Meta Ads',
          marketingAutomationCRM: 'Marketing Automation/CRM',
          aiSalesSupport: 'AI Sales/Support',
          messagingComms: 'Messaging/Communications'
        };
        return serviceNames[service];
      });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 5: Summary Review & Submission</h2>
        
        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Business Name:</span> {formData.clientBusinessName}</p>
              <p><span className="font-medium">Location:</span> {formData.clientLocation}</p>
              <p><span className="font-medium">Address:</span> {formData.clientRegisteredAddress}</p>
              <p><span className="font-medium">Postcode:</span> {formData.clientPostcode}</p>
            </div>
            <div>
              <p><span className="font-medium">Representative:</span> {formData.clientRepFirstName} {formData.clientRepLastName}</p>
              <p><span className="font-medium">Title:</span> {formData.clientRepTitle}</p>
              <p><span className="font-medium">Email:</span> {formData.clientRepEmail}</p>
              <p><span className="font-medium">Agreement Date:</span> {formData.agreementDate}</p>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Selected</h3>
          <p className="text-sm">
            <span className="font-medium">Package Type:</span> {formData.isFullPackage === 'yes' ? 'Full Package - Evergreen Event Profit System' : 'Individual Services'}
          </p>
          {formData.isFullPackage === 'no' && (
            <p className="text-sm mt-1">
              <span className="font-medium">Selected Services:</span> {selectedServices.join(', ')}
            </p>
          )}
        </div>

        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Project Value (Ex VAT):</span> £{formData.totalProjectValueExVAT}</p>
              <p><span className="font-medium">Project Value (Inc VAT):</span> £{calculatedValues.totalProjectValueIncVAT}</p>
              <p><span className="font-medium">Onboarding Fee (Ex VAT):</span> £{formData.onboardingFeeExVAT}</p>
              <p><span className="font-medium">Onboarding Fee (Inc VAT):</span> £{calculatedValues.onboardingFeeIncVAT}</p>
            </div>
            <div>
              <p><span className="font-medium">VAT Applicable:</span> {calculatedValues.vatApplicable}</p>
              <p><span className="font-medium">VAT Rate:</span> {calculatedValues.vatRateDisplay}</p>
              <p><span className="font-medium">Total VAT Applied:</span> £{calculatedValues.totalVATApplied}</p>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ad Budget & Management Fees</h3>
          <div className="text-sm">
            <p><span className="font-medium">Monthly Ad Budget (Ex VAT):</span> £{formData.initialAdBudgetExVAT}</p>
            <p><span className="font-medium">Ad Management Fee (Ex VAT):</span> £{calculatedValues.adSpendManagementFeeExVAT}</p>
            <p><span className="font-medium">Ad Management Fee (Inc VAT):</span> £{calculatedValues.adSpendManagementFeeIncVAT}</p>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Structure & Collection</h3>
          <div className="text-sm">
            <p><span className="font-medium">Payment Option:</span> Option {formData.paymentOption}</p>
            <p><span className="font-medium">Description:</span> {calculatedValues.paymentSchedule?.description}</p>
            <p><span className="font-medium">Payment Collected:</span> £{formData.paymentCollectedIncVAT}</p>
            
            {calculatedValues.paymentSchedule && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                <p className="font-medium mb-2">Payment Schedule:</p>
                {formData.paymentOption === 'A' && (
                  <p>Upfront Payment: £{calculatedValues.paymentSchedule.upfrontPayment?.toFixed(2)}</p>
                )}
                {formData.paymentOption === 'B' && (
                  <>
                    <p>Initial Payment: £{calculatedValues.paymentSchedule.initialPayment?.toFixed(2)}</p>
                    <p>Month 3: £{calculatedValues.paymentSchedule.month3Payment?.toFixed(2)}</p>
                    <p>Month 4: £{calculatedValues.paymentSchedule.month4Payment?.toFixed(2)}</p>
                  </>
                )}
                {formData.paymentOption === 'C' && (
                  <>
                    <p>Initial Payment: £{calculatedValues.paymentSchedule.initialPayment?.toFixed(2)}</p>
                    <p>Month 2: £{calculatedValues.paymentSchedule.month2Payment?.toFixed(2)}</p>
                    <p>Month 3: £{calculatedValues.paymentSchedule.month3Payment?.toFixed(2)}</p>
                    <p>Month 4: £{calculatedValues.paymentSchedule.month4Payment?.toFixed(2)}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Handover Notes</h3>
          <p className="text-sm whitespace-pre-wrap">{formData.handoverNotes}</p>
        </div>

        <div className="summary-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sales Representative</h3>
          <div className="text-sm">
            <p><span className="font-medium">Name:</span> {formData.salesRepName}</p>
            <p><span className="font-medium">Email:</span> {formData.salesRepEmail}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={summaryConfirmed}
              onChange={(e) => setSummaryConfirmed(e.target.checked)}
              className="mr-3"
            />
            <span className="text-sm">
              I confirm that all the information above is accurate and complete. I understand that this data will be sent to the finance team for processing.
            </span>
          </label>
          {errors.summary && <div className="form-error">{errors.summary}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sales Contract Handover</h1>
            <p className="text-gray-600 mt-2">Streamline your sales-to-finance handover process</p>
          </div>

          {renderStepIndicator()}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`btn-secondary ${currentStep === 1 ? 'btn-disabled' : ''}`}
            >
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitForm}
                disabled={isSubmitting}
                className={`btn-primary ${isSubmitting ? 'btn-disabled' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit & Download CSV'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
