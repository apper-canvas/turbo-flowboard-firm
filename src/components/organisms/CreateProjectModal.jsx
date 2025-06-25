import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { projectService } from '@/services/api/projectService';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newProject = await projectService.create(formData);
      toast.success('Project created successfully!');
      onProjectCreated(newProject);
      onClose();
      setFormData({ name: '', description: '', status: 'planning' });
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ name: '', description: '', status: 'planning' });
      setErrors({});
    }
  };

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const modalVariants = {
    open: { opacity: 1, scale: 1 },
    closed: { opacity: 0, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={modalVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-surface-900">
                  Create New Project
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                  disabled={loading}
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  name="name"
                  label="Project Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter project name"
                  required
                  icon="Folder"
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-surface-700">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project..."
                    rows={3}
                    className={`
                      w-full px-3 py-2 border rounded-lg transition-colors duration-200 
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                      ${errors.description 
                        ? 'border-error focus:border-error focus:ring-error/50' 
                        : 'border-surface-300 hover:border-surface-400'
                      }
                    `}
                  />
                  {errors.description && (
                    <p className="text-sm text-error flex items-center gap-1">
                      <ApperIcon name="AlertCircle" size={14} />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-surface-700">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    Create Project
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;