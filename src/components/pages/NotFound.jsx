import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-100 flex items-center justify-center"
        >
          <ApperIcon name="AlertCircle" size={48} className="text-surface-400" />
        </motion.div>
        
        <h1 className="font-display font-bold text-4xl text-surface-900 mb-2">
          404
        </h1>
        
        <h2 className="font-display font-semibold text-xl text-surface-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-surface-600 mb-8">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            icon="ArrowLeft"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            icon="Home"
          >
            Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;