import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  CreditCard,
  Smartphone,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  ArrowRight,
  RefreshCw,
  Copy,
  ExternalLink,
  QrCode,
  Phone,
  User,
  DollarSign,
  Calculator,
  Zap,
  Settings,
  History,
  Bell,
  Lock
} from 'lucide-react';
import { PaymentTransaction, MobileMoneyProvider } from '@/services/payment/payment-service';
import { paymentUtils, PAYMENT_CONFIG, PAYMENT_STATUS, PaymentStatus } from './index';

interface PaymentProcessorProps {
  userId: string;
  onPaymentComplete?: (transaction: PaymentTransaction) => void;
  onPaymentFailed?: (error: string) => void;
  initialAmount?: number;
  initialRecipient?: string;
  initialCurrency?: string;
  mode?: 'send' | 'receive' | 'topup' | 'withdraw';
  className?: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  recipient: string;
  description: string;
  paymentMethod: string;
  reference?: string;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp?: Date;
}

/**
 * Payment Processor Component
 * Unified payment processing with African mobile money integration
 */
export function PaymentProcessor({ 
  userId,
  onPaymentComplete,
  onPaymentFailed,
  initialAmount = 0,
  initialRecipient = '',
  initialCurrency = 'KES',
  mode = 'send',
  className 
}: PaymentProcessorProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>({
    amount: initialAmount,
    currency: initialCurrency,
    recipient: initialRecipient,
    description: '',
    paymentMethod: 'mpesa',
    reference: ''
  });
  
  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([]);
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [supportedProviders, setSupportedProviders] = useState<MobileMoneyProvider[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [stkPushSent, setStkPushSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Load supported providers for selected currency
    const providers = PAYMENT_CONFIG.mobileMoneyProviders.filter(
      provider => provider.currencies.includes(paymentRequest.currency)
    );
    setSupportedProviders(providers);
    
    // Set default payment method if current one is not supported
    if (!providers.find(p => p.id === paymentRequest.paymentMethod) && providers.length > 0) {
      setPaymentRequest(prev => ({
        ...prev,
        paymentMethod: providers[0].id
      }));
    }
  }, [paymentRequest.currency]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePaymentRequest = (): boolean => {
    const errors: string[] = [];
    
    // Validate amount
    const amountValidation = paymentUtils.validateAmount(
      paymentRequest.amount, 
      paymentRequest.currency, 
      paymentRequest.paymentMethod
    );
    
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    }
    
    // Validate recipient (phone number for mobile money)
    if (mode === 'send' && !paymentRequest.recipient) {
      errors.push('Recipient is required');
    } else if (mode === 'send' && !paymentUtils.validateMoMoNumber(paymentRequest.recipient, paymentRequest.paymentMethod)) {
      errors.push('Invalid phone number format for selected provider');
    }
    
    // Validate description
    if (!paymentRequest.description.trim()) {
      errors.push('Description is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const initializePaymentSteps = () => {
    const steps: PaymentStep[] = [
      {
        id: 'validation',
        title: 'Validating Payment',
        description: 'Checking payment details and limits',
        status: 'pending'
      },
      {
        id: 'authorization',
        title: 'Authorization Required',
        description: 'Sending STK push to your phone',
        status: 'pending'
      },
      {
        id: 'processing',
        title: 'Processing Payment',
        description: 'Executing transaction with provider',
        status: 'pending'
      },
      {
        id: 'confirmation',
        title: 'Payment Confirmation',
        description: 'Receiving confirmation from provider',
        status: 'pending'
      }
    ];
    
    setPaymentSteps(steps);
  };

  const updatePaymentStep = (stepId: string, status: PaymentStep['status']) => {
    setPaymentSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, timestamp: new Date() }
        : step
    ));
  };

  const handlePaymentInitiation = async () => {
    if (!validatePaymentRequest()) return;
    
    setProcessing(true);
    setShowConfirmation(false);
    initializePaymentSteps();
    
    try {
      // Step 1: Validation
      updatePaymentStep('validation', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePaymentStep('validation', 'completed');
      
      // Step 2: Create transaction record
      const transaction: PaymentTransaction = {
        id: `txn_${Date.now()}`,
        walletId: `wallet_${paymentRequest.currency.toLowerCase()}`,
        type: mode === 'send' ? 'payment' : mode === 'topup' ? 'topup' : 'withdrawal',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: 'pending' as PaymentStatus,
        description: paymentRequest.description,
        recipient: paymentRequest.recipient,
        paymentMethod: paymentRequest.paymentMethod,
        reference: paymentUtils.generatePaymentRef('PAY'),
        createdAt: new Date(),
        fees: {
          platformFee: paymentUtils.calculateFee(paymentRequest.amount, 'platformFee'),
          providerFee: paymentUtils.calculateFee(paymentRequest.amount, 'mobileMoneyFee'),
          total: 0
        }
      };
      
      transaction.fees.total = transaction.fees.platformFee + transaction.fees.providerFee;
      setCurrentTransaction(transaction);
      setPaymentRequest(prev => ({ ...prev, reference: transaction.reference }));
      
      // Step 3: Authorization (STK Push)
      updatePaymentStep('authorization', 'processing');
      setStkPushSent(true);
      setCountdown(120); // 2 minutes timeout
      
      // Simulate STK push timeout and user authorization
      await new Promise(resolve => setTimeout(resolve, 3000));
      updatePaymentStep('authorization', 'completed');
      setStkPushSent(false);
      
      // Step 4: Processing
      updatePaymentStep('processing', 'processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updatePaymentStep('processing', 'completed');
      
      // Step 5: Confirmation
      updatePaymentStep('confirmation', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updatePaymentStep('confirmation', 'completed');
      
      // Update transaction status
      const completedTransaction = {
        ...transaction,
        status: 'completed' as PaymentStatus,
        completedAt: new Date()
      };
      
      setCurrentTransaction(completedTransaction);
      
      if (onPaymentComplete) {
        onPaymentComplete(completedTransaction);
      }
      
    } catch (error) {
      console.error('Payment failed:', error);
      
      // Update failed step
      const currentStepId = paymentSteps.find(step => step.status === 'processing')?.id;
      if (currentStepId) {
        updatePaymentStep(currentStepId, 'failed');
      }
      
      if (onPaymentFailed) {
        onPaymentFailed('Payment processing failed. Please try again.');
      }
    } finally {
      setProcessing(false);
      setCountdown(0);
    }
  };

  const handleReset = () => {
    setCurrentTransaction(null);
    setPaymentSteps([]);
    setProcessing(false);
    setValidationErrors([]);
    setStkPushSent(false);
    setCountdown(0);
    setPaymentRequest({
      amount: 0,
      currency: initialCurrency,
      recipient: '',
      description: '',
      paymentMethod: 'mpesa',
      reference: ''
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone.length >= 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  const getProviderIcon = (providerId: string) => {
    return <Smartphone className="h-5 w-5" />;
  };

  const renderPaymentForm = () => (
    <div className="space-y-6">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount {mode === 'send' && '(excluding fees)'}
        </label>
        <div className="flex space-x-2">
          <select
            value={paymentRequest.currency}
            onChange={(e) => setPaymentRequest(prev => ({ ...prev, currency: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white w-24"
          >
            {PAYMENT_CONFIG.supportedCurrencies.map(currency => (
              <option key={currency.code} value={currency.code} className="bg-gray-800">
                {currency.code}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={paymentRequest.amount || ''}
            onChange={(e) => setPaymentRequest(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Recipient Input (for send mode) */}
      {mode === 'send' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Phone Number
          </label>
          <input
            type="tel"
            value={paymentRequest.recipient}
            onChange={(e) => setPaymentRequest(prev => ({ ...prev, recipient: e.target.value }))}
            placeholder="e.g., 254712345678"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>
      )}

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <input
          type="text"
          value={paymentRequest.description}
          onChange={(e) => setPaymentRequest(prev => ({ ...prev, description: e.target.value }))}
          placeholder="What is this payment for?"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {supportedProviders.map(provider => (
            <button
              key={provider.id}
              onClick={() => setPaymentRequest(prev => ({ ...prev, paymentMethod: provider.id }))}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                paymentRequest.paymentMethod === provider.id
                  ? 'border-blue-400 bg-blue-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              )}
            >
              <div className="flex items-center space-x-3">
                {getProviderIcon(provider.id)}
                <div>
                  <div className="font-medium text-white">{provider.name}</div>
                  <div className="text-sm text-gray-300">{provider.processingTime}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fee Breakdown */}
      {paymentRequest.amount > 0 && (
        <GlassCard className="p-4">
          <h4 className="font-medium text-white mb-3">Fee Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Amount</span>
              <span className="text-white">
                {paymentUtils.formatCurrency(paymentRequest.amount, paymentRequest.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Platform Fee</span>
              <span className="text-yellow-400">
                {paymentUtils.formatCurrency(
                  paymentUtils.calculateFee(paymentRequest.amount, 'platformFee'),
                  paymentRequest.currency
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Provider Fee</span>
              <span className="text-orange-400">
                {paymentUtils.formatCurrency(
                  paymentUtils.calculateFee(paymentRequest.amount, 'mobileMoneyFee'),
                  paymentRequest.currency
                )}
              </span>
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between font-medium">
              <span className="text-white">Total</span>
              <span className="text-green-400">
                {paymentUtils.formatCurrency(
                  paymentRequest.amount + 
                  paymentUtils.calculateFee(paymentRequest.amount, 'platformFee') +
                  paymentUtils.calculateFee(paymentRequest.amount, 'mobileMoneyFee'),
                  paymentRequest.currency
                )}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-400 mb-1">Please fix the following errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <GlassButton
          variant="primary"
          onClick={() => setShowConfirmation(true)}
          disabled={processing || paymentRequest.amount <= 0}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          {mode === 'send' ? 'Send Payment' : mode === 'topup' ? 'Top Up Wallet' : 'Withdraw Funds'}
        </GlassButton>
        
        <GlassButton
          variant="secondary"
          onClick={handleReset}
          disabled={processing}
        >
          Reset
        </GlassButton>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <GlassCard className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Confirm Payment</h3>
        <p className="text-gray-300">Please review the payment details before proceeding</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-300">Amount</span>
          <span className="text-white font-medium">
            {paymentUtils.formatCurrency(paymentRequest.amount, paymentRequest.currency)}
          </span>
        </div>
        
        {mode === 'send' && (
          <div className="flex justify-between">
            <span className="text-gray-300">Recipient</span>
            <span className="text-white font-medium">
              {formatPhoneNumber(paymentRequest.recipient)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-300">Description</span>
          <span className="text-white font-medium">{paymentRequest.description}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Payment Method</span>
          <span className="text-white font-medium">
            {supportedProviders.find(p => p.id === paymentRequest.paymentMethod)?.name}
          </span>
        </div>
        
        <div className="border-t border-white/20 pt-4 flex justify-between">
          <span className="text-gray-300">Total (including fees)</span>
          <span className="text-green-400 font-bold text-lg">
            {paymentUtils.formatCurrency(
              paymentRequest.amount + 
              paymentUtils.calculateFee(paymentRequest.amount, 'platformFee') +
              paymentUtils.calculateFee(paymentRequest.amount, 'mobileMoneyFee'),
              paymentRequest.currency
            )}
          </span>
        </div>
      </div>

      <div className="flex space-x-4">
        <GlassButton
          variant="primary"
          onClick={handlePaymentInitiation}
          disabled={processing}
          className="flex-1"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirm & Pay
        </GlassButton>
        
        <GlassButton
          variant="secondary"
          onClick={() => setShowConfirmation(false)}
          disabled={processing}
        >
          Cancel
        </GlassButton>
      </div>
    </GlassCard>
  );

  const renderProcessingSteps = () => (
    <GlassCard className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
        <p className="text-gray-300">Reference: {paymentRequest.reference}</p>
      </div>

      <div className="space-y-4 mb-6">
        {paymentSteps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              step.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
              step.status === 'failed' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            )}>
              {step.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : step.status === 'processing' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : step.status === 'failed' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="text-white font-medium">{step.title}</div>
              <div className="text-sm text-gray-300">{step.description}</div>
              {step.timestamp && (
                <div className="text-xs text-gray-400 mt-1">
                  {step.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {stkPushSent && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Smartphone className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">STK Push Sent</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            Check your phone for the payment prompt and enter your PIN
          </p>
          {countdown > 0 && (
            <div className="text-sm text-yellow-400">
              Request expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );

  const renderPaymentComplete = () => (
    <GlassCard className="p-6 text-center">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">Payment Successful!</h3>
      <p className="text-gray-300 mb-6">Your payment has been processed successfully</p>
      
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Amount</div>
            <div className="text-white font-medium">
              {paymentUtils.formatCurrency(currentTransaction?.amount || 0, currentTransaction?.currency || 'KES')}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Reference</div>
            <div className="text-white font-medium">{currentTransaction?.reference}</div>
          </div>
          <div>
            <div className="text-gray-400">Status</div>
            <div className="text-green-400 font-medium">Completed</div>
          </div>
          <div>
            <div className="text-gray-400">Time</div>
            <div className="text-white font-medium">
              {currentTransaction?.completedAt?.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <GlassButton
          variant="primary"
          onClick={handleReset}
          className="flex-1"
        >
          New Payment
        </GlassButton>
        
        <GlassButton
          variant="secondary"
          onClick={() => {
            if (currentTransaction?.reference) {
              navigator.clipboard.writeText(currentTransaction.reference);
            }
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Reference
        </GlassButton>
      </div>
    </GlassCard>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-green-400" />
            <span>Payment Processor</span>
          </h2>
          <p className="text-gray-300 mt-1">
            {mode === 'send' ? 'Send money securely' : 
             mode === 'topup' ? 'Add funds to your wallet' : 
             'Withdraw funds from your wallet'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      {!currentTransaction && !showConfirmation && (
        <GlassCard className="p-6">
          {renderPaymentForm()}
        </GlassCard>
      )}

      {showConfirmation && !processing && !currentTransaction && renderConfirmation()}

      {processing && renderProcessingSteps()}

      {currentTransaction?.status === 'completed' && renderPaymentComplete()}
    </div>
  );
}

export default PaymentProcessor;