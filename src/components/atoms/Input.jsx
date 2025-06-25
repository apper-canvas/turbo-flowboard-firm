import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'text',
  ...props 
}, ref) => {
  const hasIcon = Boolean(icon);
  const hasError = Boolean(error);

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200 
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    ${hasError 
      ? 'border-error focus:border-error focus:ring-error/50' 
      : 'border-surface-300 hover:border-surface-400'
    }
    ${hasIcon && iconPosition === 'left' ? 'pl-10' : ''}
    ${hasIcon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        {hasIcon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <ApperIcon 
              name={icon} 
              size={16} 
              className={hasError ? 'text-error' : 'text-surface-400'} 
            />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>
      {hasError && (
        <p className="text-sm text-error flex items-center gap-1">
          <ApperIcon name="AlertCircle" size={14} />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;