import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import ProjectCard from '@/components/molecules/ProjectCard';
import SearchBar from '@/components/molecules/SearchBar';
import CreateProjectModal from '@/components/organisms/CreateProjectModal';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { projectService } from '@/services/api/projectService';

const ProjectsOverview = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.getAll();
      setProjects(result);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const getStatusCount = (status) => {
    return projects.filter(p => p.status === status).length;
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, color: 'text-primary', icon: 'Folder' },
    { label: 'In Progress', value: getStatusCount('in-progress'), color: 'text-primary', icon: 'PlayCircle' },
    { label: 'Completed', value: getStatusCount('completed'), color: 'text-success', icon: 'CheckCircle' },
    { label: 'Planning', value: getStatusCount('planning'), color: 'text-warning', icon: 'Circle' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-surface-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load projects"
          message={error}
          onRetry={loadProjects}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">
            Projects
          </h1>
          <p className="text-surface-600 mt-1">
            Manage and track your team's projects
          </p>
        </div>
        <Button
          icon="Plus"
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-surface-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-surface-100`}>
                <ApperIcon name={stat.icon} size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-600">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            placeholder="Search projects..."
            onSearch={setSearchTerm}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon="Folder"
          title="No projects found"
          description={searchTerm || statusFilter !== 'all' 
            ? "Try adjusting your search or filter criteria" 
            : "Create your first project to get started with team collaboration"
          }
          actionLabel="Create Project"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectsOverview;