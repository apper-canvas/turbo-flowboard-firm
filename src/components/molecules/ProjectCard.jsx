import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressRing from '@/components/atoms/ProgressRing';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'planning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'planning': return 'Planning';
      default: return status;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => navigate(`/project/${project.Id}/kanban`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-surface-900 mb-2">
            {project.name}
          </h3>
          <p className="text-surface-600 text-sm line-clamp-2 mb-3">
            {project.description}
          </p>
          <Badge variant={getStatusVariant(project.status)} size="sm">
            {getStatusLabel(project.status)}
          </Badge>
        </div>
        <ProgressRing progress={project.progress} size={50} strokeWidth={3} />
      </div>

      <div className="flex items-center justify-between text-sm text-surface-500">
        <div className="flex items-center gap-1">
          <ApperIcon name="Calendar" size={14} />
          <span>Updated {format(new Date(project.updatedAt), 'MMM d')}</span>
        </div>
        <div className="flex items-center gap-1">
          <ApperIcon name="ArrowRight" size={14} />
          <span>View Project</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;