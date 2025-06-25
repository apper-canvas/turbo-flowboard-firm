import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  debounceMs = 300 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    // Debounce search
    if (onSearch) {
      const timeoutId = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <motion.div
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          icon="Search"
          iconPosition="left"
          className="pr-10"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-100 transition-colors"
          >
            <ApperIcon name="X" size={14} className="text-surface-400" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SearchBar;