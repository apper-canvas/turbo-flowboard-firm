import { motion } from 'framer-motion';

const Avatar = ({ 
  name = 'User', 
  color = '#64748b', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const avatarClasses = `
    inline-flex items-center justify-center rounded-full text-white font-medium
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={avatarClasses}
      style={{ backgroundColor: color }}
      title={name}
      {...props}
    >
      {initials}
    </motion.div>
  );
};

export default Avatar;