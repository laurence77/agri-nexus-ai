import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  AlertCircle,
  Loader,
  Info,
  Star,
  Building2,
  User,
  Mail,
  Phone
} from 'lucide-react';
import PaystackService from '@/services/payment/PaystackService';

interface CheckoutPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'ussd';
  preferred: boolean;
}

export function CheckoutFlow({ 
  selectedPlan, 
  onSuccess, 
  onCancel 
}: { 
  selectedPlan: CheckoutPlan;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria'
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>({
    type: 'card',
    preferred: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const paystackService = new PaystackService();

  const paymentMethods = [
    {
      type: 'card' as const,
      name: 'Debit/Credit Card',
      description: 'Visa, Mastercard, Verve',
      icon: '💳',
      popular: true
    },
    {
      type: 'bank_transfer' as const,
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: '🏦',
      popular: false
    },
    {
      type: 'ussd' as const,
      name: 'USSD',
      description: 'Pay with mobile banking',
      icon: '📱',
      popular: false
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      // Validate billing information
      if (!billingInfo.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!billingInfo.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!billingInfo.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(billingInfo.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!billingInfo.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === 'save10') {
      setDiscount(0.1);
    } else if (promoCode.toLowerCase() === 'newuser') {
      setDiscount(0.15);
    } else {
      setDiscount(0);
      setErrors({ promoCode: 'Invalid promo code' });
    }
  };

  const calculateTotal = () => {
    const subtotal = selectedPlan.price;
    const discountAmount = subtotal * discount;
    return subtotal - discountAmount;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const totalAmount = calculateTotal();
      
      // Initialize Paystack transaction
      const transaction = await paystackService.initializeTransaction({
        email: billingInfo.email,
        amount: PaystackService.toKobo(totalAmount),
        currency: selectedPlan.currency,
        metadata: {
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          interval: selectedPlan.interval,
          billingInfo,
          promoCode: promoCode || null,
          discount
        },
        channels: selectedPaymentMethod.type === 'card' ? ['card'] :
                 selectedPaymentMethod.type === 'bank_transfer' ? ['bank', 'bank_transfer'] :
                 ['ussd']
      });

      if (transaction.status) {
        // Open Paystack payment popup
        PaystackService.initializePaystackPopup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
          email: billingInfo.email,
          amount: PaystackService.toKobo(totalAmount),
          currency: selectedPlan.currency,
          ref: transaction.data.reference,
          metadata: {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            customerName: `${billingInfo.firstName} ${billingInfo.lastName}`
          },
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
      console.error('Payment initialization error:', error);
      setErrors({ payment: 'Failed to initialize payment. Please try again.' });
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Verify the transaction
      const verification = await paystackService.verifyTransaction(reference);
      
      if (verification.status && verification.data.status === 'success') {
        onSuccess(reference);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setErrors({ payment: 'Payment verification failed. Please contact support.' });
    }
    setIsProcessing(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= step 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Plan</h2>
        <p className="text-gray-600">Confirm your selected plan details</p>
      </div>

      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {selectedPlan.popular && <Star className="h-5 w-5 text-yellow-500" />}
              <div>
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                <p className="text-gray-600">{selectedPlan.description}</p>
              </div>
            </div>
            {selectedPlan.popular && (
              <Badge className="bg-yellow-100 text-yellow-800">Most Popular</Badge>
            )}
          </div>

          <div className="text-center py-4 border-y border-gray-200 my-4">
            <p className="text-3xl font-bold">
              {PaystackService.formatCurrency(selectedPlan.price)}
            </p>
            <p className="text-gray-600">per {selectedPlan.interval}</p>
          </div>

          <div className="space-y-2">
            {selectedPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={nextStep}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Billing Information</h2>
        <p className="text-gray-600">Please provide your billing details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <div className="relative">
            <User className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="firstName"
              className="pl-10"
              value={billingInfo.firstName}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Enter first name"
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <div className="relative">
            <User className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="lastName"
              className="pl-10"
              value={billingInfo.lastName}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Enter last name"
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              className="pl-10"
              value={billingInfo.email}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="relative">
            <Phone className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="phone"
              className="pl-10"
              value={billingInfo.phone}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="companyName">Company Name (Optional)</Label>
          <div className="relative">
            <Building2 className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="companyName"
              className="pl-10"
              value={billingInfo.companyName}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Enter company name"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
        <p className="text-gray-600">Choose your preferred payment method</p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <Card 
            key={method.type}
            className={`cursor-pointer transition-all ${
              selectedPaymentMethod.type === method.type 
                ? 'border-blue-500 bg-blue-50' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod({ type: method.type, preferred: true })}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.popular && (
                    <Badge className="bg-green-100 text-green-800">Popular</Badge>
                  )}
                  <input
                    type="radio"
                    checked={selectedPaymentMethod.type === method.type}
                    onChange={() => setSelectedPaymentMethod({ type: method.type, preferred: true })}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Secure Payment</p>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. We use Paystack's 
              secure payment infrastructure to protect your data.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review & Pay</h2>
        <p className="text-gray-600">Review your order and complete payment</p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{selectedPlan.name} Plan ({selectedPlan.interval})</span>
              <span>{PaystackService.formatCurrency(selectedPlan.price)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({promoCode})</span>
                <span>-{PaystackService.formatCurrency(selectedPlan.price * discount)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{PaystackService.formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Code */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button variant="outline" onClick={applyPromoCode}>
              Apply
            </Button>
          </div>
          {errors.promoCode && (
            <p className="text-sm text-red-600 mt-1">{errors.promoCode}</p>
          )}
        </CardContent>
      </Card>

      {/* Billing Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {billingInfo.firstName} {billingInfo.lastName}</p>
            <p><strong>Email:</strong> {billingInfo.email}</p>
            <p><strong>Phone:</strong> {billingInfo.phone}</p>
            {billingInfo.companyName && (
              <p><strong>Company:</strong> {billingInfo.companyName}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {errors.payment && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{errors.payment}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Complete Payment
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {renderStepIndicator()}
      
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
}

export default CheckoutFlow;
