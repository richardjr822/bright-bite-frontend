import React, { useState, forwardRef } from 'react';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

/**
 * Enhanced Form Input Component
 * Includes validation, error display, and accessibility features
 */
const FormInput = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  autoComplete,
  icon: Icon,
  hint,
  showSuccess = false,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = touched && error;
  const isValid = touched && !error && value && showSuccess;

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Leading Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : hint ? `${name}-hint` : undefined}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${Icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${hasError 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
              : isValid
                ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
            focus:outline-none focus:ring-2
            placeholder:text-gray-400
            ${inputClassName}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
          </button>
        )}

        {/* Validation Icons */}
        {!isPassword && (hasError || isValid) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && <FaExclamationCircle className="w-5 h-5 text-red-500" />}
            {isValid && <FaCheckCircle className="w-5 h-5 text-green-500" />}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p 
          id={`${name}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <FaExclamationCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Hint Text */}
      {hint && !hasError && (
        <p 
          id={`${name}-hint`}
          className="mt-1.5 text-sm text-gray-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

/**
 * Textarea Component with validation
 */
export const FormTextarea = forwardRef(({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  hint,
  className = '',
  ...props
}, ref) => {
  const hasError = touched && error;
  const characterCount = value?.length || 0;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none
          ${hasError 
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
          focus:outline-none focus:ring-2
          placeholder:text-gray-400
        `}
        {...props}
      />

      <div className="flex justify-between items-center mt-1.5">
        {hasError ? (
          <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <FaExclamationCircle className="w-4 h-4" />
            {error}
          </p>
        ) : hint ? (
          <p className="text-sm text-gray-500">{hint}</p>
        ) : (
          <span />
        )}
        
        {maxLength && (
          <span className={`text-sm ${characterCount > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

/**
 * Select Component with validation
 */
export const FormSelect = forwardRef(({
  label,
  name,
  options = [],
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  const hasError = touched && error;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 appearance-none
          bg-no-repeat bg-right
          ${hasError 
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
          focus:outline-none focus:ring-2
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
          <FaExclamationCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

/**
 * Checkbox Component
 */
export const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  error,
  disabled = false,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 mt-0.5"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
    {error && (
      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 ml-8" role="alert">
        <FaExclamationCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

export default FormInput;
