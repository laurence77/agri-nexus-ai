import React, { InputHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from 'lucide-react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'agricultural' | 'search';
  showPasswordToggle?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Apple Glass Input Component
 * Optimized for field use with large touch targets and high visibility
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({
    label,
    error,
    success,
    hint,
    icon,
    iconPosition = 'left',
    variant = 'default',
    showPasswordToggle = false,
    loading = false,
    fullWidth = true,
    className,
    type: inputType = 'text',
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const type = showPasswordToggle && inputType === 'password' 
      ? (showPassword ? 'text' : 'password')
      : inputType;

    const getVariantStyles = () => {
      switch (variant) {
        case 'agricultural':
          return 'border-green-400 focus:border-green-300 bg-green-400/10';
        case 'search':
          return 'border-blue-400 focus:border-blue-300 bg-blue-400/10 rounded-full';
        default:
          return '';
      }
    };

    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            className={cn(
              'glass-input',
              getVariantStyles(),
              {
                'pl-12': icon && iconPosition === 'left',
                'pr-12': (icon && iconPosition === 'right') || showPasswordToggle || hasError || hasSuccess,
                'pr-20': showPasswordToggle && (hasError || hasSuccess),
                'w-full': fullWidth,
                'border-red-400 focus:border-red-300': hasError,
                'border-green-400 focus:border-green-300': hasSuccess,
                'animate-pulse': loading,
              },
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Right Side Icons */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Status Icons */}
            {hasError && (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            {hasSuccess && (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
            
            {/* Password Toggle */}
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h5 w-5" />
                )}
              </button>
            )}
            
            {/* Right Icon */}
            {icon && iconPosition === 'right' && !showPasswordToggle && !hasError && !hasSuccess && (
              <div className="text-gray-400">
                {icon}
              </div>
            )}
          </div>
          
          {/* Floating Label Animation */}
          {isFocused && (
            <div className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none">
              <div className="absolute inset-0 rounded-2xl border-2 border-green-400 opacity-50 animate-ping" />
            </div>
          )}
        </div>
        
        {/* Help Text */}
        {(error || success || hint) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-400 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </p>
            )}
            {success && (
              <p className="text-sm text-green-400 flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-400">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

/**
 * Search Input with Built-in Functionality
 */
interface SearchInputProps extends Omit<GlassInputProps, 'icon' | 'variant'> {
  onSearch?: (query: string) => void;
  clearable?: boolean;
  suggestions?: string[];
}

export function SearchInput({
  onSearch,
  clearable = true,
  suggestions = [],
  value,
  onChange,
  placeholder = 'Search...',
  className,
  ...props
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState(value || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(e);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
  };

  const handleSearch = () => {
    onSearch?.(query as string);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    const syntheticEvent = {
      target: { value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
    onSearch?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <GlassInput
        {...props}
        variant="search"
        icon={<Search className="h-5 w-5" />}
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={cn('pr-20', className)}
      />
      
      {/* Clear and Search Buttons */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        {clearable && query && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={handleSearch}
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/20 max-h-48 overflow-y-auto z-50">
          {suggestions
            .filter(suggestion => 
              suggestion.toLowerCase().includes((query as string).toLowerCase())
            )
            .map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Number Input with Agricultural Units
 */
interface NumberInputProps extends Omit<GlassInputProps, 'type'> {
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  showControls?: boolean;
}

export function NumberInput({
  unit,
  min,
  max,
  step = 1,
  onIncrement,
  onDecrement,
  showControls = true,
  value,
  onChange,
  className,
  ...props
}: NumberInputProps) {
  const handleIncrement = () => {
    if (onIncrement) {
      onIncrement();
    } else if (onChange) {
      const currentValue = Number(value) || 0;
      const newValue = Math.min(currentValue + step, max || Infinity);
      const syntheticEvent = {
        target: { value: newValue.toString() }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleDecrement = () => {
    if (onDecrement) {
      onDecrement();
    } else if (onChange) {
      const currentValue = Number(value) || 0;
      const newValue = Math.max(currentValue - step, min || -Infinity);
      const syntheticEvent = {
        target: { value: newValue.toString() }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="relative">
      <GlassInput
        {...props}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={cn(
          showControls && 'pr-20',
          unit && 'pr-16',
          className
        )}
      />
      
      {/* Unit Display */}
      {unit && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
          {unit}
        </div>
      )}
      
      {/* Increment/Decrement Controls */}
      {showControls && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
          <button
            type="button"
            onClick={handleIncrement}
            className="text-gray-400 hover:text-white transition-colors text-xs leading-none"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="text-gray-400 hover:text-white transition-colors text-xs leading-none"
          >
            ▼
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Date Input with Agricultural Context
 */
interface DateInputProps extends Omit<GlassInputProps, 'type'> {
  showToday?: boolean;
  minDate?: string;
  maxDate?: string;
}

export function DateInput({
  showToday = true,
  minDate,
  maxDate,
  value,
  onChange,
  className,
  ...props
}: DateInputProps) {
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const syntheticEvent = {
      target: { value: today }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
  };

  return (
    <div className="relative">
      <GlassInput
        {...props}
        type="date"
        min={minDate}
        max={maxDate}
        value={value}
        onChange={onChange}
        className={cn(showToday && 'pr-20', className)}
      />
      
      {showToday && (
        <button
          type="button"
          onClick={setToday}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
        >
          Today
        </button>
      )}
    </div>
  );
}

export default GlassInput;