import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { userService } from '@/services/api/userService';
import { taskService } from '@/services/api/taskService';
import { projectService } from '@/services/api/projectService';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allUsers, allTasks, allProjects] = await Promise.all([
        userService.getAll(),
        taskService.getAll(),
        projectService.getAll()
      ]);
      
      setUsers(allUsers);
      setTasks(allTasks);
      setProjects(allProjects);
    } catch (err) {
      setError(err.message || 'Failed to load team data');
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(task => task.assigneeId === userId);
    const completedTasks = userTasks.filter(task => task.status === 'done');
    const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
    const overdueTasks = userTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      return task.status !== 'done' && dueDate < now;
    });

    const userProjects = [...new Set(userTasks.map(task => task.projectId))];

    return {
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      overdueTasks: overdueTasks.length,
      projectCount: userProjects.length,
      completionRate: userTasks.length ? Math.round((completedTasks.length / userTasks.length) * 100) : 0
    };
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'designer': return 'primary';
      case 'developer': return 'info';
      case 'marketing': return 'accent';
      case 'content-manager': return 'warning';
      case 'researcher': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    return role.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const teamStats = {
    totalMembers: users.length,
    activeMembers: users.filter(user => {
      const userTasks = tasks.filter(task => task.assigneeId === user.Id);
      return userTasks.some(task => task.status === 'in-progress');
    }).length,
    avgCompletionRate: users.length ? Math.round(
      users.reduce((sum, user) => sum + getUserStats(user.Id).completionRate, 0) / users.length
    ) : 0
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-surface-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} type="list" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load team data"
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
          Team
        </h1>
        <p className="text-surface-600 mt-1">
          View team members, their roles, and performance metrics
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-surface-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <ApperIcon name="Users" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{teamStats.totalMembers}</p>
              <p className="text-sm text-surface-600">Team Members</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-surface-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <ApperIcon name="UserCheck" size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{teamStats.activeMembers}</p>
              <p className="text-sm text-surface-600">Active Members</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-surface-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-info/10">
              <ApperIcon name="TrendingUp" size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{teamStats.avgCompletionRate}%</p>
              <p className="text-sm text-surface-600">Avg. Completion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <SearchBar
          placeholder="Search team members..."
          onSearch={setSearchTerm}
        />
      </div>

      {/* Team Members */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No team members found"
          description={searchTerm 
            ? "Try adjusting your search criteria" 
            : "No team members have been added yet"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => {
            const stats = getUserStats(user.Id);
            
            return (
              <motion.div
                key={user.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-surface-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar 
                    name={user.name} 
                    color={user.avatar} 
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-lg text-surface-900 truncate">
                      {user.name}
                    </h3>
                    <p className="text-surface-600 text-sm truncate">{user.email}</p>
                    <Badge variant={getRoleColor(user.role)} size="sm" className="mt-1">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600">Total Tasks</span>
                    <span className="font-medium text-surface-900">{stats.totalTasks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600">Completed</span>
                    <span className="font-medium text-success">{stats.completedTasks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600">In Progress</span>
                    <span className="font-medium text-primary">{stats.inProgressTasks}</span>
                  </div>
                  
                  {stats.overdueTasks > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-surface-600">Overdue</span>
                      <span className="font-medium text-error">{stats.overdueTasks}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-600">Projects</span>
                    <span className="font-medium text-surface-900">{stats.projectCount}</span>
                  </div>

                  <div className="pt-3 border-t border-surface-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-surface-700">Completion Rate</span>
                      <span className="text-sm font-bold text-surface-900">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-2">
                      <motion.div
                        className="h-2 bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.completionRate}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;