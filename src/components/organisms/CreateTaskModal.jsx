import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { userService } from '@/services/api/userService';

const CreateTaskModal = ({ isOpen, projectId, status = 'todo', onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: status,
    assigneeId: '',
    dueDate: '',
    startDate: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setFormData(prev => ({ ...prev, status }));
    }
  }, [isOpen, status]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await userService.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        projectId: parseInt(projectId, 10),
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId, 10) : null,
        dueDate: new Date(formData.dueDate).toISOString(),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString()
      };

      const newTask = await taskService.create(taskData);
      toast.success('Task created successfully!');
      onTaskCreated(newTask);
      handleClose();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        assigneeId: '',
        dueDate: '',
        startDate: ''
      });
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
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-surface-900">
                  Create New Task
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
                  name="title"
                  label="Task Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={errors.title}
                  placeholder="Enter task title"
                  required
                  icon="CheckSquare"
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-surface-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the task..."
                    rows={3}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-surface-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-surface-700">
                      Assignee
                    </label>
                    <select
                      value={formData.assigneeId}
                      onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      disabled={loadingUsers}
                    >
                      <option value="">Select assignee</option>
                      {users.map(user => (
                        <option key={user.Id} value={user.Id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="startDate"
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    icon="Calendar"
                  />
                  
                  <FormField
                    name="dueDate"
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    error={errors.dueDate}
                    required
                    icon="Calendar"
                  />
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
                    Create Task
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

export default CreateTaskModal;