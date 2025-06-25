import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import TaskCard from '@/components/molecules/TaskCard';
import SearchBar from '@/components/molecules/SearchBar';
import TaskModal from '@/components/organisms/TaskModal';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { userService } from '@/services/api/userService';
import { projectService } from '@/services/api/projectService';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const currentUserId = 1; // Mock current user ID

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allTasks, allUsers, allProjects] = await Promise.all([
        taskService.getAll(),
        userService.getAll(),
        projectService.getAll()
      ]);
      
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(task => task.assigneeId === currentUserId);
      
      setTasks(myTasks);
      setUsers(allUsers);
      setProjects(allProjects);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        const tomorrow = addDays(now, 1);
        
        switch (priorityFilter) {
          case 'overdue':
            return isBefore(dueDate, now);
          case 'due-soon':
            return isBefore(dueDate, tomorrow) && isAfter(dueDate, now);
          case 'upcoming':
            return isAfter(dueDate, tomorrow);
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ));
  };

  const getProjectById = (projectId) => {
    return projects.find(project => project.Id === projectId);
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  const getPriorityStats = () => {
    const now = new Date();
    const tomorrow = addDays(now, 1);
    
    return {
      overdue: tasks.filter(task => isBefore(new Date(task.dueDate), now)).length,
      dueSoon: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return isBefore(dueDate, tomorrow) && isAfter(dueDate, now);
      }).length,
      upcoming: tasks.filter(task => isAfter(new Date(task.dueDate), tomorrow)).length
    };
  };

  const stats = getPriorityStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-surface-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonLoader count={5} type="task" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-surface-200 rounded-lg"></div>
            <div className="h-48 bg-surface-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load tasks"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">
          My Tasks
        </h1>
        <p className="text-surface-600 mt-1">
          Track and manage your assigned tasks across all projects
        </p>
      </div>

      {/* Priority Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-surface-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-error/10">
              <ApperIcon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{stats.overdue}</p>
              <p className="text-sm text-surface-600">Overdue</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-surface-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <ApperIcon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{stats.dueSoon}</p>
              <p className="text-sm text-surface-600">Due Soon</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-surface-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ApperIcon name="Calendar" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{stats.upcoming}</p>
              <p className="text-sm text-surface-600">Upcoming</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-surface-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                placeholder="Search tasks..."
                onSearch={setSearchTerm}
                className="flex-1"
              />
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="overdue">Overdue</option>
                  <option value="due-soon">Due Soon</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon="CheckSquare"
              title="No tasks found"
              description={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "You don't have any assigned tasks yet. Tasks will appear here when they're assigned to you."
              }
              actionLabel="View All Projects"
              onAction={() => window.location.href = '/'}
            />
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TaskCard
                    task={task}
                    user={getUserById(task.assigneeId)}
                    onClick={() => handleTaskClick(task)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-surface-200 p-4">
            <h3 className="font-medium text-surface-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                icon="Filter"
                onClick={() => setPriorityFilter('overdue')}
                className="w-full justify-start"
              >
                Show Overdue Tasks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="Clock"
                onClick={() => setPriorityFilter('due-soon')}
                className="w-full justify-start"
              >
                Show Due Soon
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="CheckCircle"
                onClick={() => setStatusFilter('done')}
                className="w-full justify-start"
              >
                Show Completed
              </Button>
            </div>
          </div>

          {/* Project Overview */}
          <div className="bg-white rounded-lg border border-surface-200 p-4">
            <h3 className="font-medium text-surface-900 mb-4">Projects</h3>
            <div className="space-y-3">
              {projects.filter(project => 
                tasks.some(task => task.projectId === project.Id)
              ).map(project => {
                const projectTasks = tasks.filter(task => task.projectId === project.Id);
                const completedTasks = projectTasks.filter(task => task.status === 'done');
                
                return (
                  <div key={project.Id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 text-sm truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-surface-500">
                        {completedTasks.length}/{projectTasks.length} tasks completed
                      </p>
                    </div>
                    <Badge size="sm">
                      {projectTasks.length}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        task={selectedTask}
        users={users}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default MyTasks;