import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 focus:ring-primary/50 shadow-sm',
    secondary: 'bg-secondary text-white hover:brightness-110 focus:ring-secondary/50 shadow-sm',
    accent: 'bg-accent text-white hover:brightness-110 focus:ring-accent/50 shadow-sm',
    outline: 'border border-surface-300 text-surface-700 hover:bg-surface-50 focus:ring-primary/50',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus:ring-primary/50',
    danger: 'bg-error text-white hover:brightness-110 focus:ring-error/50 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2.5'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled || loading ? disabledClasses : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <ApperIcon name="Loader2" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        </motion.div>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}
    </>
  );

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;