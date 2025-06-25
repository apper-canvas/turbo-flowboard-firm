import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const EmptyState = ({ 
  icon = 'Package',
  title = 'No items found',
  description = 'Get started by creating your first item',
  actionLabel = 'Create Item',
  onAction,
  className = ''
}) => {
  const iconBounceVariants = {
    animate: { 
      y: [0, -10, 0],
      transition: { 
        repeat: Infinity, 
        duration: 3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        variants={iconBounceVariants}
        animate="animate"
        className="mb-4"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-surface-100 flex items-center justify-center">
          <ApperIcon name={icon} size={32} className="text-surface-400" />
        </div>
      </motion.div>
      
      <h3 className="font-display font-semibold text-lg text-surface-900 mb-2">
        {title}
      </h3>
      
      <p className="text-surface-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {onAction && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onAction}
            icon="Plus"
            className="mx-auto"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;