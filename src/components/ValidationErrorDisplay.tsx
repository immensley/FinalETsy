import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  onDismiss?: (field: string) => void;
  className?: string;
}

const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  errors,
  onDismiss,
  className = ''
}) => {
  if (errors.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <div
          key={`${error.field}-${index}`}
          className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800">
              <span className="font-medium capitalize">{error.field}:</span> {error.message}
            </p>
            {error.code && (
              <p className="text-xs text-red-600 mt-1">Error Code: {error.code}</p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(error.field)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Hook for form validation with error handling
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = (field: keyof T, value: any): string | null => {
    const rule = validationRules[field];
    return rule ? rule(value) : null;
  };

  const validateAll = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors.push({
          field: field as string,
          message: error,
          code: 'VALIDATION_ERROR'
        });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it's been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => {
        const filtered = prev.filter(e => e.field !== field);
        return error ? [...filtered, { field: field as string, message: error }] : filtered;
      });
    }
  };

  const setTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field when touched
    const error = validateField(field, values[field]);
    if (error) {
      setErrors(prev => {
        const filtered = prev.filter(e => e.field !== field);
        return [...filtered, { field: field as string, message: error }];
      });
    }
  };

  const dismissError = (field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors([]);
    setTouched({} as Record<keyof T, boolean>);
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validateAll,
    dismissError,
    reset,
    isValid: errors.length === 0,
    hasErrors: errors.length > 0
  };
}

export default ValidationErrorDisplay;