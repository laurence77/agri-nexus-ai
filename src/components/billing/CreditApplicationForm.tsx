'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { walletService, CreditApplication } from '@/services/billing/WalletService';
import { supabase } from '@/lib/supabase';
import '@/styles/glass-agricultural.css';

interface CreditApplicationFormProps {
  onSuccess?: (application: CreditApplication) => void;
  onCancel?: () => void;
}

export function CreditApplicationForm({ onSuccess, onCancel }: CreditApplicationFormProps) {
  const { profile, tenant } = useAuth();
  const [formData, setFormData] = useState({
    amount_requested: 50000,
    purpose: 'input_purchase' as const,
    farm_size_hectares: 2,
    crop_type: '',
    expected_harvest_date: '',
    collateral_type: '',
    collateral_value: 0,
    guarantor_phone: '',
    guarantor_name: '',
    business_plan: '',
    monthly_income: 0,
    existing_loans: 0
  });
  
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [farms, setFarms] = useState<any[]>([]);

  useEffect(() => {
    loadUserFarms();
  }, []);

  useEffect(() => {
    // Calculate preliminary credit score when form changes
    calculatePreliminaryScore();
  }, [formData]);

  const loadUserFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id, name, size_hectares, primary_crops')
        .eq('tenant_id', tenant?.id)
        .eq('owner_id', profile?.id);

      if (error) throw error;
      setFarms(data || []);

      // Auto-fill from first farm if available
      if (data && data.length > 0) {
        const firstFarm = data[0];
        setFormData(prev => ({
          ...prev,
          farm_size_hectares: firstFarm.size_hectares || prev.farm_size_hectares,
          crop_type: firstFarm.primary_crops?.[0] || prev.crop_type
        }));
      }
    } catch (err) {
      console.error('Error loading farms:', err);
    }
  };

  const calculatePreliminaryScore = () => {
    let score = 0;

    // Farm size (up to 100 points)
    score += Math.min(formData.farm_size_hectares * 10, 100);

    // Collateral ratio (up to 100 points)
    if (formData.collateral_value && formData.amount_requested) {
      const collateralRatio = formData.collateral_value / formData.amount_requested;
      score += Math.min(collateralRatio * 50, 100);
    }

    // Guarantor (50 points)
    if (formData.guarantor_name && formData.guarantor_phone) {
      score += 50;
    }

    // Income vs loan ratio (up to 100 points)
    if (formData.monthly_income && formData.amount_requested) {
      const monthlyPayment = formData.amount_requested / 12; // Assume 12 month term
      const incomeRatio = formData.monthly_income / monthlyPayment;
      score += Math.min(incomeRatio * 20, 100);
    }

    // Existing debt burden (penalty)
    if (formData.existing_loans && formData.monthly_income) {
      const debtRatio = formData.existing_loans / (formData.monthly_income * 12);
      score -= debtRatio * 50;
    }

    setCreditScore(Math.max(0, Math.min(500, score)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.crop_type || !formData.expected_harvest_date) {
        throw new Error('Please fill all required fields');
      }

      const application = await walletService.applyCreditApplication({
        tenant_id: tenant!.id,
        applicant_id: profile!.id,
        amount_requested: formData.amount_requested,
        currency: tenant?.currency || 'KES',
        purpose: formData.purpose,
        farm_size_hectares: formData.farm_size_hectares,
        crop_type: formData.crop_type,
        expected_harvest_date: formData.expected_harvest_date,
        collateral_type: formData.collateral_type || undefined,
        collateral_value: formData.collateral_value || undefined,
        interest_rate: 15, // Default 15% annual
        repayment_period_months: 12 // Default 12 months
      });

      // Create additional application details record
      await supabase
        .from('credit_application_details')
        .insert({
          application_id: application.id,
          guarantor_name: formData.guarantor_name,
          guarantor_phone: formData.guarantor_phone,
          business_plan: formData.business_plan,
          monthly_income: formData.monthly_income,
          existing_loans: formData.existing_loans,
          preliminary_score: creditScore
        });

      onSuccess?.(application);

    } catch (err) {
      console.error('Error submitting credit application:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tenant?.currency || 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 400) return 'text-green-400';
    if (score >= 300) return 'text-yellow-400';
    if (score >= 200) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCreditScoreLabel = (score: number) => {
    if (score >= 400) return 'Excellent';
    if (score >= 300) return 'Good';
    if (score >= 200) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Apply for Farm Credit</h2>

        {/* Credit Score Preview */}
        {creditScore !== null && (
          <div className="glass-agricultural p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm mb-1">Preliminary Credit Score</div>
                <div className={`text-2xl font-bold ${getCreditScoreColor(creditScore)}`}>
                  {Math.round(creditScore)}/500
                </div>
                <div className={`text-sm ${getCreditScoreColor(creditScore)}`}>
                  {getCreditScoreLabel(creditScore)}
                </div>
              </div>
              <div className="text-4xl">
                {creditScore >= 400 ? '🟢' : creditScore >= 300 ? '🟡' : creditScore >= 200 ? '🟠' : '🔴'}
              </div>
            </div>
            <div className="mt-3">
              <div className="glass-progress-bar">
                <div 
                  className="glass-progress-fill" 
                  style={{ width: `${(creditScore / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Loan Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Amount Requested *
                </label>
                <input
                  type="number"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={formData.amount_requested}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    amount_requested: parseInt(e.target.value) || 0
                  }))}
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Purpose *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    purpose: e.target.value as any
                  }))}
                  className="glass-input w-full"
                  required
                >
                  <option value="input_purchase">Seeds & Inputs</option>
                  <option value="equipment">Farm Equipment</option>
                  <option value="land_preparation">Land Preparation</option>
                  <option value="planting">Planting</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Farm Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Farm Size (Hectares) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  value={formData.farm_size_hectares}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    farm_size_hectares: parseFloat(e.target.value) || 0
                  }))}
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Primary Crop *
                </label>
                <input
                  type="text"
                  value={formData.crop_type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crop_type: e.target.value
                  }))}
                  placeholder="e.g., Maize, Tomatoes, Coffee"
                  className="glass-input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Expected Harvest Date *
              </label>
              <input
                type="date"
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expected_harvest_date: e.target.value
                }))}
                min={new Date().toISOString().split('T')[0]}
                className="glass-input w-full"
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Monthly Income ({tenant?.currency || 'KES'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    monthly_income: parseInt(e.target.value) || 0
                  }))}
                  className="glass-input w-full"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Existing Loans ({tenant?.currency || 'KES'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.existing_loans}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    existing_loans: parseInt(e.target.value) || 0
                  }))}
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Collateral Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Collateral (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Collateral Type
                </label>
                <select
                  value={formData.collateral_type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    collateral_type: e.target.value
                  }))}
                  className="glass-input w-full"
                >
                  <option value="">Select collateral type</option>
                  <option value="land_title">Land Title</option>
                  <option value="equipment">Farm Equipment</option>
                  <option value="livestock">Livestock</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="savings">Savings Account</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Estimated Value ({tenant?.currency || 'KES'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.collateral_value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    collateral_value: parseInt(e.target.value) || 0
                  }))}
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Guarantor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Guarantor (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Guarantor Name
                </label>
                <input
                  type="text"
                  value={formData.guarantor_name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    guarantor_name: e.target.value
                  }))}
                  className="glass-input w-full"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Guarantor Phone
                </label>
                <input
                  type="tel"
                  value={formData.guarantor_phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    guarantor_phone: e.target.value
                  }))}
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Business Plan */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Business Plan / How will you use the loan?
            </label>
            <textarea
              rows={4}
              value={formData.business_plan}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                business_plan: e.target.value
              }))}
              placeholder="Describe how you plan to use the loan and generate income..."
              className="glass-input w-full"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="glass-danger p-3 rounded-lg">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="glass-button flex-1"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button glass-button-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>🏦</span>
                  <span>Apply for {formatAmount(formData.amount_requested)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreditApplicationForm;