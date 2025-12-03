/**
 * Form Validation Utilities
 * Comprehensive validation functions for all form inputs
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, at least 1 number, 1 letter)
export const isValidPassword = (password) => {
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  return minLength && hasNumber && hasLetter;
};

// Strong password validation (includes special chars and uppercase)
export const isStrongPassword = (password) => {
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return minLength && hasNumber && hasLower && hasUpper && hasSpecial;
};

// Phone number validation (PH format)
export const isValidPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Philippine mobile numbers: 09XX or +639XX
  const phMobileRegex = /^(09|\+639)\d{9}$/;
  return phMobileRegex.test(cleanPhone) || cleanPhone.length === 10 || cleanPhone.length === 11;
};

// Name validation (letters, spaces, hyphens)
export const isValidName = (name) => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Required field validation
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Min length validation
export const hasMinLength = (value, min) => {
  return typeof value === 'string' && value.trim().length >= min;
};

// Max length validation
export const hasMaxLength = (value, max) => {
  return typeof value === 'string' && value.trim().length <= max;
};

// Numeric validation
export const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isNumeric(value) && parseFloat(value) > 0;
};

// Range validation
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return isNumeric(value) && num >= min && num <= max;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Future date validation
export const isFutureDate = (date) => {
  return isValidDate(new Date(date)) && new Date(date) > new Date();
};

// Past date validation
export const isPastDate = (date) => {
  return isValidDate(new Date(date)) && new Date(date) < new Date();
};

// Age validation (minimum age)
export const isMinAge = (birthDate, minAge = 13) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  return age >= minAge;
};

// Match validation (e.g., password confirmation)
export const matches = (value1, value2) => {
  return value1 === value2;
};

/**
 * Validation Rules Builder
 * Creates a validation schema for forms
 */
export const createValidator = (rules) => {
  return (values) => {
    const errors = {};
    
    Object.keys(rules).forEach((field) => {
      const fieldRules = rules[field];
      const value = values[field];
      
      for (const rule of fieldRules) {
        const error = rule(value, values);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    });
    
    return errors;
  };
};

/**
 * Common Validation Rules
 * Pre-built rules for common use cases
 */
export const rules = {
  required: (message = 'This field is required') => (value) => 
    !isRequired(value) ? message : null,
  
  email: (message = 'Please enter a valid email address') => (value) =>
    value && !isValidEmail(value) ? message : null,
  
  password: (message = 'Password must be at least 8 characters with letters and numbers') => (value) =>
    value && !isValidPassword(value) ? message : null,
  
  strongPassword: (message = 'Password must include uppercase, lowercase, number, and special character') => (value) =>
    value && !isStrongPassword(value) ? message : null,
  
  phone: (message = 'Please enter a valid phone number') => (value) =>
    value && !isValidPhone(value) ? message : null,
  
  name: (message = 'Please enter a valid name') => (value) =>
    value && !isValidName(value) ? message : null,
  
  minLength: (min, message) => (value) =>
    value && !hasMinLength(value, min) ? (message || `Must be at least ${min} characters`) : null,
  
  maxLength: (max, message) => (value) =>
    value && !hasMaxLength(value, max) ? (message || `Must be no more than ${max} characters`) : null,
  
  numeric: (message = 'Please enter a valid number') => (value) =>
    value && !isNumeric(value) ? message : null,
  
  positive: (message = 'Please enter a positive number') => (value) =>
    value && !isPositiveNumber(value) ? message : null,
  
  range: (min, max, message) => (value) =>
    value && !isInRange(value, min, max) ? (message || `Must be between ${min} and ${max}`) : null,
  
  match: (field, message = 'Fields do not match') => (value, values) =>
    value !== values[field] ? message : null,
  
  url: (message = 'Please enter a valid URL') => (value) =>
    value && !isValidUrl(value) ? message : null,
};

/**
 * Common Form Validation Schemas
 */
export const schemas = {
  login: createValidator({
    email: [rules.required(), rules.email()],
    password: [rules.required()],
  }),
  
  register: createValidator({
    name: [rules.required(), rules.name(), rules.minLength(2)],
    email: [rules.required(), rules.email()],
    password: [rules.required(), rules.password()],
    confirmPassword: [rules.required(), rules.match('password', 'Passwords do not match')],
  }),
  
  profile: createValidator({
    name: [rules.required(), rules.name()],
    email: [rules.required(), rules.email()],
    phone: [rules.phone()],
  }),
  
  menuItem: createValidator({
    name: [rules.required(), rules.minLength(2), rules.maxLength(100)],
    description: [rules.required(), rules.minLength(10), rules.maxLength(500)],
    price: [rules.required(), rules.positive()],
    category: [rules.required()],
  }),
  
  mealPreferences: createValidator({
    age: [rules.required(), rules.range(13, 100, 'Age must be between 13 and 100')],
    height: [rules.required(), rules.range(100, 250, 'Height must be between 100 and 250 cm')],
    weight: [rules.required(), rules.range(30, 300, 'Weight must be between 30 and 300 kg')],
    goal: [rules.required()],
    calorieTarget: [rules.range(1000, 5000, 'Calorie target must be between 1000 and 5000')],
  }),
  
  feedback: createValidator({
    rating: [rules.required('Please select a rating'), rules.range(1, 5)],
    comment: [rules.minLength(10, 'Please provide at least 10 characters of feedback')],
  }),
  
  order: createValidator({
    items: [rules.required('Please add items to your cart')],
  }),
};

/**
 * Field-level validation helper
 * Returns error message or empty string
 */
export const validateField = (field, value, schema) => {
  const errors = schema({ [field]: value });
  return errors[field] || '';
};

/**
 * Real-time validation hook helper
 */
export const useFormValidation = (initialValues, validationSchema) => {
  const validate = (values) => validationSchema(values);
  const validateSingle = (field, value) => validateField(field, value, validationSchema);
  
  return { validate, validateSingle };
};

export default {
  isValidEmail,
  isValidPassword,
  isStrongPassword,
  isValidPhone,
  isValidName,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isNumeric,
  isPositiveNumber,
  isInRange,
  isValidUrl,
  isValidDate,
  isFutureDate,
  isPastDate,
  isMinAge,
  matches,
  createValidator,
  rules,
  schemas,
  validateField,
};
