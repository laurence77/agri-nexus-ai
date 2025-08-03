import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Upload,
  MapPin,
  DollarSign,
  Calendar,
  Truck,
  CreditCard,
  Phone,
  X,
  Plus,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Tag,
  Layers
} from "lucide-react";

interface ProductListingFormProps {
  onClose: () => void;
  onSubmit: (product: any) => void;
}

const ProductListingForm = ({ onClose, onSubmit }: ProductListingFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    currency: 'KSH',
    unit: 'kg',
    quantity: '',
    quality: '',
    harvestDate: '',
    location: '',
    deliveryOptions: [] as string[],
    paymentMethods: [] as string[],
    tags: [] as string[],
    images: [] as string[],
    phone: '',
    featured: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const categories = [
    { id: 'grains', name: 'Grains & Cereals' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'cash-crops', name: 'Cash Crops' },
    { id: 'livestock', name: 'Livestock' },
    { id: 'seeds', name: 'Seeds & Inputs' }
  ];

  const qualities = ['Premium', 'Grade A', 'Grade B', 'Standard', 'Organic'];
  const units = ['kg', 'bags', 'tons', 'pieces', 'bunches', 'liters'];
  const currencies = ['KSH', 'USD', 'NGN', 'GHS', 'ETB'];

  const deliveryOptions = [
    { id: 'pickup', name: 'Pickup from Farm' },
    { id: 'local', name: 'Local Delivery' },
    { id: 'regional', name: 'Regional Transport' },
    { id: 'export', name: 'Export Shipping' }
  ];

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa' },
    { id: 'cash', name: 'Cash on Delivery' },
    { id: 'bank', name: 'Bank Transfer' },
    { id: 'escrow', name: 'Escrow Service' }
  ];

  const suggestedTags = [
    'organic', 'fresh', 'bulk-available', 'export-quality', 'same-day',
    'grade-a', 'sun-dried', 'recently-harvested', 'premium', 'certified'
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    // Submit the product
    onSubmit({
      ...formData,
      id: `product_${Date.now()}`,
      seller: {
        name: 'Current User', // This would come from auth context
        location: formData.location,
        rating: 4.5,
        verified: true,
        phone: formData.phone
      },
      priceHistory: [{ date: new Date().toISOString(), price: parseFloat(formData.price) }],
      featured: formData.featured
    });

    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className="glass-input w-full"
              placeholder="e.g., Premium White Maize"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFormData('category', category.id)}
                  className={`glass-button p-3 text-left ${
                    formData.category === category.id ? 'bg-white/30' : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              className="glass-input w-full h-24"
              placeholder="Describe your product quality, harvest details, and any special features..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Quantity</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateFormData('price', e.target.value)}
                className="glass-input w-full"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => updateFormData('currency', e.target.value)}
                className="glass-input w-full"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => updateFormData('unit', e.target.value)}
                className="glass-input w-full"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => updateFormData('quantity', e.target.value)}
                className="glass-input w-full"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
            <div className="grid grid-cols-3 gap-2">
              {qualities.map((quality) => (
                <button
                  key={quality}
                  onClick={() => updateFormData('quality', quality)}
                  className={`glass-button p-2 ${
                    formData.quality === quality ? 'bg-white/30' : ''
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) => updateFormData('harvestDate', e.target.value)}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                className="glass-input w-full"
                placeholder="City, County, Country"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery & Payment</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Options</label>
            <div className="grid grid-cols-2 gap-3">
              {deliveryOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.deliveryOptions.includes(option.id)}
                    onChange={() => toggleArrayField('deliveryOptions', option.id)}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Methods</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(method.id)}
                    onChange={() => toggleArrayField('paymentMethods', method.id)}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className="glass-input w-full"
              placeholder="+254 722 123 456"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Images & Tags</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">Upload high-quality photos of your product</p>
              <Button className="glass-button">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <p className="text-xs text-gray-500 mt-2">Up to 5 images, max 5MB each</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
            <p className="text-sm text-gray-600 mb-3">Add tags to help buyers find your product</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleArrayField('tags', tag)}
                  className={`glass-button text-xs px-3 py-1 ${
                    formData.tags.includes(tag) ? 'bg-white/30' : ''
                  }`}
                >
                  {formData.tags.includes(tag) && <Check className="w-3 h-3 mr-1" />}
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} className="glass-badge success">
                  {tag}
                  <button
                    onClick={() => toggleArrayField('tags', tag)}
                    className="ml-1 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Feature Your Listing</p>
                <p className="text-sm text-yellow-700">Get 3x more visibility for KSh 500</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => updateFormData('featured', e.target.checked)}
              className="h-4 w-4 text-yellow-600 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Product Listing</h2>
              <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="glass-button !padding-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-full h-2 rounded-full mx-1 ${
                  i + 1 <= currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 1}
            className="glass-button"
          >
            Back
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 <= currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
            >
              <Check className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingForm;