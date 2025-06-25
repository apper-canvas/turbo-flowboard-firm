import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import commentService from "@/services/api/commentService";
import userService from "@/services/api/userService";
import taskService from "@/services/api/taskService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import FileUpload from "@/components/molecules/FileUpload";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const TaskModal = ({ isOpen, task, users = [], onClose, onTaskUpdated }) => {
  const [editMode, setEditMode] = useState(false);
const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [attachments, setAttachments] = useState([]);
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        progress: task.progress || 0
});
      loadComments();
      setAttachments(task.attachments || []);
    }
  }, [task]);

  const loadComments = async () => {
    if (!task) return;
    
    setLoadingComments(true);
    try {
      const taskComments = await commentService.getByTaskId(task.Id);
      setComments(taskComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : task.dueDate
      });
      toast.success('Task updated successfully!');
      setEditMode(false);
      onTaskUpdated(updatedTask);
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await commentService.create({
        taskId: task.Id,
        authorId: 1, // Current user ID (mock)
        content: newComment.trim()
      });
      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

const handleFileAttached = async (file) => {
    try {
      const updatedTask = await taskService.attachFile(task.Id, file);
      setAttachments(updatedTask.attachments || []);
      onTaskUpdated(updatedTask);
      toast.success('File attached successfully');
    } catch (error) {
      console.error('Failed to attach file:', error);
      toast.error('Failed to attach file');
    }
  };

  const handleFileRemoved = async (fileId) => {
    try {
      const updatedTask = await taskService.removeFile(task.Id, fileId);
      setAttachments(updatedTask.attachments || []);
      onTaskUpdated(updatedTask);
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Failed to remove file:', error);
      toast.error('Failed to remove file');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'done': return 'success';
      case 'in-progress': return 'primary';
      case 'todo': return 'warning';
      default: return 'default';
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  const assignedUser = getUserById(task?.assigneeId);

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const modalVariants = {
    open: { opacity: 1, scale: 1 },
    closed: { opacity: 0, scale: 0.95 }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="closed"
        animate="open"
        exit="closed"
        variants={backdropVariants}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => !loading && onClose()}
      />
      <motion.div
        initial="closed"
        animate="open"
        exit="closed"
        variants={modalVariants}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-200">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-surface-900">
                Task Details
              </h2>
              <Badge variant={getStatusVariant(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={editMode ? "X" : "Edit"}
                onClick={() => setEditMode(!editMode)}
                disabled={loading}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
              <button
                onClick={() => !loading && onClose()}
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                disabled={loading}
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              {/* Task Info */}
              <div className="space-y-4">
                {editMode ? (
                  <>
                    <FormField
                      name="title"
                      label="Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-surface-700">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
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
                          onChange={(e) => handleInputChange('assigneeId', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        >
                          <option value="">Unassigned</option>
                          {users.map(user => (
                            <option key={user.Id} value={user.Id}>{user.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        name="dueDate"
                        label="Due Date"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                      />
                      <FormField
                        name="progress"
                        label="Progress (%)"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-surface-900 mb-2">
                        {task.title}
                      </h3>
                      <p className="text-surface-600">{task.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="User" size={16} />
                          <span className="text-sm font-medium text-surface-700">Assignee</span>
                        </div>
                        {assignedUser ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={assignedUser.name} color={assignedUser.avatar} size="sm" />
                            <span className="text-surface-900">{assignedUser.name}</span>
                          </div>
                        ) : (
                          <span className="text-surface-500">Unassigned</span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Calendar" size={16} />
                          <span className="text-sm font-medium text-surface-700">Due Date</span>
                        </div>
                        <span className="text-surface-900">
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {task.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-surface-700">Progress</span>
                          <span className="text-sm text-surface-600">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-surface-200 rounded-full h-2">
                          <motion.div
                            className="h-2 bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-surface-200 pt-6">
                <h4 className="font-medium text-surface-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="MessageCircle" size={18} />
                  Comments ({comments.length})
                </h4>

                <div className="space-y-4">
                  {loadingComments ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-surface-100 rounded-lg p-3 h-16" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {comments.map((comment) => {
                        const author = getUserById(comment.authorId);
                        return (
                          <div key={comment.Id} className="flex gap-3 p-3 bg-surface-50 rounded-lg">
                            <Avatar name={author?.name} color={author?.avatar} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-surface-900 text-sm">
                                  {author?.name}
                                </span>
                                <span className="text-xs text-surface-500">
                                  {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <p className="text-surface-700 text-sm break-words">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Avatar name="John Doe" color="#5B4FE9" size="sm" />
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </Button>
</div>
                  </div>
                </div>
                </div>

                {/* File Attachments Section */}
                <div className="border-t border-surface-200 pt-6">
                  <h4 className="font-medium text-surface-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="Paperclip" size={18} />
                    File Attachments ({attachments.length})
                  </h4>
                  
                  <FileUpload
                    taskId={task.Id}
                    onFileAttached={handleFileAttached}
                    onFileRemoved={handleFileRemoved}
                    existingFiles={attachments}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            {editMode && (
              <div className="border-t border-surface-200 p-6">
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setEditMode(false)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    className="flex-1"
                  >
Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
};

export default TaskModal;