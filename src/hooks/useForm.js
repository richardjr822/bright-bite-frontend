import { useState, useCallback, useMemo } from 'react';

/**
 * Custom Form Hook
 * Provides form state management, validation, and submission handling
 */
export const useForm = (initialValues = {}, validationSchema = null, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form to initial state
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsSubmitted(false);
  }, [initialValues]);

  // Set form values programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Set multiple values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // Validate single field
  const validateField = useCallback((name, value) => {
    if (!validationSchema) return '';
    
    const fieldErrors = validationSchema({ ...values, [name]: value });
    return fieldErrors[name] || '';
  }, [validationSchema, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validationSchema) return {};
    return validationSchema(values);
  }, [validationSchema, values]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error on change if field was touched
    if (touched[name] && errors[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, errors, validateField]);

  // Handle input blur (validate on blur)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validationSchema) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validationSchema, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // Check if form is valid
    const isValid = Object.keys(formErrors).length === 0;
    
    if (!isValid) {
      // Focus first error field
      const firstErrorField = Object.keys(formErrors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.focus();
      return false;
    }
    
    // Submit form
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsSubmitted(true);
        return true;
      } catch (error) {
        // Handle submission error
        if (error.fieldErrors) {
          setErrors(prev => ({ ...prev, ...error.fieldErrors }));
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
    
    return true;
  }, [values, validateForm, onSubmit]);

  // Check if form is valid
  const isValid = useMemo(() => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  }, [validateForm]);

  // Check if form is dirty (values changed from initial)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Get field props for easy binding
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    touched: touched[name],
  }), [values, errors, touched, handleChange, handleBlur]);

  // Get checkbox props
  const getCheckboxProps = useCallback((name) => ({
    name,
    checked: values[name] || false,
    onChange: handleChange,
    error: errors[name],
  }), [values, errors, handleChange]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    isValid,
    isDirty,
    
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setMultipleValues,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    
    // Helpers
    getFieldProps,
    getCheckboxProps,
  };
};

/**
 * Hook for handling form with API submission
 */
export const useFormWithApi = (initialValues, validationSchema, apiCall) => {
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(false);

  const handleApiSubmit = async (values) => {
    setApiError(null);
    setApiSuccess(false);
    
    try {
      const result = await apiCall(values);
      setApiSuccess(true);
      return result;
    } catch (error) {
      setApiError(error.message || 'An error occurred');
      throw error;
    }
  };

  const form = useForm(initialValues, validationSchema, handleApiSubmit);

  return {
    ...form,
    apiError,
    apiSuccess,
    clearApiError: () => setApiError(null),
  };
};

export default useForm;
