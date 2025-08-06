import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import PaystackService from '@/services/payment/PaystackService';

interface PaymentFormProps {
  amount: number;
  currency: string;
  customerEmail: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
}

interface CardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  pin?: string;
}

export function PaymentForm({
  amount,
  currency,
  customerEmail,
  onSuccess,
  onError,
  metadata = {}
}: PaymentFormProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    pin: ''
  });
  const [showCvv, setShowCvv] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requiresPin, setRequiresPin] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const paystackService = new PaystackService();

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('50') || cleanNumber.startsWith('65')) return 'verve';
    return 'unknown';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const cleanCardNumber = cardDetails.number.replace(/\s/g, '');

    // Card number validation
    if (!cleanCardNumber) {
      newErrors.number = 'Card number is required';
    } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.number = 'Invalid card number length';
    }

    // Expiry validation
    if (!cardDetails.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    } else if (parseInt(cardDetails.expiryMonth) < 1 || parseInt(cardDetails.expiryMonth) > 12) {
      newErrors.expiryMonth = 'Invalid month';
    }

    if (!cardDetails.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const inputYear = parseInt(cardDetails.expiryYear);
      if (inputYear < currentYear) {
        newErrors.expiryYear = 'Card has expired';
      }
    }

    // CVV validation
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV';
    }

    // PIN validation (if required)
    if (requiresPin && !cardDetails.pin) {
      newErrors.pin = 'PIN is required';
    }

    // OTP validation (if required)
    if (requiresOtp && !otpCode) {
      newErrors.otp = 'OTP is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      // For direct card charges, you would typically:
      // 1. Initialize transaction
      // 2. Submit card details
      // 3. Handle 3DS authentication if required
      // 4. Handle PIN/OTP if required
      
      // Using Paystack popup instead for better security
      const transaction = await paystackService.initializeTransaction({
        email: customerEmail,
        amount: PaystackService.toKobo(amount),
        currency,
        metadata,
        channels: ['card']
      });

      if (transaction.status) {
        PaystackService.initializePaystackPopup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          email: customerEmail,
          amount: PaystackService.toKobo(amount),
          currency,
          ref: transaction.data.reference,
          metadata,
          channels: ['card'],
          callback: (response) => {
            handlePaymentSuccess(response.reference);
          },
          onClose: () => {
            setIsProcessing(false);
          }
        });
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const verification = await paystackService.verifyTransaction(reference);
      
      if (verification.status && verification.data.status === 'success') {
        onSuccess(reference);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      onError('Payment verification failed');
    }
    setIsProcessing(false);
  };

  const cardType = getCardType(cardDetails.number);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold">{PaystackService.formatCurrency(amount)}</p>
            <p className="text-sm text-gray-600">{currency}</p>
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s/g, '').length <= 19) {
                    setCardDetails(prev => ({ ...prev, number: formatted }));
                  }
                }}
                className={`pr-12 ${errors.number ? 'border-red-500' : ''}`}
                maxLength={23}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {cardType === 'visa' && <span className="text-blue-600 font-bold">VISA</span>}
                {cardType === 'mastercard' && <span className="text-red-600 font-bold">MC</span>}
                {cardType === 'verve' && <span className="text-green-600 font-bold">VERVE</span>}
              </div>
            </div>
            {errors.number && (
              <p className="text-sm text-red-600 mt-1">{errors.number}</p>
            )}
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                type="text"
                placeholder="MM"
                value={cardDetails.expiryMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    setCardDetails(prev => ({ ...prev, expiryMonth: value }));
                  }
                }}
                className={errors.expiryMonth ? 'border-red-500' : ''}
                maxLength={2}
              />
              {errors.expiryMonth && (
                <p className="text-xs text-red-600 mt-1">{errors.expiryMonth}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                type="text"
                placeholder="YY"
                value={cardDetails.expiryYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    setCardDetails(prev => ({ ...prev, expiryYear: value }));
                  }
                }}
                className={errors.expiryYear ? 'border-red-500' : ''}
                maxLength={2}
              />
              {errors.expiryYear && (
                <p className="text-xs text-red-600 mt-1">{errors.expiryYear}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  type={showCvv ? 'text' : 'password'}
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardDetails(prev => ({ ...prev, cvv: value }));
                    }
                  }}
                  className={`pr-8 ${errors.cvv ? 'border-red-500' : ''}`}
                  maxLength={4}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCvv(!showCvv)}
                >
                  {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.cvv && (
                <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* PIN Field (if required) */}
          {requiresPin && (
            <div>
              <Label htmlFor="pin">Card PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="****"
                  value={cardDetails.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardDetails(prev => ({ ...prev, pin: value }));
                    }
                  }}
                  className={`pr-8 ${errors.pin ? 'border-red-500' : ''}`}
                  maxLength={4}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.pin && (
                <p className="text-sm text-red-600 mt-1">{errors.pin}</p>
              )}
            </div>
          )}

          {/* OTP Field (if required) */}
          {requiresOtp && (
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtpCode(value);
                  }
                }}
                className={errors.otp ? 'border-red-500' : ''}
                maxLength={6}
              />
              {errors.otp && (
                <p className="text-sm text-red-600 mt-1">{errors.otp}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Please enter the OTP sent to your phone
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Secure Payment</p>
                <p className="text-blue-700">
                  Your payment information is encrypted and secure. 
                  We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Please fix the following errors:</p>
                  <ul className="text-red-700 mt-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pay {PaystackService.formatCurrency(amount)}
              </>
            )}
          </Button>
        </form>

        {/* Accepted Cards */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">We accept</p>
          <div className="flex justify-center space-x-4">
            <span className="text-blue-600 font-bold">VISA</span>
            <span className="text-red-600 font-bold">MASTERCARD</span>
            <span className="text-green-600 font-bold">VERVE</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentForm;