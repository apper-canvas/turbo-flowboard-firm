import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  count = 1, 
  type = 'card',
  className = '' 
}) => {
  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut'
      }
    }
  };

  const CardSkeleton = () => (
    <div className="bg-white rounded-lg border border-surface-200 p-6 relative overflow-hidden">
      <motion.div
        variants={shimmerVariants}
        animate="animate"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-200 to-transparent opacity-50"
      />
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-surface-200 rounded w-3/4"></div>
            <div className="h-4 bg-surface-200 rounded w-full"></div>
            <div className="h-4 bg-surface-200 rounded w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-surface-200 rounded-full"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-surface-200 rounded w-20"></div>
          <div className="h-4 bg-surface-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  const TaskSkeleton = () => (
    <div className="bg-white rounded-lg border border-surface-200 p-4 relative overflow-hidden">
      <motion.div
        variants={shimmerVariants}
        animate="animate"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-200 to-transparent opacity-50"
      />
      <div className="space-y-3">
        <div className="h-4 bg-surface-200 rounded w-4/5"></div>
        <div className="h-3 bg-surface-200 rounded w-full"></div>
        <div className="h-3 bg-surface-200 rounded w-3/4"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-surface-200 rounded-full"></div>
            <div className="h-5 bg-surface-200 rounded w-16"></div>
          </div>
          <div className="w-4 h-4 bg-surface-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-surface-200 relative overflow-hidden">
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-200 to-transparent opacity-50"
          />
          <div className="w-10 h-10 bg-surface-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-200 rounded w-1/3"></div>
            <div className="h-3 bg-surface-200 rounded w-2/3"></div>
          </div>
          <div className="h-6 bg-surface-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'task':
        return [...Array(count)].map((_, i) => <TaskSkeleton key={i} />);
      case 'list':
        return <ListSkeleton />;
      default:
        return [...Array(count)].map((_, i) => <CardSkeleton key={i} />);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;