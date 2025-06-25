import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data.',
  onRetry,
  className = ''
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center"
      >
        <ApperIcon name="AlertTriangle" size={32} className="text-error" />
      </motion.div>
      
      <h3 className="font-display font-semibold text-lg text-surface-900 mb-2">
        {title}
      </h3>
      
      <p className="text-surface-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          icon="RefreshCw"
          className="mx-auto"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;