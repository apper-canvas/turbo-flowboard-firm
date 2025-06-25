import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { projectService } from '@/services/api/projectService';
import { userService } from '@/services/api/userService';

const BulkActionToolbar = ({ 
  selectedTasks, 
  onClearSelection, 
  onTasksUpdated,
  projects = [],
  users = []
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showUpdateMenu, setShowUpdateMenu] = useState(false);

  const selectedCount = selectedTasks.length;

  const handleBulkMove = async (targetStatus, targetProjectId = null) => {
    if (selectedCount === 0) return;
    
    setIsLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      await taskService.bulkMove(taskIds, targetStatus, targetProjectId);
      
      toast.success(`${selectedCount} task${selectedCount > 1 ? 's' : ''} moved successfully`);
      onTasksUpdated();
      onClearSelection();
      setShowMoveMenu(false);
    } catch (error) {
      toast.error('Failed to move tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAssign = async (assigneeId) => {
    if (selectedCount === 0) return;
    
    setIsLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      await taskService.bulkAssign(taskIds, assigneeId);
      
      const assignee = users.find(user => user.Id === parseInt(assigneeId, 10));
      toast.success(`${selectedCount} task${selectedCount > 1 ? 's' : ''} assigned to ${assignee?.name || 'user'}`);
      onTasksUpdated();
      onClearSelection();
      setShowAssignMenu(false);
    } catch (error) {
      toast.error('Failed to assign tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedCount === 0) return;
    
    setIsLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      await taskService.bulkUpdate(taskIds, updates);
      
      toast.success(`${selectedCount} task${selectedCount > 1 ? 's' : ''} updated successfully`);
      onTasksUpdated();
      onClearSelection();
      setShowUpdateMenu(false);
    } catch (error) {
      toast.error('Failed to update tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCount} task${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      await taskService.bulkDelete(taskIds);
      
      toast.success(`${selectedCount} task${selectedCount > 1 ? 's' : ''} deleted successfully`);
      onTasksUpdated();
      onClearSelection();
    } catch (error) {
      toast.error('Failed to delete tasks');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-lg shadow-lg border border-surface-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{selectedCount}</span>
              </div>
              <span className="font-medium text-surface-900">
                {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="h-6 w-px bg-surface-200"></div>

            <div className="flex items-center gap-2">
              {/* Move Action */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Move"
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  disabled={isLoading}
                >
                  Move
                </Button>
                
                {showMoveMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-surface-200 py-2 min-w-48 z-10">
                    <div className="px-3 py-2 text-xs font-medium text-surface-500 border-b border-surface-100">
                      Move to Status
                    </div>
                    <button
                      onClick={() => handleBulkMove('todo')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                    >
                      <ApperIcon name="Circle" size={14} />
                      To Do
                    </button>
                    <button
                      onClick={() => handleBulkMove('in-progress')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                    >
                      <ApperIcon name="PlayCircle" size={14} />
                      In Progress
                    </button>
                    <button
                      onClick={() => handleBulkMove('done')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                    >
                      <ApperIcon name="CheckCircle" size={14} />
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Assign Action */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="UserPlus"
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  disabled={isLoading}
                >
                  Assign
                </Button>
                
                {showAssignMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-surface-200 py-2 min-w-48 z-10 max-h-48 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-medium text-surface-500 border-b border-surface-100">
                      Assign to User
                    </div>
                    {users.map(user => (
                      <button
                        key={user.Id}
                        onClick={() => handleBulkAssign(user.Id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: user.avatar }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Update Action */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Edit"
                  onClick={() => setShowUpdateMenu(!showUpdateMenu)}
                  disabled={isLoading}
                >
                  Update
                </Button>
                
                {showUpdateMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-surface-200 py-2 min-w-48 z-10">
                    <div className="px-3 py-2 text-xs font-medium text-surface-500 border-b border-surface-100">
                      Update Properties
                    </div>
                    <button
                      onClick={() => handleBulkUpdate({ progress: 0 })}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                    >
                      <ApperIcon name="RotateCcw" size={14} />
                      Reset Progress
                    </button>
                    <button
                      onClick={() => handleBulkUpdate({ progress: 50 })}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                    >
                      <ApperIcon name="Target" size={14} />
                      Set 50% Progress
                    </button>
                    <button
                      onClick={() => handleBulkUpdate({ progress: 100 })}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 flex items-center gap-2"
                    >
                      <ApperIcon name="CheckCircle" size={14} />
                      Complete (100%)
                    </button>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-surface-200"></div>

              {/* Delete Action */}
              <Button
                variant="ghost"
                size="sm"
                icon="Trash2"
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="text-error hover:text-error hover:bg-error/10"
              >
                Delete
              </Button>

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={onClearSelection}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActionToolbar;