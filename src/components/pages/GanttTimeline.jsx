import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import GanttChart from '@/components/organisms/GanttChart';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { userService } from '@/services/api/userService';
import { projectService } from '@/services/api/projectService';

const GanttTimeline = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('project'); // 'project' or 'all'

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    } else {
      loadAllData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectData, projectTasks, allUsers] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProjectId(projectId),
        userService.getAll()
      ]);
      
      setProject(projectData);
      setTasks(projectTasks);
      setUsers(allUsers);
    } catch (err) {
      setError(err.message || 'Failed to load project data');
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allTasks, allUsers] = await Promise.all([
        taskService.getAll(),
        userService.getAll()
      ]);
      
      setTasks(allTasks);
      setUsers(allUsers);
      setViewMode('all');
    } catch (err) {
      setError(err.message || 'Failed to load timeline data');
      toast.error('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    if (project) {
      return `${project.name} Timeline`;
    }
    return 'Project Timeline';
  };

  const getPageDescription = () => {
    if (project) {
      return `Gantt chart view for ${project.name}`;
    }
    return 'View all project timelines and task dependencies';
  };

  const handleBackClick = () => {
    if (projectId) {
      navigate(`/project/${projectId}/kanban`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-surface-200 rounded w-64"></div>
        </div>
        <div className="bg-white rounded-lg border border-surface-200 p-8">
          <div className="space-y-4">
            <div className="h-12 bg-surface-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-64 h-16 bg-surface-200 rounded"></div>
                <div className="flex-1 h-8 bg-surface-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load timeline"
          message={error}
          onRetry={projectId ? loadProjectData : loadAllData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {projectId && (
            <button
              onClick={handleBackClick}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </button>
          )}
          <div>
            <h1 className="font-display font-bold text-2xl text-surface-900">
              {getPageTitle()}
            </h1>
            <p className="text-surface-600 mt-1">
              {getPageDescription()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {projectId && (
            <Button
              variant="ghost"
              icon="Kanban"
              onClick={() => navigate(`/project/${projectId}/kanban`)}
            >
              Board View
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-surface-600">
            <ApperIcon name="Calendar" size={16} />
            <span>{tasks.length} tasks</span>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {tasks.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="No timeline data"
          description={projectId 
            ? "This project doesn't have any tasks with dates yet. Create tasks with start and due dates to see the timeline."
            : "No projects have tasks with timeline data yet. Create projects and add tasks with dates to view the Gantt chart."
          }
          actionLabel={projectId ? "Add Tasks" : "View Projects"}
          onAction={() => {
            if (projectId) {
              navigate(`/project/${projectId}/kanban`);
            } else {
              navigate('/');
            }
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GanttChart tasks={tasks} users={users} />
        </motion.div>
      )}

      {/* Timeline Stats */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-lg border border-surface-200 p-6"
        >
          <h3 className="font-display font-semibold text-lg text-surface-900 mb-4">
            Timeline Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {tasks.filter(t => t.status === 'todo').length}
              </div>
              <div className="text-sm text-surface-600">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {tasks.filter(t => t.status === 'in-progress').length}
              </div>
              <div className="text-sm text-surface-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {tasks.filter(t => t.status === 'done').length}
              </div>
              <div className="text-sm text-surface-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-surface-700 mb-1">
                {tasks.filter(t => t.dependencies?.length > 0).length}
              </div>
              <div className="text-sm text-surface-600">Dependencies</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GanttTimeline;