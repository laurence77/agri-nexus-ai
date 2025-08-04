'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { mobileMoneyService, PaymentRequest, PaymentResponse } from '@/services/payments/MobileMoneyService';
import { supabase } from '@/lib/supabase';
import '@/styles/glass-agricultural.css';

interface MobileMoneyPaymentProps {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  metadata?: Record<string, any>;
}

export function MobileMoneyPayment({
  amount,
  currency,
  description,
  reference,
  onSuccess,
  onError,
  onCancel,
  metadata = {}
}: MobileMoneyPaymentProps) {
  const { profile, tenant } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [detectedProvider, setDetectedProvider] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedCountries, setSupportedCountries] = useState<any[]>([]);

  useEffect(() => {
    // Load supported countries and providers
    const countries = mobileMoneyService.getSupportedCountries();
    setSupportedCountries(countries);
  }, []);

  useEffect(() => {
    // Auto-detect provider when phone number changes
    if (phoneNumber.length >= 9) {
      const provider = mobileMoneyService.detectProvider(phoneNumber, selectedCountry);
      setDetectedProvider(provider);
      
      // Validate phone number
      const isValid = mobileMoneyService.validatePhoneNumber(phoneNumber, selectedCountry);
      if (!isValid && phoneNumber.length >= 12) {
        setError('Invalid phone number format for selected country');
      } else {
        setError(null);
      }
    } else {
      setDetectedProvider(null);
      setError(null);
    }
  }, [phoneNumber, selectedCountry]);

  const handlePayment = async () => {
    if (!phoneNumber || !detectedProvider) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const paymentRequest: PaymentRequest = {
        amount,
        currency,
        phoneNumber,
        country: selectedCountry,
        description,
        reference,
        metadata: {
          ...metadata,
          tenantId: tenant?.id,
          userId: profile?.id,
          customerName: profile?.full_name,
          customerEmail: profile?.email,
          provider: detectedProvider.id
        }
      };

      const response = await mobileMoneyService.initiatePayment(paymentRequest);

      // Save transaction to database
      await supabase.from('transactions').insert({
        tenant_id: tenant?.id,
        payer_id: profile?.id,
        amount,
        currency,
        transaction_type: metadata.transactionType || 'input_purchase',
        payment_method: detectedProvider.id,
        external_transaction_id: response.transactionId,
        status: response.status,
        metadata: {
          phone_number: phoneNumber,
          provider: detectedProvider.name,
          reference,
          description
        }
      });

      if (response.status === 'completed') {
        onSuccess?.(response);
      } else {
        // For pending payments, we'll need to poll for status or wait for webhook
        pollPaymentStatus(response.transactionId);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (10 second intervals)

    const poll = async () => {
      try {
        const status = await mobileMoneyService.checkPaymentStatus(transactionId);
        
        if (status.status === 'completed') {
          // Update database
          await supabase
            .from('transactions')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('external_transaction_id', transactionId);
          
          onSuccess?.(status);
          return;
        }
        
        if (status.status === 'failed' || status.status === 'cancelled') {
          // Update database
          await supabase
            .from('transactions')
            .update({ status: status.status })
            .eq('external_transaction_id', transactionId);
          
          setError(`Payment ${status.status}: ${status.message || 'Please try again'}`);
          onError?.(status.message || `Payment ${status.status}`);
          return;
        }

        // Continue polling if still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError('Payment timeout. Please check your mobile money app or try again.');
          onError?('Payment timeout');
        }

      } catch (err) {
        console.error('Error polling payment status:', err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000);
        } else {
          setError('Unable to verify payment status. Please contact support.');
          onError?('Payment verification failed');
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getProviderLogo = (providerId: string) => {
    const logos: Record<string, string> = {
      mpesa: '💚', // M-Pesa green
      mtn_momo: '🟡', // MTN yellow
      airtel_money: '🔴', // Airtel red
      orange_money: '🟠', // Orange orange
      vodacom: '🔵' // Vodacom blue
    };
    return logos[providerId] || '📱';
  };

  return (
    <div className="glass p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Mobile Money Payment</h3>
        <div className="text-2xl font-bold text-green-primary mb-1">
          {formatAmount(amount, currency)}
        </div>
        <p className="text-white/80 text-sm">{description}</p>
      </div>

      <div className="space-y-4">
        {/* Country Selection */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="glass-input w-full"
            disabled={isProcessing}
          >
            {supportedCountries.map((country) => (
              <option key={country.country} value={country.country}>
                {country.country} ({country.currencies.join(', ')})
              </option>
            ))}
          </select>
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Mobile Money Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\s+/g, ''))}
            placeholder={selectedCountry === 'KE' ? '+254712345678' : '+256771234567'}
            className="glass-input w-full"
            disabled={isProcessing}
          />
          
          {/* Provider Detection */}
          {detectedProvider && (
            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <span>{getProviderLogo(detectedProvider.id)}</span>
              <span>Detected: {detectedProvider.name}</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-danger p-3 rounded-lg">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        {/* Payment Instructions */}
        {!isProcessing && detectedProvider && (
          <div className="glass-agricultural p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Payment Instructions:</h4>
            <div className="text-white/80 text-sm space-y-1">
              {detectedProvider.id === 'mpesa' && (
                <>
                  <p>1. You will receive an M-Pesa prompt on your phone</p>
                  <p>2. Enter your M-Pesa PIN to complete payment</p>
                  <p>3. You will receive a confirmation SMS</p>
                </>
              )}
              {detectedProvider.id === 'mtn_momo' && (
                <>
                  <p>1. Dial *165# on your phone</p>
                  <p>2. Follow the prompts to complete payment</p>
                  <p>3. Use the reference: {reference}</p>
                </>
              )}
              {detectedProvider.id === 'airtel_money' && (
                <>
                  <p>1. You will receive an Airtel Money prompt</p>
                  <p>2. Enter your Airtel Money PIN</p>
                  <p>3. Confirm the payment amount</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="glass-button flex-1"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={handlePayment}
            disabled={!detectedProvider || isProcessing || !!error}
            className="glass-button glass-button-primary flex-1 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{getProviderLogo(detectedProvider?.id || '')}</span>
                <span>Pay {formatAmount(amount, currency)}</span>
              </>
            )}
          </button>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="glass-agricultural p-4 rounded-lg text-center">
            <div className="text-white mb-2">
              Payment initiated with {detectedProvider?.name}
            </div>
            <div className="text-white/80 text-sm">
              Please check your phone and complete the payment
            </div>
            <div className="mt-2">
              <div className="glass-progress-bar">
                <div 
                  className="glass-progress-fill animate-pulse" 
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileMoneyPayment;