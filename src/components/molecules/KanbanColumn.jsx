import { motion } from 'framer-motion';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const KanbanColumn = ({ 
  column, 
  tasks = [], 
  users = [], 
  onTaskClick, 
  onAddTask,
  isSelectionMode = false,
  selectedTasks = [],
  onTaskSelect,
  isTaskSelected
}) => {
  const getColumnColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-surface-100 border-surface-300';
      case 'in-progress': return 'bg-primary/5 border-primary/20';
      case 'done': return 'bg-success/5 border-success/20';
      default: return 'bg-surface-100 border-surface-300';
    }
  };

  const getColumnIcon = (status) => {
    switch (status) {
      case 'todo': return 'Circle';
      case 'in-progress': return 'PlayCircle';
      case 'done': return 'CheckCircle';
      default: return 'Circle';
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  return (
    <div className="flex flex-col h-full min-w-80">
      {/* Column Header */}
      <div className={`
        rounded-lg p-4 mb-4 border-2 border-dashed
        ${getColumnColor(column.id)}
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ApperIcon name={getColumnIcon(column.id)} size={18} />
            <h3 className="font-display font-semibold text-surface-900">
              {column.title}
            </h3>
            <span className="bg-surface-200 text-surface-600 text-xs px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          icon="Plus"
          onClick={() => onAddTask(column.id)}
          className="w-full justify-center text-surface-600 hover:text-surface-900"
        >
          Add Task
        </Button>
      </div>

      {/* Tasks Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 space-y-3 p-2 rounded-lg transition-colors
              ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}
            `}
          >
            {tasks.map((task, index) => (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
<TaskCard
                  task={task}
                  user={getUserById(task.assigneeId)}
                  onClick={() => onTaskClick(task)}
                  isSelectionMode={isSelectionMode}
                  isSelected={isTaskSelected && isTaskSelected(task)}
                  onSelect={(isSelected) => onTaskSelect && onTaskSelect(task, isSelected)}
                />
              </motion.div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;